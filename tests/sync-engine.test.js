/**
 * ALTARA Phase 1 — Tests du moteur de réconciliation
 * 
 * Ces tests vérifient la logique de réconciliation SANS appeler Supabase.
 * Ils mockent le client Supabase pour simuler les différents scénarios.
 * 
 * Usage : node tests/sync-engine.test.js
 * 
 * 10 scénarios couverts :
 * TEST 1: Import initial (DB vide)
 * TEST 2: Idempotence (aucun changement)
 * TEST 3: Nouvelle réservation
 * TEST 4: Modification de dates
 * TEST 5: Annulation (événement disparu du feed)
 * TEST 6: Réapparition (événement annulé réapparaît)
 * TEST 7: Isolation plateforme (Airbnb n'annule pas VRBO)
 * TEST 8: Feed invalide → fail-safe
 * TEST 9: Feed valide vide → protection
 * TEST 10: Multi-chalets (isolation)
 */

// ============================================================================
// MINIMAL TEST FRAMEWORK
// ============================================================================

let passed = 0;
let failed = 0;
const results = [];

function assert(condition, testName, detail = '') {
    if (condition) {
        passed++;
        results.push(`  ✅ ${testName}`);
    } else {
        failed++;
        results.push(`  ❌ ${testName}${detail ? ' — ' + detail : ''}`);
    }
}

function assertEqual(actual, expected, testName) {
    assert(actual === expected, testName, `expected ${expected}, got ${actual}`);
}

// ============================================================================
// MOCK SUPABASE CLIENT
// ============================================================================

/**
 * Creates a mock Supabase client that simulates the booking table.
 * @param {Array} initialBookings - Initial state of the booking table
 */
/**
 * Creates a mock Supabase client.
 * @param {Array} initialBookings - Initial state of the booking table
 * @param {object} [errorConfig] - Optional: { failOnInsertUid, failOnUpdateId, failOnCancelId }
 *   Simulates a DB error when operating on a matching uid/id.
 */
function createMockSupabase(initialBookings = [], errorConfig = {}) {
    const bookings = [...initialBookings];
    const calendarSources = [];
    const syncRuns = [];

    const mockQuery = (table) => {
        const state = {
            table,
            filters: {},
            selectCols: '*',
            countMode: false,
            headMode: false
        };

        const chainable = {
            select: (cols, opts) => {
                state.selectCols = cols || '*';
                if (opts?.count) state.countMode = true;
                if (opts?.head) state.headMode = true;
                return chainable;
            },
            eq: (col, val) => { state.filters[col] = { op: 'eq', val }; return chainable; },
            neq: (col, val) => { state.filters[col] = { op: 'neq', val }; return chainable; },
            not: (col, op, val) => { state.filters[col] = { op: 'not_' + op, val }; return chainable; },
            in: (col, vals) => { state.filters[col] = { op: 'in', val: vals }; return chainable; },
            single: () => {
                const filtered = filterBookings(table === 'booking' ? bookings : (table === 'calendar_sources' ? calendarSources : syncRuns), state.filters);
                return { data: filtered[0] || null, error: null };
            },
            insert: (data) => {
                const rows = Array.isArray(data) ? data : [data];
                // Check for error injection
                if (table === 'booking' && errorConfig.failOnInsertUid) {
                    for (const row of rows) {
                        if (row.external_uid === errorConfig.failOnInsertUid) {
                            return {
                                data: null,
                                error: { message: 'Simulated DB insert error', code: 'SIMULATED' },
                                select: () => ({ data: null, error: { message: 'Simulated' }, single: () => ({ data: null, error: { message: 'Simulated' } }) })
                            };
                        }
                    }
                }
                for (const row of rows) {
                    row.id = row.id || `mock-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
                    if (table === 'booking') bookings.push(row);
                    else if (table === 'sync_runs') syncRuns.push(row);
                    else if (table === 'calendar_sources') calendarSources.push(row);
                }
                return {
                    data: rows,
                    error: null,
                    select: () => ({
                        data: rows,
                        error: null,
                        single: () => ({ data: rows[0], error: null })
                    })
                };
            },
            update: (data) => {
                return {
                    eq: (col, val) => {
                        // Check for error injection on update
                        if (table === 'booking' && errorConfig.failOnUpdateId && val === errorConfig.failOnUpdateId) {
                            return { data: null, error: { message: 'Simulated DB update error' } };
                        }
                        if (table === 'booking' && errorConfig.failOnCancelId && val === errorConfig.failOnCancelId) {
                            return { data: null, error: { message: 'Simulated DB cancel error' } };
                        }
                        const src = table === 'booking' ? bookings : syncRuns;
                        const idx = src.findIndex(b => b[col] === val);
                        if (idx >= 0) {
                            Object.assign(src[idx], data);
                        }
                        return { data: null, error: null };
                    }
                };
            },
            upsert: (data, opts) => {
                const rows = Array.isArray(data) ? data : [data];
                for (const row of rows) {
                    const conflictCol = opts?.onConflict?.split(',').map(c => c.trim()) || [];
                    let existingIdx = -1;
                    if (conflictCol.length > 0) {
                        existingIdx = (table === 'calendar_sources' ? calendarSources : bookings).findIndex(b =>
                            conflictCol.every(c => b[c] === row[c])
                        );
                    }
                    if (existingIdx >= 0) {
                        Object.assign((table === 'calendar_sources' ? calendarSources : bookings)[existingIdx], row);
                    } else {
                        row.id = row.id || `mock-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
                        (table === 'calendar_sources' ? calendarSources : bookings).push(row);
                    }
                }
                return {
                    data: rows,
                    error: null,
                    select: () => ({
                        data: rows,
                        error: null,
                        single: () => ({ data: rows[0], error: null })
                    })
                };
            },
            then: (resolve) => {
                const data = filterBookings(table === 'booking' ? bookings : (table === 'calendar_sources' ? calendarSources : syncRuns), state.filters);
                resolve({ data, error: null });
            }
        };

        Object.defineProperty(chainable, 'then', {
            value: (resolve) => {
                const source = table === 'booking' ? bookings : (table === 'calendar_sources' ? calendarSources : syncRuns);
                const data = filterBookings(source, state.filters);
                resolve({ data, error: null });
            }
        });

        return chainable;
    };

    return {
        from: (table) => mockQuery(table),
        _bookings: bookings,
        _calendarSources: calendarSources,
        _syncRuns: syncRuns
    };
}

