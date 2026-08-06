import { createClient } from '@supabase/supabase-js';

/**
 * ALTARA — /api/ical
 * 
 * Génère un flux iCal (VCALENDAR) pour un chalet.
 * Utilisé par Airbnb/Booking/VRBO pour importer les indisponibilités ALTARA.
 * 
 * Paramètres :
 *   chaletId (requis) : UUID du chalet
 *   target   (optionnel) : plateforme cible (airbnb, booking, vrbo)
 *     → Si fourni, exclut les réservations dont source = target
 *       pour éviter la réexportation circulaire.
 *     → Si absent, toutes les réservations confirmées sont exportées (compatibilité).
 * 
 * Exemples :
 *   /api/ical?chaletId=XXX                → toutes les réservations
 *   /api/ical?chaletId=XXX&target=airbnb  → exclut source=airbnb
 */
export default async function handler(req, res) {
    try {
        const { chaletId, target } = req.query;

        if (!chaletId) {
            return res.status(400).json({ error: 'Missing chaletId' });
        }

        const supabaseUrl = process.env.VITE_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Supabase configuration missing.');
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Build query — only confirmed bookings
        let query = supabase
            .from('booking')
            .select('*')
            .eq('chalet_id', chaletId)
            .in('status', ['confirmed', 'blocked']);

        // If target is specified, exclude bookings from that source
        // to prevent circular re-export (e.g., Airbnb events back to Airbnb)
        if (target) {
            query = query.neq('source', target);
        }

        const { data: bookings, error } = await query;

        if (error) throw error;

        let icalContent = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//ALTARA//Chalet Calendar//EN\r\nCALSCALE:GREGORIAN\r\nMETHOD:PUBLISH\r\nX-WR-CALNAME:ALTARA Chalet\r\n`;

        for (const booking of (bookings || [])) {
            const start = formatDateForIcal(booking.start_date || booking.check_in);
            const end = formatDateForIcal(booking.end_date || booking.check_out);
            const uid = booking.external_uid || booking.id;

            if (!start || !end) continue;

            icalContent += `BEGIN:VEVENT\r\nUID:${uid}@altara\r\nDTSTAMP:${formatDateForIcal(new Date())}\r\nDTSTART;VALUE=DATE:${start}\r\nDTEND;VALUE=DATE:${end}\r\nSUMMARY:Reserved\r\nSTATUS:CONFIRMED\r\nTRANSP:OPAQUE\r\nEND:VEVENT\r\n`;
        }

        icalContent += `END:VCALENDAR\r\n`;

        res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
        res.setHeader('Content-Disposition', 'inline; filename="altara-calendar.ics"');
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
    if (!date) return null;
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    return d.toISOString().split('T')[0].replace(/-/g, '');
}
