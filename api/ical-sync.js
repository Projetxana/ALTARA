import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client (Service Role preferred for Edge Functions, but using Anon for Vercel/Client parity if Env vars are same)
// WARNING: Ideally use SUPABASE_SERVICE_ROLE_KEY for writing if RLS blocks anon.
// For this User Request, we assume standard vars.

export default async function handler(req, res) {
    if (req.method !== 'POST' && req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { url, chaletId, platform = 'airbnb' } = req.method === 'POST' ? req.body : req.query;

    if (!url || !chaletId) {
        return res.status(400).json({ error: 'Missing url or chaletId' });
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

            return {
                chalet_id: chaletId,
                source: platform,
                platform_id: platform,
                start_date: e.start.toISOString().split('T')[0],
                end_date: e.end.toISOString().split('T')[0],
                guest_name: e.summary || `${platform} Guest`,
                color: color,
                external_uid: e.uid,
                status: 'confirmed'
            };
        });

        // 4. Initialize Supabase
        // Note: Check for VITE_ prefix (frontend aligned) AND standard server-side env vars.
        const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY / VITE equivalents");
            throw new Error("Missing Supabase Credentials on Server");
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // 5. Upsert to DB
        // Using 'upsert' to avoid duplicates based on 'external_uid' (must be unique constraint in DB)
        const { data: result, error } = await supabase
            .from('bookings')
            .upsert(validEvents, { onConflict: 'external_uid' })
            .select();

        if (error) {
            console.error('[ical-sync] Supabase Upsert Error:', error);
            throw error;
        }

        console.log(`[ical-sync] Synced ${validEvents.length} events successfully.`);

        res.status(200).json({ success: true, imported: validEvents.length, bookings: result });

    } catch (error) {
        console.error('[ical-sync] Error:', error);
        res.status(500).json({ error: 'Sync failed', details: error.message });
    }
}
