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
            // Checkout is exclusive:
            // existing.start < requested.checkout
            // AND existing.end > requested.checkin
            .lt('start_date', checkOut)
            .gt('end_date', checkIn);

        if (overlapError) throw overlapError;

        if (overlappingBookings && overlappingBookings.length > 0) {
            return res.status(409).json({ success: false, error: 'Dates are no longer available.' });
        }

        // 2. Insert new booking as 'pending'
        const external_uid = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

        const bookingData = {
            chalet_id: chaletId,

            source: 'direct',
            booking_channel: 'website',
            origin: 'chalet-ayana',
            external_uid,

            guest_name: fullName,
            guest_email: email,
            guest_phone: phone || null,
            guest_note: note || null,

            start_date: checkIn,
            end_date: checkOut,
            check_in: checkIn,
            check_out: checkOut,

            status: 'pending',
            color: '#C5A66A',
            currency: 'CAD'
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
