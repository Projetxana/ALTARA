import { supabase } from '../../lib/supabase';

export async function syncPlatformCalendar(icalUrl, chaletId, platform) {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (!userId) {
        throw new Error("User must be logged in to sync calendar.");
    }

    // 1. Fetch normalized proxy data from backend
    const res = await fetch(
        `/api/ical-sync`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ url: icalUrl, chaletId, platform, userId }), // Keeping userId for the payload structure although it's mostly returned
        }
    );

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Proxy Parse failed: ${res.status} ${res.statusText} - ${errText}`);
    }

    const { success, count, events, error: apiError } = await res.json();

    if (!success) {
        throw new Error(`Sync API Error: ${apiError}`);
    }

    if (!events || events.length === 0) {
        return { imported: 0, bookings: [] };
    }

    // 2. Safely Upsert into Supabase from FrontEnd (Has active User Session, bypasses missing Vercel Env Vars)
    const { data: result, error } = await supabase
        .from('bookings')
        .upsert(events, { onConflict: 'external_uid' })
        .select();

    if (error) {
        console.error('[PlatformSyncService] Supabase Upsert Error:', error);
        throw error;
    }

    return { imported: events.length, bookings: result };
}
