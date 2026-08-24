/**
 * ALTARA Phase 1 — Sync Engine (Moteur de réconciliation)
 * 
 * Module backend partagé entre sync.js (manuel) et cron-sync.js (automatique).
 * 
 * Responsabilités :
 * 1. Fetch + validation du feed iCal
 * 2. Parsing avec node-ical
 * 3. Réconciliation scopée (chalet_id + source) :
 *    - INSERT nouveaux événements
 *    - UPDATE événements modifiés
 *    - CANCEL événements disparus (status='cancelled', jamais DELETE)
 *    - REACTIVATE événements réapparus
 * 4. Enregistrement dans sync_runs
 * 5. Mise à jour de calendar_sources
 * 
 * CONTRAINTES :
 * - Un fetch iCal échoué ne modifie JAMAIS les réservations existantes (fail-safe)
 * - Un feed vide avec des réservations actives en base = warning, pas d'annulation
 * - La réconciliation est toujours scopée par chalet_id + source
 * - Idempotent : deux runs identiques = 0 changements
 */

import { createClient } from '@supabase/supabase-js';

// ===========================================================================
// CONFIGURATION
// ===========================================================================

const PLATFORM_COLORS = {
    airbnb: '#FF5A5F',
    booking: '#003580',
    vrbo: '#0066FF',
    mrchalet: '#8E44AD',
    direct: '#10B981',
    default: '#999999'
};

// Seuil de protection : si le feed est vide mais qu'il y a des réservations
// actives en base, on refuse d'annuler automatiquement
const EMPTY_FEED_PROTECTION_THRESHOLD = 0;

// Timeout pour le fetch iCal (ms)
const FETCH_TIMEOUT_MS = 30000;

// ===========================================================================
// SUPABASE CLIENT
// ===========================================================================

function getSupabaseAdmin() {
    const url = process.env.VITE_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        throw new Error('VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.');
    }

    return createClient(url, key, {
        auth: { persistSession: false }
    });
}

// ===========================================================================
// ICAL FETCHING & VALIDATION
// ===========================================================================

/**
 * Fetch and validate an iCal feed.
 * Returns { valid: true, rawText } or { valid: false, error }
 */
async function fetchAndValidateIcal(icalUrl) {
    // Dynamic import for node-ical and axios (Vercel serverless compatibility)
    const axios = await import('axios');
    const axiosGet = axios.default ? axios.default.get : axios.get;

    let response;
    try {
        response = await axiosGet(icalUrl, {
            timeout: FETCH_TIMEOUT_MS,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            // Accept both text/calendar and text/plain
            responseType: 'text'
        });
    } catch (fetchError) {
        return {
            valid: false,
            error: `Network error: ${fetchError.message}`,
            errorType: 'network'
        };
    }

    // Validate HTTP status
    if (response.status < 200 || response.status >= 300) {
        return {
            valid: false,
            error: `HTTP ${response.status}: ${response.statusText}`,
            errorType: 'http'
        };
    }

    const rawText = typeof response.data === 'string' ? response.data : String(response.data);

    // Validate it looks like an iCal file
    if (!rawText || !rawText.includes('BEGIN:VCALENDAR')) {
        return {
            valid: false,
            error: 'Response is not a valid iCal feed (missing BEGIN:VCALENDAR)',
            errorType: 'format'
        };
    }

    return { valid: true, rawText };
}

/**
 * Parse iCal text into an array of normalized events.
 */
async function parseIcalEvents(rawText, provider) {
    const nodeIcalModule = await import('node-ical');
    const nodeIcal = nodeIcalModule.default || nodeIcalModule;

    const parsed = await nodeIcal.async.parseICS(rawText);
    const color = PLATFORM_COLORS[provider] || PLATFORM_COLORS.default;

    const events = [];

    for (const key in parsed) {
        const event = parsed[key];
        if (event.type !== 'VEVENT') continue;

        const uid = event.uid;
        const start = event.start;
        const end = event.end;

        if (!uid || !start || !end) continue;

        // Determine if it's a blocked period vs a real booking
        let isBlocked = false;
        if (event.summary && (
            event.summary.toLowerCase().includes('not available') ||
            event.summary.toLowerCase().includes('blocked') ||
            event.summary.toLowerCase().includes('bloc') ||
            event.summary.toLowerCase().includes('airbnb (not available)')
        )) {
            isBlocked = true;
        }

        events.push({
            external_uid: uid,
            start_date: toDateString(start),
            end_date: toDateString(end),
            guest_name: isBlocked ? 'Période bloquée' : (event.summary || `${provider} Guest`),
            color: color,
            status: isBlocked ? 'blocked' : 'confirmed'
        });
    }

    return events;
}

