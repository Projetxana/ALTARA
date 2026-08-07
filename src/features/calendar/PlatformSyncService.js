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
        .from('booking')
        .upsert(events, { onConflict: 'external_uid' })
        .select();

    if (error) {
        console.error('[PlatformSyncService] Supabase Upsert Error:', error);
        throw error;
    }

    // 3. Auto-generate cleaning tasks for new bookings
    if (result && result.length > 0) {
        try {
            // Get existing cleaning tasks for these bookings to avoid duplicates
            const bookingIds = result.map(b => b.id);
            const { data: existingTasks } = await supabase
                .from('cleaning_tasks')
                .select('booking_id')
                .in('booking_id', bookingIds);

            const existingBookingIds = new Set((existingTasks || []).map(t => t.booking_id));

            const newTasks = result
                .filter(b => !existingBookingIds.has(b.id))
                .map(b => ({
                    chalet_id: b.chalet_id,
                    booking_id: b.id,
                    date: b.end_date || b.end,
                    status: 'pending',
                    auto_generated: true
                }));

            if (newTasks.length > 0) {
                const { error: taskError } = await supabase
                    .from('cleaning_tasks')
                    .insert(newTasks);

                if (taskError) {
                    console.error('[PlatformSyncService] Error generating cleaning tasks:', taskError);
                } else {
                    console.log(`[PlatformSyncService] Generated ${newTasks.length} cleaning tasks.`);
                }
            }
        } catch (err) {
            console.error('[PlatformSyncService] Failed to auto-generate cleaning tasks:', err);
        }
    }

    return { imported: events.length, bookings: result };
}
