export async function syncAirbnbCalendar(icalUrl) {
    const res = await fetch(
        `/api/ical-sync`,
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
