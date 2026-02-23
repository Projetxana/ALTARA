// Backend iCal proxy. Pure parsing, NO Supabase DB connections here.

export default async function handler(req, res) {
    if (req.method !== 'POST' && req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { url, chaletId, platform = 'airbnb', userId } = req.method === 'POST' ? req.body : req.query;

    if (!url || !chaletId || !userId) {
        return res.status(400).json({ error: 'Missing url, chaletId, or userId' });
    }

    try {
        const nodeIcalModule = await import('node-ical');
        const nodeIcal = nodeIcalModule.default || nodeIcalModule;
        const axios = await import('axios');

        // 1. Fetch iCal
        console.log(`[ical-sync] Fetching ${url} for chalet ${chaletId} (Platform: ${platform})...`);
        const axiosGet = axios.default ? axios.default.get : axios.get;
        const response = await axiosGet(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        // 2. Parse Events
        const data = await nodeIcal.async.parseICS(response.data);

        // 3. Transform to DB format
        const events = Object.values(data).filter(e => e.type === 'VEVENT');

        const validEvents = events.map(e => {
            // Determine color based on platform
            let color = '#FF5A5F'; // Default Airbnb Red
            if (platform === 'booking') color = '#003580'; // Booking.com Blue
            else if (platform === 'mrchalet') color = '#F2B203'; // Mr Chalet Yellow
            else if (platform === 'vrbo') color = '#2C3E50'; // VRBO Navy
            else if (platform === 'direct') color = '#10B981'; // Direct Green

            let isBlocked = false;
            if (e.summary && (e.summary.toLowerCase().includes('not available') || e.summary.toLowerCase().includes('blocked') || e.summary.toLowerCase().includes('bloc'))) {
                isBlocked = true;
            }

            return {
                chalet_id: chaletId,
                user_id: userId,
                source: platform,
                start_date: e.start.toISOString().split('T')[0],
                end_date: e.end.toISOString().split('T')[0],
                guest_name: isBlocked ? 'Période bloquée' : (e.summary || `${platform} Guest`),
                color: color,
                external_uid: e.uid,
                status: isBlocked ? 'blocked' : 'confirmed'
            };
        });

        // 4. Return to Frontend
        console.log(`[ical-sync] Parsed ${validEvents.length} events successfully. Sending to frontend.`);
        res.status(200).json({ success: true, count: validEvents.length, events: validEvents });

    } catch (error) {
        console.error('[ical-sync] Error:', error);
        res.status(500).json({ error: 'Failed to parse iCal', details: error.message });
    }
}
