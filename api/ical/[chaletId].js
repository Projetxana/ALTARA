import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    try {
        const { chaletId } = req.query;

        if (!chaletId) {
            return res.status(400).json({ error: 'Missing chaletId' });
        }

        const supabaseUrl = process.env.VITE_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Supabase configuration missing.');
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Fetch confirmed bookings only
        const { data: bookings, error } = await supabase
            .from('Booking')
            .select('*')
            .eq('chalet_id', chaletId)
            .eq('statuts', 'confirmed');

        if (error) throw error;

        let icalContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//ALTARA//EN
CALSCALE:GREGORIAN
`;

        for (const booking of bookings) {
            const start = formatDateForIcal(booking.start_date);
            const end = formatDateForIcal(booking.end_date);

            icalContent += `
BEGIN:VEVENT
UID:${booking.external_uid || booking.id}@altara
DTSTAMP:${formatDateForIcal(new Date())}
DTSTART;VALUE=DATE:${start}
DTEND;VALUE=DATE:${end}
SUMMARY:Reserved
END:VEVENT
`;
        }

        icalContent += `
END:VCALENDAR
`;

        res.setHeader('Content-Type', 'text/calendar');
        return res.status(200).send(icalContent);

    } catch (error) {
        console.error('[ICAL ERROR]', error.message);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

function formatDateForIcal(date) {
    const d = new Date(date);
    return d.toISOString().split('T')[0].replace(/-/g, '');
}