// ===========================================================================
// CLEANING TASK HELPER
// ===========================================================================

/**
 * Ensures a cleaning_task exists for a newly created booking.
 * 
 * Anti-duplicate: checks if a cleaning_task with this booking_id already exists.
 * Errors are tracked but do NOT prevent the booking from being counted as created.
 * However, they DO mark the sync as having errors (hasErrors = true).
 * 
 * @param {object} supabase - Supabase admin client
 * @param {object} booking - The newly created booking { id, chalet_id, end_date, check_out }
 * @param {function} trackError - Error tracking function from reconcile
 * @returns {boolean} true if task was created or already existed, false on error
 */
async function ensureCleaningTaskForBooking(supabase, booking, trackError) {
    const bookingId = booking.id;
    const cleaningDate = booking.end_date || booking.check_out;

    if (!bookingId) {
        trackError('CLEANING_TASK', 'unknown', 'No booking id available after INSERT');
        return false;
    }

    if (!cleaningDate) {
        trackError('CLEANING_TASK_DATE', bookingId, 'No end_date or check_out available — cannot assign cleaning date');
        return false;
    }

    // Anti-duplicate check
    const { data: existing, error: checkError } = await supabase
        .from('cleaning_tasks')
        .select('id')
        .eq('booking_id', bookingId)
        .maybeSingle();

    if (checkError) {
        trackError('CLEANING_TASK_CHECK', bookingId, checkError.message);
        return false;
    }

    if (existing) {
        // Already exists — idempotent, no action needed
        return true;
    }

    // Create the cleaning task
    const { error: insertError } = await supabase
        .from('cleaning_tasks')
        .insert({
            chalet_id: booking.chalet_id,
            booking_id: bookingId,
            date: cleaningDate,
            status: 'pending',
            auto_generated: true
        });

    if (insertError) {
        // Race condition: another sync created the task between our SELECT and INSERT
        if (insertError.code === '23505') {
            console.warn(`[SyncEngine] Cleaning task for booking ${bookingId} already created by concurrent sync — OK`);
            return true;
        }
        trackError('CLEANING_TASK_INSERT', bookingId, insertError.message);
        return false;
    }

    console.log(`[SyncEngine] Created cleaning task for booking ${bookingId} on ${cleaningDate}`);
    return true;
}

// ===========================================================================
// RECONCILIATION ENGINE
// ===========================================================================

/**
 * Reconcile a set of iCal events against the existing bookings in Supabase.
 * 
 * Scoped by chalet_id + source — never touches other chalets or sources.
 * 
 * @param {object} supabase - Supabase admin client
 * @param {string} chaletId - Chalet UUID
 * @param {string} userId - Owner user UUID
 * @param {string} source - Platform provider (e.g., 'airbnb')
 * @param {Array} feedEvents - Parsed events from iCal feed
 * @returns {object} { created, updated, cancelled, unchanged, reactivated, cleaningTasksCreated, details }
 */
