import { supabase } from '../../lib/supabase';

const DIRECT_BOOKING_COLOR = '#C5A66A';

export function mapBookingFromDb(row) {
    if (!row) return null;

    return {
        id: row.id,
        chaletId: row.chalet_id,
        userId: row.user_id,

        source: (row.source || 'direct').toLowerCase(),
        bookingChannel: row.booking_channel || null,
        origin: row.origin || null,
        externalUid: row.external_uid || null,

        guestName: row.guest_name || '',
        guestEmail: row.guest_email || '',
        guestPhone: row.guest_phone || '',
        guestNote: row.guest_note || '',

        checkInDate: row.start_date || row.check_in,
        checkOutDate: row.end_date || row.check_out,

        status: row.status || 'confirmed',
        paymentStatus: row.payment_status || 'unpaid',

        amountPaid: Number(row.amount_paid || 0),
        totalRevenue: Number(row.total_revenue || 0),

        paymentProvider: row.payment_provider || null,
        paymentReference: row.payment_reference || null,

        currency: row.currency || 'CAD',
        color: row.color || DIRECT_BOOKING_COLOR
    };
}

function validateDates(startDate, endDate) {
    if (!startDate || !endDate) {
        throw new Error('Start date and end date are required.');
    }

    if (endDate <= startDate) {
        throw new Error('Check-out must be after check-in.');
    }
}

async function getAuthenticatedUser() {
    const {
        data: { user },
        error
    } = await supabase.auth.getUser();

    if (error) throw error;

    if (!user) {
        throw new Error('Authentication required.');
    }

    return user;
}

const BookingService = {
    async createAdminBooking(bookingData) {
        if (!bookingData?.chaletId) {
            throw new Error('chaletId is required.');
        }

        if (!bookingData?.guestName?.trim()) {
            throw new Error('guestName is required.');
        }

        validateDates(
            bookingData.startDate,
            bookingData.endDate
        );

        const user = await getAuthenticatedUser();

        const row = {
            user_id: user.id,
            chalet_id: bookingData.chaletId,

            source: 'direct',
            booking_channel: 'altara',
            origin: 'altara',
            external_uid: null,

            guest_name: bookingData.guestName.trim(),
            guest_email: bookingData.guestEmail?.trim() || null,
            guest_phone: bookingData.guestPhone?.trim() || null,
            guest_note: bookingData.guestNote?.trim() || null,

            start_date: bookingData.startDate,
            end_date: bookingData.endDate,

            check_in: bookingData.startDate,
            check_out: bookingData.endDate,

            status: 'confirmed',
            payment_status: 'unpaid',
            amount_paid: 0,

            color: DIRECT_BOOKING_COLOR,

            total_revenue: Number(
                bookingData.totalPrice || 0
            ),

            currency: bookingData.currency || 'CAD'
        };

        const { data, error } = await supabase
            .from('booking')
            .insert(row)
            .select('*')
            .single();

        if (error) {
            throw new Error(
                `Unable to create booking: ${error.message}`
            );
        }

        const { error: cleaningError } = await supabase
            .from('cleaning_tasks')
            .insert({
                chalet_id: data.chalet_id,
                booking_id: data.id,
                date: data.end_date,
                status: 'pending',
                auto_generated: true
            });

        if (cleaningError) {
            console.error(
                '[BookingService] Booking created but cleaning task creation failed:',
                cleaningError
            );
        }

        return mapBookingFromDb(data);
    },

    async updateBooking(bookingId, changes) {
        if (!bookingId) {
            throw new Error('bookingId is required.');
        }

        const patch = {};

        if (changes.guestName !== undefined) {
            patch.guest_name =
                changes.guestName?.trim() || null;
        }

        if (changes.guestEmail !== undefined) {
            patch.guest_email =
                changes.guestEmail?.trim() || null;
        }

        if (changes.guestPhone !== undefined) {
            patch.guest_phone =
                changes.guestPhone?.trim() || null;
        }

        if (changes.guestNote !== undefined) {
            patch.guest_note =
                changes.guestNote?.trim() || null;
        }

        if (changes.startDate !== undefined) {
            patch.start_date = changes.startDate;
            patch.check_in = changes.startDate;
        }

        if (changes.endDate !== undefined) {
            patch.end_date = changes.endDate;
            patch.check_out = changes.endDate;
        }

        if (changes.totalPrice !== undefined) {
            patch.total_revenue =
                Number(changes.totalPrice || 0);
        }

        const { data, error } = await supabase
            .from('booking')
            .update(patch)
            .eq('id', bookingId)
            .select('*')
            .single();

        if (error) {
            throw new Error(
                `Unable to update booking: ${error.message}`
            );
        }

        if (changes.endDate !== undefined) {
            const { error: cleaningError } = await supabase
                .from('cleaning_tasks')
                .update({
                    date: changes.endDate
                })
                .eq('booking_id', bookingId);

            if (cleaningError) {
                console.error(
                    '[BookingService] Unable to update cleaning task:',
                    cleaningError
                );
            }
        }

        return mapBookingFromDb(data);
    },

    async cancelBooking(bookingId) {
        if (!bookingId) {
            throw new Error('bookingId is required.');
        }

        const { data, error } = await supabase
            .from('booking')
            .update({
                status: 'cancelled'
            })
            .eq('id', bookingId)
            .select('*')
            .single();

        if (error) {
            throw new Error(
                `Unable to cancel booking: ${error.message}`
            );
        }

        const { error: cleaningError } = await supabase
            .from('cleaning_tasks')
            .delete()
            .eq('booking_id', bookingId);

        if (cleaningError) {
            console.error(
                '[BookingService] Unable to remove cleaning task:',
                cleaningError
            );
        }

        return mapBookingFromDb(data);
    },

    async checkAvailability(
        chaletId,
        startDate,
        endDate,
        excludeBookingId = null
    ) {
        validateDates(startDate, endDate);

        let bookingQuery = supabase
            .from('booking')
            .select('id')
            .eq('chalet_id', chaletId)
            .in('status', ['confirmed', 'pending'])
            .lt('start_date', endDate)
            .gt('end_date', startDate);

        if (excludeBookingId) {
            bookingQuery = bookingQuery.neq(
                'id',
                excludeBookingId
            );
        }

        const {
            data: bookings,
            error: bookingError
        } = await bookingQuery;

        if (bookingError) {
            throw bookingError;
        }

        if ((bookings || []).length > 0) {
            return false;
        }

        const { data: blocks, error: blockError } =
            await supabase
                .from('calendar_blocks')
                .select('id')
                .eq('chalet_id', chaletId)
                .lt('start_date', endDate)
                .gt('end_date', startDate)
                .or(
                    'expires_at.is.null,' +
                    `expires_at.gt.${new Date().toISOString()}`
                );

        if (blockError) {
            throw blockError;
        }

        return (blocks || []).length === 0;
    }
};

export default BookingService;
