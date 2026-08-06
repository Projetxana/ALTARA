/**
 * ALTARA — /api/feed
 * 
 * Génère un flux iCal pour un chalet (endpoint alternatif utilisé par PlatformConnectionPanel).
 * 
 * CORRIGÉ Phase 1 :
 * - Table : 'booking' au lieu de 'reservations' (qui n'existe pas)
 * - Clé : SUPABASE_SERVICE_ROLE_KEY au lieu de VITE_SUPABASE_ANON_KEY
 * - Ajout du paramètre target pour filtrage anti-boucle
 */

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { chaletId, target } = req.query;

    if (!chaletId) {
        return res.status(400).json({ error: 'Missing chaletId parameter' });
    }

    try {
        const supabaseUrl = process.env.VITE_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Supabase configuration missing.');
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Fetch confirmed/blocked bookings
        let query = supabase
            .from('booking')
            .select('*')
            .eq('chalet_id', chaletId)
            .in('status', ['confirmed', 'blocked']);

        // Exclude bookings from the target platform to prevent circular re-export
        if (target) {
            query = query.neq('source', target);
        }

        const { data: bookings, error } = await query;
        if (error) throw error;

        // Build iCal manually (no dependency on ical-generator)
        let icalContent = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//ALTARA//Chalet Calendar//EN\r\nCALSCALE:GREGORIAN\r\nMETHOD:PUBLISH\r\nX-WR-CALNAME:ALTARA - Chalet\r\nX-WR-TIMEZONE:America/Montreal\r\n`;

        for (const booking of (bookings || [])) {
            const start = booking.start_date || booking.check_in;
            const end = booking.end_date || booking.check_out;

            if (!start || !end) continue;

            const startFormatted = new Date(start).toISOString().split('T')[0].replace(/-/g, '');
            const endFormatted = new Date(end).toISOString().split('T')[0].replace(/-/g, '');
            const uid = booking.external_uid || booking.id;

            icalContent += `BEGIN:VEVENT\r\nUID:${uid}@altara\r\nDTSTAMP:${new Date().toISOString().split('T')[0].replace(/-/g, '')}T000000Z\r\nDTSTART;VALUE=DATE:${startFormatted}\r\nDTEND;VALUE=DATE:${endFormatted}\r\nSUMMARY:Reserved\r\nDESCRIPTION:Booking ID: ${booking.id}\r\nSTATUS:CONFIRMED\r\nTRANSP:OPAQUE\r\nEND:VEVENT\r\n`;
        }

        icalContent += `END:VCALENDAR\r\n`;

        res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
        res.setHeader('Content-Disposition', 'inline; filename="altara-feed.ics"');
        return res.status(200).send(icalContent);

    } catch (error) {
        console.error('Error generating feed:', error);
        res.status(500).json({ error: 'Failed to generate feed', details: error.message });
    }
}