async function reconcile(supabase, chaletId, userId, source, feedEvents) {
    const result = {
        created: 0,
        updated: 0,
        cancelled: 0,
        unchanged: 0,
        reactivated: 0,
        dbErrors: 0,
        hasErrors: false,
        errorMessages: [],
        existingBookingsModified: false,
        cleaningTasksCreated: 0,
        details: []
    };

    /** Track a DB error */
    function trackError(operation, uid, errorMsg) {
        result.dbErrors++;
        result.hasErrors = true;
        result.errorMessages.push(`${operation} ${uid}: ${errorMsg}`);
        console.error(`[SyncEngine] ${operation} failed for ${uid}: ${errorMsg}`);
    }

    // 1. Load existing bookings for this chalet + source with external_uid
    const { data: existingBookings, error: fetchError } = await supabase
        .from('booking')
        .select('id, external_uid, start_date, end_date, guest_name, status, color')
        .eq('chalet_id', chaletId)
        .eq('source', source)
        .not('external_uid', 'is', null);

    if (fetchError) {
        throw new Error(`Failed to fetch existing bookings: ${fetchError.message}`);
    }

    // Build lookup maps
    const existingByUid = new Map();
    for (const b of (existingBookings || [])) {
        if (b.external_uid) {
            existingByUid.set(b.external_uid, b);
        }
    }

    const feedUids = new Set(feedEvents.map(e => e.external_uid));

    // 2. Process feed events (INSERT or UPDATE)
    for (const event of feedEvents) {
        const existing = existingByUid.get(event.external_uid);

        if (!existing) {
            // NEW — Insert (with .select() to get the id back for cleaning_task)
            const { data: insertedBooking, error: insertError } = await supabase
                .from('booking')
                .insert({
                    user_id: userId,
                    chalet_id: chaletId,
                    source: source,
                    external_uid: event.external_uid,
                    start_date: event.start_date,
                    end_date: event.end_date,
                    guest_name: event.guest_name,
                    color: event.color,
                    status: event.status,
                    check_in: event.start_date,
                    check_out: event.end_date
                })
                .select('id, chalet_id, end_date, check_out')
                .single();

            if (insertError) {
                // If it's a unique constraint violation, try update instead
                if (insertError.code === '23505') {
                    console.warn(`[SyncEngine] Duplicate key for ${event.external_uid}, attempting update instead.`);
                    const { error: updateError } = await supabase
                        .from('booking')
                        .update({
                            start_date: event.start_date,
                            end_date: event.end_date,
                            check_in: event.start_date,
                            check_out: event.end_date,
                            guest_name: event.guest_name,
                            color: event.color,
                            status: event.status
                        })
                        .eq('external_uid', event.external_uid)
                        .eq('chalet_id', chaletId)
                        .eq('source', source);

                    if (updateError) {
                        trackError('INSERT_FALLBACK_UPDATE', event.external_uid, updateError.message);
                    } else {
                        result.updated++;
                        result.existingBookingsModified = true;
                    }
                } else {
                    trackError('INSERT', event.external_uid, insertError.message);
                }
            } else {
                result.created++;
                result.existingBookingsModified = true;
                result.details.push({ action: 'created', uid: event.external_uid, dates: `${event.start_date} → ${event.end_date}` });

                // Auto-generate cleaning task for this new booking
                if (insertedBooking) {
                    const taskCreated = await ensureCleaningTaskForBooking(supabase, insertedBooking, trackError);
                    if (taskCreated) {
                        result.cleaningTasksCreated++;
                    }
                }
            }
        } else {
            // EXISTS — Check if update needed
            const datesChanged = existing.start_date !== event.start_date || existing.end_date !== event.end_date;
            const nameChanged = existing.guest_name !== event.guest_name;
            const wasCancelled = existing.status === 'cancelled';
            const statusChanged = existing.status !== event.status;

            if (wasCancelled) {
                // REACTIVATE — Previously cancelled, now back in feed
                const { error: reactivateError } = await supabase
                    .from('booking')
                    .update({
                        status: event.status,
                        start_date: event.start_date,
                        end_date: event.end_date,
                        check_in: event.start_date,
                        check_out: event.end_date,
                        guest_name: event.guest_name,
                        color: event.color
                    })
                    .eq('id', existing.id);

                if (reactivateError) {
                    trackError('REACTIVATE', event.external_uid, reactivateError.message);
                } else {
                    result.reactivated++;
                    result.existingBookingsModified = true;
                    result.details.push({ action: 'reactivated', uid: event.external_uid });
                }
            } else if (datesChanged || nameChanged || statusChanged) {
                // UPDATE — Dates or name changed
                const { error: updateError } = await supabase
                    .from('booking')
                    .update({
                        start_date: event.start_date,
                        end_date: event.end_date,
                        check_in: event.start_date,
                        check_out: event.end_date,
                        guest_name: event.guest_name,
                        color: event.color,
                        status: event.status
                    })
                    .eq('id', existing.id);

                if (updateError) {
                    trackError('UPDATE', event.external_uid, updateError.message);
                } else {
                    result.updated++;
                    result.existingBookingsModified = true;
                    result.details.push({ action: 'updated', uid: event.external_uid, changes: { datesChanged, nameChanged, statusChanged } });
                }
            } else {
                // UNCHANGED
                result.unchanged++;
            }
        }
    }

    // 3. Cancel bookings that are in DB but NOT in feed
    //    (scoped to this chalet + source only)
    for (const [uid, booking] of existingByUid) {
        if (!feedUids.has(uid) && booking.status !== 'cancelled') {
            const { error: cancelError } = await supabase
                .from('booking')
                .update({ status: 'cancelled' })
                .eq('id', booking.id);

            if (cancelError) {
                trackError('CANCEL', uid, cancelError.message);
            } else {
                result.cancelled++;
                result.existingBookingsModified = true;
                result.details.push({ action: 'cancelled', uid, dates: `${booking.start_date} → ${booking.end_date}` });
            }
        }
    }

    return result;
}

