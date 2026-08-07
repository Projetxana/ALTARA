console.log("CRON_SECRET:", process.env.CRON_SECRET);
import { createClient } from '@supabase/supabase-js';
import ical from 'node-ical';
import axios from 'axios';

export default async function handler(req, res) {

  // 🔐 Security check
  const authHeader = req.headers.authorization;

  if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing.');
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });

    console.log('[SYNC] Starting sync...');

    // 1️⃣ Fetch chalets
    const { data: chalets, error } = await supabase
      .from('chalets')
      .select('*');

    if (error) throw error;

    let totalImported = 0;

    for (const chalet of chalets) {

      if (!chalet.connections) continue;

      const connections = chalet.connections;

      for (const platform in connections) {

        const icalUrl = connections[platform];
        if (!icalUrl) continue;

        console.log(`[SYNC] Fetching ${platform} for chalet ${chalet.id}`);

        try {
          const response = await axios.get(icalUrl);
          const events = ical.parseICS(response.data);

          for (const key in events) {
            const event = events[key];

            if (event.type !== 'VEVENT') continue;

            const externalUid = event.uid;
            const startDate = event.start;
            const endDate = event.end;

            if (!externalUid || !startDate || !endDate) continue;

            // Check if already exists
            const { data: existing } = await supabase
              .from('booking')
              .select('id')
              .eq('external_uid', externalUid)
              .single();

            if (existing) continue;

            // Insert booking
            const { error: insertError } = await supabase
              .from('booking')
              .insert({
                user_id: chalet.user_id,
                chalet_id: chalet.id,
                guest_name: event.summary || 'Reserved',
                check_in: startDate,
                check_out: endDate,
                start_date: startDate,
                end_date: endDate,
                source: platform,
                Plateform: platform,
                statuts: 'confirmed',
                color: getColorByPlatform(platform),
                external_uid: externalUid
              });

            if (insertError) {
              console.error(insertError.message);
              continue;
            }

            totalImported++;
          }

        } catch (platformError) {
          console.error(`[SYNC] Failed for ${platform}`, platformError.message);
        }
      }
    }

    return res.status(200).json({
      success: true,
      imported: totalImported
    });

  } catch (error) {
    console.error('[SYNC ERROR]', error.message);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

function getColorByPlatform(platform) {
  switch (platform) {
    case 'airbnb': return '#FF5A5F';
    case 'booking': return '#003580';
    case 'vrbo': return '#0066FF';
    case 'mrchalet': return '#8E44AD';
    default: return '#999999';
  }
}
