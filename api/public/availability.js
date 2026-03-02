import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { chaletId, from, to } = req.query;

        if (!chaletId) {
            return res.status(400).json({ error: 'Missing chaletId' });
        }

        const supabaseUrl = process.env.VITE_SUPABASE_URL;
        // Use SERVICE_ROLE for backend queries to bypass RLS safely
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Supabase configuration missing.');
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        let query = supabase
            .from('booking')
            .select('start_date, end_date, status')
            .eq('chalet_id', chaletId)
            .in('status', ['confirmed', 'pending']);

        // If date boundaries provided, filter
        if (from) {
            query = query.gte('end_date', from);
        }
        if (to) {
            query = query.lte('start_date', to);
        }

        const { data: bookings, error } = await query;

        if (error) throw error;

        // Return ranges of unavailable dates
        const blockedRanged = bookings.map(b => ({
            start: b.start_date,
            end: b.end_date,
            status: b.status
        }));

        return res.status(200).json({ success: true, blocked: blockedRanged });

    } catch (error) {
        console.error('[AVAILABILITY API ERROR]', error.message);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
