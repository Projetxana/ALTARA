import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    if (req.method !== 'GET' && req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        console.log('[cron-sync] Starting 24/7 background calendar sync...');

        // 1. Initialize Supabase
        const supabaseUrl =
          process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;

        const supabaseKey =
          process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
          console.error("ENV CHECK:", {
            SUPABASE_URL: !!process.env.SUPABASE_URL,
            SERVICE_ROLE: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
          });

          throw new Error('Supabase configuration missing in environment.');
        }       


        const supabase = createClient(supabaseUrl, supabaseKey);

        // 2. Fetch all properties (chalets)
        const { data: chalets, error: chaletError } = await supabase
            .from('chalets')
            .select('id, user_id, connections');

        if (chaletError) {
            throw new Error(`Failed to fetch chalets: ${chaletError.message}`);
        }

        if (!chalets || chalets.length === 0) {
            console.log('[cron-sync] No properties found to sync.');
            return res.status(200).json({ success: true, message: 'No properties to sync.' });
        }

        const nodeIcalModule = await import('node-ical');
        const nodeIcal = nodeIcalModule.default || nodeIcalModule;
        const axios = await import('axios');
        const axiosGet = axios.default ? axios.default.get : axios.get;

        let totalEventsImported = 0;
        const results = [];

        // 3. Iterate over each chalet and its connections
        for (const chalet of chalets) {
            if (!chalet.connections || Object.keys(chalet.connections).length === 0) {
                continue;
            }

            for (const [platform, url] of Object.entries(chalet.connections)) {
                if (!url) continue;

                try {
                    console.log(`[cron-sync] Fetching ${platform} for chalet ${chalet.id}...`);

                    const response = await axiosGet(url, {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                        }
                    });

                    // Parse iCal
                    const data = await nodeIcal.async.parseICS(response.data);
                    const events = Object.values(data).filter(e => e.type === 'VEVENT');

                    const validEvents = events.map(e => {
                        let color = '#FF5A5F';
                        if (platform === 'booking') color = '#003580';
                        else if (platform === 'mrchalet') color = '#F2B203';
                        else if (platform === 'vrbo') color = '#2C3E50';
                        else if (platform === 'direct') color = '#10B981';

                        let isBlocked = false;
                        if (e.summary && (e.summary.toLowerCase().includes('not available') || e.summary.toLowerCase().includes('blocked') || e.summary.toLowerCase().includes('bloc'))) {
                            isBlocked = true;
                        }

                        return {
                            chalet_id: chalet.id,
                            user_id: chalet.user_id,
                            source: platform,
                            start_date: e.start.toISOString().split('T')[0],
                            end_date: e.end.toISOString().split('T')[0],
                            guest_name: isBlocked ? 'Période bloquée' : (e.summary || `${platform} Guest`),
                            color: color,
                            external_uid: e.uid,
                            status: isBlocked ? 'blocked' : 'confirmed'
                        };
                    });

                    // 4. Batch Upsert to Supabase
                    if (validEvents.length > 0) {
                        const { data: upsertData, error: upsertError } = await supabase
                            .from('bookings')
                            .upsert(validEvents, { onConflict: 'external_uid' })
                            .select();

                        if (upsertError) {
                            console.error(`[cron-sync] Supabase Upsert Error for ${platform}:`, upsertError);
                        } else {
                            totalEventsImported += validEvents.length;
                            results.push({ chaletId: chalet.id, platform, imported: validEvents.length });
                        }
                    } else {
                        results.push({ chaletId: chalet.id, platform, imported: 0 });
                    }

                } catch (connectionError) {
                    console.error(`[cron-sync] Error syncing ${platform} for chalet ${chalet.id}:`, connectionError.message);
                    results.push({ chaletId: chalet.id, platform, error: connectionError.message });
                    // Continue to next platform/chalet without crashing
                }
            }
        }

        console.log(`[cron-sync] Completed. Total events UPSERTED to database: ${totalEventsImported}`);
        res.status(200).json({ success: true, totalImported: totalEventsImported, details: results });

    } catch (globalError) {
        console.error('[cron-sync] Global Sync Engine Failure:', globalError);
        res.status(500).json({ error: 'Global sync failure', details: globalError.message });
    }
}
