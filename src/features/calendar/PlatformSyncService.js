import { supabase } from '../../lib/supabase';

export async function syncPlatformCalendar(icalUrl, chaletId, platform) {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    const res = await fetch(
        `/api/ical-sync`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ url: icalUrl, chaletId, platform, userId }),
        }
    );

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Sync failed: ${res.status} ${res.statusText} - ${errText}`);
    }

    return await res.json();
}
