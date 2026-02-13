export async function syncAirbnbCalendar(icalUrl, chaletId) {
    const res = await fetch(
        `/api/ical-sync`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ url: icalUrl, chaletId }),
        }
    );

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Sync failed: ${res.status} ${res.statusText} - ${errText}`);
    }

    return await res.json();
}
