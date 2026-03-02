import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const body = req.body;
        const { chaletId, checkIn, checkOut, guests, fullName, email, phone, note } = body;

        if (!chaletId || !checkIn || !checkOut || !fullName || !email) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        const supabaseUrl = process.env.VITE_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Supabase configuration missing.');
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // 1. Verify availability again on the server side to prevent double-booking race condition
        const { data: overlappingBookings, error: overlapError } = await supabase
            .from('booking')
            .select('id')
            .eq('chalet_id', chaletId)
            .in('status', ['confirmed', 'pending'])
            // Overlap condition: start <= checkout AND end >= checkin
            .lte('start_date', checkOut)
            .gte('end_date', checkIn);

        if (overlapError) throw overlapError;

        if (overlappingBookings && overlappingBookings.length > 0) {
            return res.status(409).json({ success: false, error: 'Dates are no longer available.' });
        }

        // 2. Insert new booking as 'pending'
        const external_uid = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

        let customNote = `Email: ${email}`;
        if (phone) customNote += `\nPhone: ${phone}`;
        if (guests) customNote += `\nGuests: ${guests}`;
        if (note) customNote += `\nNote: ${note}`;

        const bookingData = {
            chalet_id: chaletId,
            guest_name: fullName,
            start_date: checkIn,
            end_date: checkOut,
            status: 'pending',
            source: 'Direct',
            color: '#10b981', // green for direct/pending
            external_uid: external_uid
        };

        const { data: newBooking, error: insertError } = await supabase
            .from('booking')
            .insert([bookingData])
            .select()
            .single();

        if (insertError) throw insertError;

        return res.status(200).json({
            success: true,
            bookingId: newBooking.external_uid,
            message: 'Booking request created successfully.'
        });

    } catch (error) {
        console.error('[REQUEST-BOOKING API ERROR]', error.message);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
