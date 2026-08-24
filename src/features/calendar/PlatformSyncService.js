import { supabase } from '../../lib/supabase';

/**
 * Returns the JWT from the existing ALTARA Supabase singleton.
 *
 * IMPORTANT:
 * Never create another Supabase client here.
 * Multiple browser auth clients previously caused session/refresh contention.
 */
async function getUserJwt() {
    const {
        data: { session },
        error
    } = await supabase.auth.getSession();

    if (error) {
        throw error;
    }

    return session?.access_token || null;
}

/**
 * Synchronize one external calendar source through the server-side sync engine.
 *
 * icalUrl is retained for backwards compatibility with SyncEngine,
 * but the backend resolves the source URL from calendar_sources /
 * chalets.connections.
 */
export async function syncPlatformCalendar(icalUrl, chaletId, platform) {
    const jwt = await getUserJwt();

    if (!jwt) {
        throw new Error('Not authenticated. Please log in to sync calendars.');
    }

    const response = await fetch('/api/sync', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwt}`
        },
        body: JSON.stringify({
            chaletId,
            source: platform
        })
    });

    let result = null;

    try {
        result = await response.json();
    } catch {
        // Keep result null; HTTP handling below will return a useful error.
    }

    if (response.status === 401) {
        throw new Error('Authentication expired. Please log in again.');
    }

    if (response.status === 403) {
        throw new Error('You do not have access to this chalet.');
    }

    if (!response.ok) {
        throw new Error(
            result?.error ||
            `Sync failed: ${response.status} ${response.statusText}`
        );
    }

    if (!result?.success) {
        throw new Error(result?.error || 'Sync engine returned an error.');
    }

    return {
        imported: (result.created || 0) + (result.updated || 0),
        created: result.created || 0,
        updated: result.updated || 0,
        cancelled: result.cancelled || 0,
        unchanged: result.unchanged || 0,
        reactivated: result.reactivated || 0,
        eventsReceived: result.eventsReceived || 0,
        source: result.source || platform
    };
}