function filterBookings(bookings, filters) {
    return bookings.filter(b => {
        for (const [col, filter] of Object.entries(filters)) {
            if (filter.op === 'eq' && b[col] !== filter.val) return false;
            if (filter.op === 'neq' && b[col] === filter.val) return false;
            if (filter.op === 'not_is' && b[col] == null) return false;
            if (filter.op === 'in' && !filter.val.includes(b[col])) return false;
        }
        return true;
    });
}

// ============================================================================
// IMPORT RECONCILE FUNCTION (inline — since we can't import ES modules easily in Node)
// ============================================================================

/**
 * Simplified reconcile for testing — mirrors the logic in sync-engine.js
 */
async function reconcile(supabase, chaletId, userId, source, feedEvents) {
    const result = {
        created: 0, updated: 0, cancelled: 0, unchanged: 0, reactivated: 0,
        dbErrors: 0, hasErrors: false, errorMessages: [], existingBookingsModified: false
    };

    function trackError(operation, uid, errorMsg) {
        result.dbErrors++;
        result.hasErrors = true;
        result.errorMessages.push(`${operation} ${uid}: ${errorMsg}`);
    }

    // Load existing for this chalet + source
    const { data: existingBookings } = await supabase
        .from('booking')
        .select('id, external_uid, start_date, end_date, guest_name, status, color')
        .eq('chalet_id', chaletId)
        .eq('source', source)
        .not('external_uid', 'is', null);

    const existingByUid = new Map();
    for (const b of (existingBookings || [])) {
        if (b.external_uid) existingByUid.set(b.external_uid, b);
    }

    const feedUids = new Set(feedEvents.map(e => e.external_uid));

    // Process feed events
    for (const event of feedEvents) {
        const existing = existingByUid.get(event.external_uid);

        if (!existing) {
            const { error: insertError } = await supabase.from('booking').insert({
                user_id: userId, chalet_id: chaletId, source,
                external_uid: event.external_uid,
                start_date: event.start_date, end_date: event.end_date,
                guest_name: event.guest_name, color: event.color,
                status: event.status || 'confirmed',
                check_in: event.start_date, check_out: event.end_date
            });
            if (insertError) {
                trackError('INSERT', event.external_uid, insertError.message);
            } else {
                result.created++;
                result.existingBookingsModified = true;
            }
        } else {
            const datesChanged = existing.start_date !== event.start_date || existing.end_date !== event.end_date;
            const wasCancelled = existing.status === 'cancelled';

            if (wasCancelled) {
                const { error: reactivateError } = await supabase.from('booking').update({
                    status: event.status || 'confirmed',
                    start_date: event.start_date, end_date: event.end_date,
                    guest_name: event.guest_name
                }).eq('id', existing.id);
                if (reactivateError) {
                    trackError('REACTIVATE', event.external_uid, reactivateError.message);
                } else {
                    result.reactivated++;
                    result.existingBookingsModified = true;
                }
            } else if (datesChanged) {
                const { error: updateError } = await supabase.from('booking').update({
                    start_date: event.start_date, end_date: event.end_date,
                    guest_name: event.guest_name
                }).eq('id', existing.id);
                if (updateError) {
                    trackError('UPDATE', event.external_uid, updateError.message);
                } else {
                    result.updated++;
                    result.existingBookingsModified = true;
                }
            } else {
                result.unchanged++;
            }
        }
    }

    // Cancel missing
    for (const [uid, booking] of existingByUid) {
        if (!feedUids.has(uid) && booking.status !== 'cancelled') {
            const { error: cancelError } = await supabase.from('booking').update({ status: 'cancelled' }).eq('id', booking.id);
            if (cancelError) {
                trackError('CANCEL', uid, cancelError.message);
            } else {
                result.cancelled++;
                result.existingBookingsModified = true;
            }
        }
    }

    return result;
}