// ===========================================================================
// SYNC ORCHESTRATOR
// ===========================================================================

/**
 * Synchronize a single calendar source.
 * 
 * @param {object} supabase - Supabase admin client
 * @param {object} calendarSource - Row from calendar_sources table
 * @param {string} userId - Owner user UUID
 * @returns {object} Structured result
 */
async function syncOneSource(supabase, calendarSource, userId) {
    const { id: sourceId, chalet_id: chaletId, provider, ical_url: icalUrl } = calendarSource;
    const startedAt = new Date().toISOString();

    // Create sync_run record
    const { data: syncRun, error: runError } = await supabase
        .from('sync_runs')
        .insert({
            calendar_source_id: sourceId,
            started_at: startedAt,
            status: 'running'
        })
        .select('id')
        .single();

    if (runError) {
        console.error(`[SyncEngine] Failed to create sync_run: ${runError.message}`);
        // Continue anyway — the sync itself is more important than the log
    }

    const syncRunId = syncRun?.id;

    try {
        // 1. Fetch & Validate
        console.log(`[SyncEngine] Fetching ${provider} for chalet ${chaletId}...`);
        const fetchResult = await fetchAndValidateIcal(icalUrl);

        if (!fetchResult.valid) {
            // FAIL-SAFE: fetch failed, do NOT touch existing bookings
            const errorResult = {
                success: false,
                source: provider,
                chaletId,
                error: fetchResult.error,
                errorType: fetchResult.errorType,
                existingBookingsModified: false
            };

            await finalizeSyncRun(supabase, syncRunId, sourceId, 'error', 0, {}, fetchResult.error);
            return errorResult;
        }

        // 2. Parse
        let feedEvents;
        try {
            feedEvents = await parseIcalEvents(fetchResult.rawText, provider);
        } catch (parseError) {
            const errorResult = {
                success: false,
                source: provider,
                chaletId,
                error: `Parse error: ${parseError.message}`,
                errorType: 'parse',
                existingBookingsModified: false
            };

            await finalizeSyncRun(supabase, syncRunId, sourceId, 'error', 0, {}, parseError.message);
            return errorResult;
        }

        // 3. Empty feed protection
        if (feedEvents.length === 0) {
            // Check how many active bookings exist for this source
            const { data: activeBookings } = await supabase
                .from('booking')
                .select('id', { count: 'exact', head: true })
                .eq('chalet_id', chaletId)
                .eq('source', provider)
                .not('external_uid', 'is', null)
                .neq('status', 'cancelled');

            const activeCount = activeBookings?.length || 0;

            if (activeCount > EMPTY_FEED_PROTECTION_THRESHOLD) {
                console.warn(`[SyncEngine] Empty feed for ${provider} but ${activeCount} active bookings in DB — SKIPPING cancellations (fail-safe).`);
                
                const warningResult = {
                    success: true,
                    source: provider,
                    chaletId,
                    eventsReceived: 0,
                    created: 0,
                    updated: 0,
                    cancelled: 0,
                    unchanged: activeCount,
                    warning: `Empty feed with ${activeCount} active bookings — no cancellations applied (fail-safe protection)`,
                    syncedAt: new Date().toISOString()
                };

                await finalizeSyncRun(supabase, syncRunId, sourceId, 'warning', 0, warningResult, warningResult.warning);
                return warningResult;
            }
        }

        // 4. Reconcile
        console.log(`[SyncEngine] Reconciling ${feedEvents.length} events for ${provider}...`);
        const reconcileResult = await reconcile(supabase, chaletId, userId, provider, feedEvents);

        // 5. Check for partial DB errors
        //    A sync with DB errors is NEVER declared successful.
        if (reconcileResult.hasErrors) {
            console.error(`[SyncEngine] ${provider} sync had ${reconcileResult.dbErrors} DB error(s).`);

            const errorSummary = reconcileResult.errorMessages.slice(0, 5).join('; ');
            await finalizeSyncRun(supabase, syncRunId, sourceId, 'error', feedEvents.length, reconcileResult, errorSummary);

            return {
                success: false,
                source: provider,
                chaletId,
                eventsReceived: feedEvents.length,
                created: reconcileResult.created,
                updated: reconcileResult.updated,
                cancelled: reconcileResult.cancelled,
                unchanged: reconcileResult.unchanged,
                reactivated: reconcileResult.reactivated,
                dbErrors: reconcileResult.dbErrors,
                error: `Reconciliation completed with ${reconcileResult.dbErrors} DB error(s): ${errorSummary}`,
                existingBookingsModified: reconcileResult.existingBookingsModified,
                cleaningTasksCreated: reconcileResult.cleaningTasksCreated,
                syncedAt: new Date().toISOString()
            };
        }

        // 6. Full success
        const syncResult = {
            success: true,
            source: provider,
            chaletId,
            eventsReceived: feedEvents.length,
            created: reconcileResult.created,
            updated: reconcileResult.updated,
            cancelled: reconcileResult.cancelled,
            unchanged: reconcileResult.unchanged,
            reactivated: reconcileResult.reactivated,
            existingBookingsModified: reconcileResult.existingBookingsModified,
            cleaningTasksCreated: reconcileResult.cleaningTasksCreated,
            syncedAt: new Date().toISOString()
        };

        await finalizeSyncRun(supabase, syncRunId, sourceId, 'success', feedEvents.length, reconcileResult, null);

        console.log(`[SyncEngine] ${provider} sync complete: +${reconcileResult.created} ~${reconcileResult.updated} -${reconcileResult.cancelled} =${reconcileResult.unchanged}`);

        return syncResult;

    } catch (error) {
        console.error(`[SyncEngine] Unexpected error for ${provider}: ${error.message}`);
        
        await finalizeSyncRun(supabase, syncRunId, sourceId, 'error', 0, {}, error.message);

        return {
            success: false,
            source: provider,
            chaletId,
            error: error.message,
            existingBookingsModified: false
        };
    }
}

