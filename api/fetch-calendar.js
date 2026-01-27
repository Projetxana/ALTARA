export default async function handler(req, res) {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'Missing URL parameter' });
    }

    try {
        const nodeIcal = await import('node-ical');
        const axios = await import('axios');

        // fetch the ical data
        const response = await axios.default.get(url);
        const data = await nodeIcal.async.parseICS(response.data);

        // Convert to array and filter
        const events = Object.values(data)
            .filter(event => event.type === 'VEVENT')
            .map(event => ({
                uid: event.uid,
                summary: event.summary,
                start: event.start,
                end: event.end,
                description: event.description,
                location: event.location,
                status: event.status
            }));

        res.status(200).json({ events });
    } catch (error) {
        console.error('Error fetching calendar:', error);
        res.status(500).json({ error: 'Failed to fetch calendar', details: error.message });
    }
}