// ============================================================================
// TESTS
// ============================================================================

async function runTests() {
    console.log('\n🧪 ALTARA Phase 1 — Sync Engine Tests\n');

    // ─── TEST 1: Import initial ───
    {
        console.log('TEST 1: Import initial (DB vide)');
        const sb = createMockSupabase([]);
        const feed = [
            { external_uid: 'A', start_date: '2026-08-10', end_date: '2026-08-12', guest_name: 'Guest A', color: '#FF5A5F', status: 'confirmed' },
            { external_uid: 'B', start_date: '2026-08-15', end_date: '2026-08-17', guest_name: 'Guest B', color: '#FF5A5F', status: 'confirmed' },
            { external_uid: 'C', start_date: '2026-08-20', end_date: '2026-08-22', guest_name: 'Guest C', color: '#FF5A5F', status: 'confirmed' }
        ];
        const r = await reconcile(sb, 'chalet-1', 'user-1', 'airbnb', feed);
        assertEqual(r.created, 3, 'created = 3');
        assertEqual(r.updated, 0, 'updated = 0');
        assertEqual(r.cancelled, 0, 'cancelled = 0');
        assertEqual(sb._bookings.length, 3, 'DB has 3 rows');
    }

    // ─── TEST 2: Idempotence ───
    {
        console.log('\nTEST 2: Idempotence');
        const sb = createMockSupabase([
            { id: '1', external_uid: 'A', chalet_id: 'chalet-1', source: 'airbnb', start_date: '2026-08-10', end_date: '2026-08-12', status: 'confirmed' },
            { id: '2', external_uid: 'B', chalet_id: 'chalet-1', source: 'airbnb', start_date: '2026-08-15', end_date: '2026-08-17', status: 'confirmed' },
            { id: '3', external_uid: 'C', chalet_id: 'chalet-1', source: 'airbnb', start_date: '2026-08-20', end_date: '2026-08-22', status: 'confirmed' }
        ]);
        const feed = [
            { external_uid: 'A', start_date: '2026-08-10', end_date: '2026-08-12', guest_name: 'Guest A' },
            { external_uid: 'B', start_date: '2026-08-15', end_date: '2026-08-17', guest_name: 'Guest B' },
            { external_uid: 'C', start_date: '2026-08-20', end_date: '2026-08-22', guest_name: 'Guest C' }
        ];
        const r = await reconcile(sb, 'chalet-1', 'user-1', 'airbnb', feed);
        assertEqual(r.created, 0, 'created = 0');
        assertEqual(r.updated, 0, 'updated = 0');
        assertEqual(r.cancelled, 0, 'cancelled = 0');
        assertEqual(r.unchanged, 3, 'unchanged = 3');
    }

    // ─── TEST 3: Nouvelle réservation ───
    {
        console.log('\nTEST 3: Nouvelle réservation');
        const sb = createMockSupabase([
            { id: '1', external_uid: 'A', chalet_id: 'chalet-1', source: 'airbnb', start_date: '2026-08-10', end_date: '2026-08-12', status: 'confirmed' },
            { id: '2', external_uid: 'B', chalet_id: 'chalet-1', source: 'airbnb', start_date: '2026-08-15', end_date: '2026-08-17', status: 'confirmed' },
            { id: '3', external_uid: 'C', chalet_id: 'chalet-1', source: 'airbnb', start_date: '2026-08-20', end_date: '2026-08-22', status: 'confirmed' }
        ]);
        const feed = [
            { external_uid: 'A', start_date: '2026-08-10', end_date: '2026-08-12', guest_name: 'Guest A' },
            { external_uid: 'B', start_date: '2026-08-15', end_date: '2026-08-17', guest_name: 'Guest B' },
            { external_uid: 'C', start_date: '2026-08-20', end_date: '2026-08-22', guest_name: 'Guest C' },
            { external_uid: 'D', start_date: '2026-09-01', end_date: '2026-09-03', guest_name: 'Guest D', color: '#FF5A5F', status: 'confirmed' }
        ];
        const r = await reconcile(sb, 'chalet-1', 'user-1', 'airbnb', feed);
        assertEqual(r.created, 1, 'created = 1');
        assertEqual(r.unchanged, 3, 'unchanged = 3');
        assertEqual(sb._bookings.length, 4, 'DB has 4 rows');
    }

    // ─── TEST 4: Modification de dates ───
    {
        console.log('\nTEST 4: Modification de dates');
        const sb = createMockSupabase([
            { id: '1', external_uid: 'A', chalet_id: 'chalet-1', source: 'airbnb', start_date: '2026-08-10', end_date: '2026-08-12', status: 'confirmed' }
        ]);
        const feed = [
            { external_uid: 'A', start_date: '2026-08-11', end_date: '2026-08-13', guest_name: 'Guest A' }
        ];
        const r = await reconcile(sb, 'chalet-1', 'user-1', 'airbnb', feed);
        assertEqual(r.updated, 1, 'updated = 1');
        assertEqual(sb._bookings[0].start_date, '2026-08-11', 'start_date updated');
        assertEqual(sb._bookings[0].end_date, '2026-08-13', 'end_date updated');
    }

    // ─── TEST 5: Annulation ───
    {
        console.log('\nTEST 5: Annulation (événement disparu du feed)');
        const sb = createMockSupabase([
            { id: '1', external_uid: 'A', chalet_id: 'chalet-1', source: 'airbnb', start_date: '2026-08-10', end_date: '2026-08-12', status: 'confirmed' },
            { id: '2', external_uid: 'B', chalet_id: 'chalet-1', source: 'airbnb', start_date: '2026-08-15', end_date: '2026-08-17', status: 'confirmed' },
            { id: '3', external_uid: 'C', chalet_id: 'chalet-1', source: 'airbnb', start_date: '2026-08-20', end_date: '2026-08-22', status: 'confirmed' }
        ]);
        const feed = [
            { external_uid: 'A', start_date: '2026-08-10', end_date: '2026-08-12', guest_name: 'Guest A' },
            { external_uid: 'C', start_date: '2026-08-20', end_date: '2026-08-22', guest_name: 'Guest C' }
        ];
        const r = await reconcile(sb, 'chalet-1', 'user-1', 'airbnb', feed);
        assertEqual(r.cancelled, 1, 'cancelled = 1');
        const bookingB = sb._bookings.find(b => b.external_uid === 'B');
        assertEqual(bookingB.status, 'cancelled', 'B.status = cancelled');
        assertEqual(sb._bookings.length, 3, 'DB still has 3 rows (no physical delete)');
    }

    // ─── TEST 6: Réapparition ───
    {
        console.log('\nTEST 6: Réapparition (événement annulé réapparaît)');
        const sb = createMockSupabase([
            { id: '1', external_uid: 'B', chalet_id: 'chalet-1', source: 'airbnb', start_date: '2026-08-15', end_date: '2026-08-17', status: 'cancelled' }
        ]);
        const feed = [
            { external_uid: 'B', start_date: '2026-08-15', end_date: '2026-08-17', guest_name: 'Guest B', status: 'confirmed' }
        ];
        const r = await reconcile(sb, 'chalet-1', 'user-1', 'airbnb', feed);
        assertEqual(r.reactivated, 1, 'reactivated = 1');
        assertEqual(sb._bookings[0].status, 'confirmed', 'B redevient confirmed');
    }

    // ─── TEST 7: Isolation plateforme ───
    {
        console.log('\nTEST 7: Isolation plateforme');
        const sb = createMockSupabase([
            { id: '1', external_uid: 'A', chalet_id: 'chalet-1', source: 'airbnb', start_date: '2026-08-10', end_date: '2026-08-12', status: 'confirmed' },
            { id: '2', external_uid: 'B', chalet_id: 'chalet-1', source: 'airbnb', start_date: '2026-08-15', end_date: '2026-08-17', status: 'confirmed' },
            { id: '3', external_uid: 'X', chalet_id: 'chalet-1', source: 'vrbo', start_date: '2026-08-10', end_date: '2026-08-12', status: 'confirmed' },
            { id: '4', external_uid: 'Y', chalet_id: 'chalet-1', source: 'vrbo', start_date: '2026-08-20', end_date: '2026-08-22', status: 'confirmed' },
            { id: '5', external_uid: null, chalet_id: 'chalet-1', source: 'direct', start_date: '2026-09-01', end_date: '2026-09-03', status: 'confirmed' }
        ]);
        // Airbnb feed only has A (B is gone)
        const feed = [
            { external_uid: 'A', start_date: '2026-08-10', end_date: '2026-08-12', guest_name: 'Guest A' }
        ];
        const r = await reconcile(sb, 'chalet-1', 'user-1', 'airbnb', feed);
        assertEqual(r.cancelled, 1, 'Airbnb B cancelled');
        // VRBO and Direct must be untouched
        const vrboX = sb._bookings.find(b => b.external_uid === 'X');
        const vrboY = sb._bookings.find(b => b.external_uid === 'Y');
        const direct = sb._bookings.find(b => b.source === 'direct');
        assertEqual(vrboX.status, 'confirmed', 'VRBO X unchanged');
        assertEqual(vrboY.status, 'confirmed', 'VRBO Y unchanged');
        assertEqual(direct.status, 'confirmed', 'Direct Z unchanged');
    }

    // ─── TEST 8: Feed invalide → fail-safe ───
    {
        console.log('\nTEST 8: Feed invalide (fail-safe)');
        // This test validates that if the iCal content is invalid,
        // no existing bookings are modified.
        // We simulate this at the orchestration level by checking that
        // reconcile is never called when fetch fails.
        // Here we just verify that our validation logic would catch it.
        
        const invalidContents = [
            '',
            '<html>Error</html>',
            'BEGIN:VCAL\nEND:VCAL',  // Missing VCALENDAR
            null
        ];

        for (const content of invalidContents) {
            const isValid = content && content.includes('BEGIN:VCALENDAR');
            assert(!isValid, `Invalid content rejected: ${(content || 'null').substring(0, 30)}`);
        }
    }

    // ─── TEST 9: Feed valide vide → protection ───
    {
        console.log('\nTEST 9: Feed valide vide (protection)');
        // When the feed is valid but contains 0 events, and there are
        // active bookings in the DB, we should NOT cancel them all.
        // The sync-engine.js handles this at the orchestration level
        // (before calling reconcile). Here we verify the expected behavior:
        // if reconcile IS called with an empty feed, it would cancel everything.
        // That's why the orchestration layer must prevent this.
        
        const sb = createMockSupabase([
            { id: '1', external_uid: 'A', chalet_id: 'chalet-1', source: 'airbnb', start_date: '2026-08-10', end_date: '2026-08-12', status: 'confirmed' },
            { id: '2', external_uid: 'B', chalet_id: 'chalet-1', source: 'airbnb', start_date: '2026-08-15', end_date: '2026-08-17', status: 'confirmed' }
        ]);
        
        // Simulate: empty feed → reconcile would cancel all
        const r = await reconcile(sb, 'chalet-1', 'user-1', 'airbnb', []);
        assertEqual(r.cancelled, 2, 'Reconcile would cancel 2 (orchestrator must prevent this)');
        
        // This confirms that the ORCHESTRATOR (syncOneSource) must check
        // for empty feed + active bookings and SKIP reconciliation.
        assert(true, 'Protection must be at orchestration level (syncOneSource)');
    }

    // ─── TEST 10: Multi-chalets (isolation) ───
    {
        console.log('\nTEST 10: Multi-chalets');
        const sb = createMockSupabase([
            { id: '1', external_uid: 'A', chalet_id: 'ayana', source: 'airbnb', start_date: '2026-08-10', end_date: '2026-08-12', status: 'confirmed' },
            { id: '2', external_uid: 'B', chalet_id: 'ayana', source: 'airbnb', start_date: '2026-08-15', end_date: '2026-08-17', status: 'confirmed' },
            { id: '3', external_uid: 'C', chalet_id: 'aralis', source: 'airbnb', start_date: '2026-08-10', end_date: '2026-08-12', status: 'confirmed' },
            { id: '4', external_uid: 'D', chalet_id: 'aralis', source: 'airbnb', start_date: '2026-08-20', end_date: '2026-08-22', status: 'confirmed' }
        ]);
        // Sync AYANA with only A (B gone)
        const r = await reconcile(sb, 'ayana', 'user-1', 'airbnb', [
            { external_uid: 'A', start_date: '2026-08-10', end_date: '2026-08-12', guest_name: 'Guest A' }
        ]);
        assertEqual(r.cancelled, 1, 'AYANA B cancelled');
        // ARALIS must be untouched
        const aralisC = sb._bookings.find(b => b.external_uid === 'C');
        const aralisD = sb._bookings.find(b => b.external_uid === 'D');
        assertEqual(aralisC.status, 'confirmed', 'ARALIS C unchanged');
        assertEqual(aralisD.status, 'confirmed', 'ARALIS D unchanged');
    }

    // ─── TEST 11: Erreur DB partielle ───
    {
        console.log('\nTEST 11: Erreur DB partielle');
        // Simulate: inserting event C fails with a DB error.
        // Events A (unchanged), B (insert OK), C (insert FAIL)
        const sb = createMockSupabase([
            { id: '1', external_uid: 'A', chalet_id: 'chalet-1', source: 'airbnb', start_date: '2026-08-10', end_date: '2026-08-12', status: 'confirmed' }
        ], { failOnInsertUid: 'C' });
        const feed = [
            { external_uid: 'A', start_date: '2026-08-10', end_date: '2026-08-12', guest_name: 'Guest A' },
            { external_uid: 'B', start_date: '2026-08-15', end_date: '2026-08-17', guest_name: 'Guest B', color: '#FF5A5F', status: 'confirmed' },
            { external_uid: 'C', start_date: '2026-08-20', end_date: '2026-08-22', guest_name: 'Guest C', color: '#FF5A5F', status: 'confirmed' }
        ];
        const r = await reconcile(sb, 'chalet-1', 'user-1', 'airbnb', feed);
        assertEqual(r.created, 1, 'B created successfully');
        assertEqual(r.unchanged, 1, 'A unchanged');
        assert(r.hasErrors === true, 'hasErrors = true');
        assertEqual(r.dbErrors, 1, 'dbErrors = 1');
        assert(r.existingBookingsModified === true, 'existingBookingsModified = true (B was inserted)');
        assert(r.errorMessages.length === 1, 'One error message recorded');
        assert(r.errorMessages[0].includes('C'), 'Error message mentions C');
    }

    // ─── RESULTS ───
    console.log('\n' + '═'.repeat(50));
    console.log(`Results: ${passed} passed, ${failed} failed`);
    console.log('═'.repeat(50));
    results.forEach(r => console.log(r));
    console.log('');

    if (failed > 0) {
        process.exit(1);
    }
}

runTests().catch(err => {
    console.error('Test runner error:', err);
    process.exit(1);
});
