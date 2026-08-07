import ical from 'ical-generator';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client (Verify environment variables are set in Vercel)
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { chaletId } = req.query;

    if (!chaletId) {
        return res.status(400).json({ error: 'Missing chaletId parameter' });
    }

    try {
        // 1. Fetch Reservations from DB
        const { data: reservations, error } = await supabase
            .from('reservations')
            .select('*')
            .eq('chalet_id', chaletId);

        if (error) throw error;

        // 2. Create Calendar
        const calendar = ical({
            name: `ALTARA - Chalet ${chaletId}`,
            timezone: 'America/Montreal'
        });

        // 3. Add Events
        reservations.forEach(booking => {
            calendar.createEvent({
                start: new Date(booking.start_date),
                end: new Date(booking.end_date),
                summary: 'Reserved',
                description: `Booking ID: ${booking.id}`,
                uid: booking.id
            });
        });

        // 4. Serve iCal
        calendar.serve(res);

    } catch (error) {
        console.error('Error generating feed:', error);
        res.status(500).json({ error: 'Failed to generate feed', details: error.message });
    }
}
