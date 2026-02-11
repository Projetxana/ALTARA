export async function syncAirbnbCalendar(icalUrl) {
    const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ical-sync`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ icalUrl }),
        }
    );

    return await res.text();
}