/**
 * Finalize a sync_run and update calendar_sources.
 */
async function finalizeSyncRun(supabase, syncRunId, sourceId, status, eventsReceived, result, errorMessage) {
    const now = new Date().toISOString();

    // Update sync_run
    if (syncRunId) {
        await supabase
            .from('sync_runs')
            .update({
                finished_at: now,
                status,
                events_received: eventsReceived,
                created_count: result.created || 0,
                updated_count: result.updated || 0,
                cancelled_count: result.cancelled || 0,
                unchanged_count: result.unchanged || 0,
                error_message: errorMessage
            })
            .eq('id', syncRunId);
    }

    // Update calendar_sources
    const sourceUpdate = {
        last_sync_attempt_at: now,
        last_sync_status: status,
        last_sync_error: errorMessage || null,
        last_event_count: eventsReceived
    };

    if (status === 'success') {
        sourceUpdate.last_successful_sync_at = now;
    }

    await supabase
        .from('calendar_sources')
        .update(sourceUpdate)
        .eq('id', sourceId);
}

// ===========================================================================
// PUBLIC API
// ===========================================================================

/**
 * Sync a specific chalet + source.
 * Used by the manual "Sync Now" button.
 */
export async function syncChaletSource(chaletId, provider) {
    const supabase = getSupabaseAdmin();

    // Resolve calendar_source
    const { data: source, error } = await supabase
        .from('calendar_sources')
        .select('*')
        .eq('chalet_id', chaletId)
        .eq('provider', provider)
        .eq('enabled', true)
        .single();

    if (error || !source) {
        return {
            success: false,
            source: provider,
            chaletId,
            error: `No active calendar source found for ${provider} on chalet ${chaletId}`,
            existingBookingsModified: false
        };
    }

    // Get chalet owner
    const { data: chalet } = await supabase
        .from('chalets')
        .select('user_id')
        .eq('id', chaletId)
        .single();

    if (!chalet) {
        return { success: false, error: 'Chalet not found', existingBookingsModified: false };
    }

    return syncOneSource(supabase, source, chalet.user_id);
}

/**
 * Sync all enabled sources for a specific chalet.
 */
export async function syncChalet(chaletId) {
    const supabase = getSupabaseAdmin();

    const { data: sources, error } = await supabase
        .from('calendar_sources')
        .select('*')
        .eq('chalet_id', chaletId)
        .eq('enabled', true);

    if (error || !sources || sources.length === 0) {
        return { success: true, results: [], message: 'No enabled calendar sources found.' };
    }

    // Get chalet owner
    const { data: chalet } = await supabase
        .from('chalets')
        .select('user_id')
        .eq('id', chaletId)
        .single();

    if (!chalet) {
        return { success: false, error: 'Chalet not found' };
    }

    const results = [];
    for (const source of sources) {
        const result = await syncOneSource(supabase, source, chalet.user_id);
        results.push(result);
    }

    return {
        success: results.every(r => r.success),
        results,
        syncedAt: new Date().toISOString()
    };
}

/**
 * Sync all enabled sources for ALL chalets.
 * Used by the cron job.
 */
export async function syncAllChalets() {
    const supabase = getSupabaseAdmin();

    // Get all enabled sources with their chalet info
    const { data: sources, error } = await supabase
        .from('calendar_sources')
        .select('*, chalets!inner(user_id)')
        .eq('enabled', true);

    if (error) {
        return { success: false, error: error.message };
    }

    if (!sources || sources.length === 0) {
        return { success: true, results: [], message: 'No enabled calendar sources found.' };
    }

    const results = [];
    for (const source of sources) {
        const userId = source.chalets?.user_id;
        if (!userId) {
            console.warn(`[SyncEngine] Source ${source.id} has no associated user_id, skipping.`);
            continue;
        }

        const result = await syncOneSource(supabase, source, userId);
        results.push(result);
    }

    return {
        success: results.every(r => r.success),
        totalSources: sources.length,
        results,
        syncedAt: new Date().toISOString()
    };
}

/**
 * Ensure calendar_sources are populated from chalets.connections.
 * Bridge function: reads the legacy connections JSONB and creates/updates
 * calendar_sources rows. This allows the new sync engine to work with
 * the existing chalets.connections data.
 */
export async function bootstrapCalendarSources(chaletId) {
    const supabase = getSupabaseAdmin();

    const { data: chalet, error } = await supabase
        .from('chalets')
        .select('id, user_id, connections')
        .eq('id', chaletId)
        .single();

    if (error || !chalet) {
        return { success: false, error: 'Chalet not found' };
    }

    const connections = chalet.connections || {};
    const results = [];

    for (const [provider, icalUrl] of Object.entries(connections)) {
        if (!icalUrl || provider === 'direct') continue; // Skip empty URLs and 'direct'

        const { data, error: upsertError } = await supabase
            .from('calendar_sources')
            .upsert({
                chalet_id: chalet.id,
                provider,
                ical_url: icalUrl,
                enabled: true
            }, { onConflict: 'chalet_id,provider' })
            .select()
            .single();

        if (upsertError) {
            console.error(`[SyncEngine] Bootstrap failed for ${provider}: ${upsertError.message}`);
            results.push({ provider, success: false, error: upsertError.message });
        } else {
            results.push({ provider, success: true, sourceId: data.id });
        }
    }

    return { success: true, sources: results };
}

// ===========================================================================
// UTILITIES
// ===========================================================================

function toDateString(date) {
    if (!date) return null;
    if (typeof date === 'string') {
        // If already YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
        // Try parsing
        return new Date(date).toISOString().split('T')[0];
    }
    return date.toISOString().split('T')[0];
}
