import { applyPublicCors } from '../../server/lib/public-cors.js';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const createStripeClient = () => {
    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (!secretKey) {
        throw new Error(
            'STRIPE_SECRET_KEY is missing from the server environment.'
        );
    }

    return new Stripe(secretKey);
};


const calculateNights = (startDate, endDate) => {
    const start = new Date(`${startDate}T00:00:00Z`);
    const end = new Date(`${endDate}T00:00:00Z`);

    return Math.max(
        1,
        Math.round((end - start) / 86400000)
    );
};

async function handleCheckoutSummary(req, res) {
    try {
        const sessionId =
            Array.isArray(req.query.session_id)
                ? req.query.session_id[0]
                : req.query.session_id;

        if (!sessionId || !sessionId.startsWith('cs_')) {
            return res.status(400).json({
                success: false,
                error: 'Invalid checkout session.'
            });
        }

        const stripe = createStripeClient();

        const session =
            await stripe.checkout.sessions.retrieve(sessionId);

        const bookingId =
            session.metadata?.booking_id ||
            session.client_reference_id;

        if (!bookingId) {
            return res.status(404).json({
                success: false,
                error: 'Booking reference unavailable.'
            });
        }

        if (session.payment_status !== 'paid') {
            return res.status(202).json({
                success: false,
                status: 'processing',
                message: 'Payment is still being confirmed.'
            });
        }

        const supabaseUrl =
            process.env.VITE_SUPABASE_URL;

        const serviceRoleKey =
            process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !serviceRoleKey) {
            throw new Error(
                'Supabase server configuration missing.'
            );
        }

        const supabase = createClient(
            supabaseUrl,
            serviceRoleKey,
            {
                auth: {
                    persistSession: false,
                    autoRefreshToken: false
                }
            }
        );

        const {
            data: booking,
            error: bookingError
        } = await supabase
            .from('booking')
            .select(`
                id,
                chalet_id,
                guest_name,
                guest_email,
                start_date,
                end_date,
                status,
                payment_status,
                total_revenue,
                amount_paid,
                currency,
                payment_reference
            `)
            .eq('id', bookingId)
            .single();

        if (bookingError || !booking) {
            return res.status(404).json({
                success: false,
                error: 'Booking not found.'
            });
        }

        if (
            booking.payment_reference &&
            booking.payment_reference !== session.id
        ) {
            return res.status(409).json({
                success: false,
                error:
                    'This payment session is no longer active.'
            });
        }

        const {
            data: property,
            error: propertyError
        } = await supabase
            .from('chalets')
            .select('id, name')
            .eq('id', booking.chalet_id)
            .single();

        if (propertyError || !property) {
            return res.status(404).json({
                success: false,
                error: 'Property not found.'
            });
        }

        const total =
            Number(booking.total_revenue || 0);

        const amountAlreadyRecorded =
            Number(booking.amount_paid || 0);

        const checkoutAmount =
            Number(session.amount_total || 0) / 100;

        const totalPaid =
            booking.payment_status === 'paid'
                ? amountAlreadyRecorded
                : Math.min(
                    total,
                    amountAlreadyRecorded + checkoutAmount
                );

        const balance =
            Math.max(total - totalPaid, 0);

        return res.status(200).json({
            success: true,

            property: {
                id: property.id,
                name: property.name
            },

            booking: {
                id: booking.id,
                guestName: booking.guest_name,
                guestEmail: booking.guest_email,
                checkIn: booking.start_date,
                checkOut: booking.end_date,
                nights: calculateNights(
                    booking.start_date,
                    booking.end_date
                ),
                total,
                amountPaid: totalPaid,
                balance,
                currency:
                    String(booking.currency || 'CAD')
                        .toUpperCase()
            },

            payment: {
                status: 'paid',
                sessionId: session.id,
                amountPaidToday: checkoutAmount
            },

            arrivalInfoLeadDays: 7
        });

    } catch (error) {
        console.error(
            '[CHECKOUT SUMMARY]',
            error
        );

        return res.status(500).json({
            success: false,
            error:
                'Unable to load the payment confirmation.'
        });
    }
}

export default async function handler(req, res) {
    if (
        applyPublicCors(
            req,
            res,
            { methods: ['GET', 'POST', 'OPTIONS'] }
        )
    ) {
        return;
    }

    if (req.method === 'GET') {
        return handleCheckoutSummary(req, res);
    }

    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed'
        });
    }

    try {
        const stripe = createStripeClient();

        const authHeader =
            req.headers.authorization || '';

        const token =
            authHeader.startsWith('Bearer ')
                ? authHeader.slice(7)
                : null;

        const {
            bookingId,
            bookingReference
        } = req.body || {};

        if (!bookingId) {
            return res.status(400).json({
                success: false,
                error: 'bookingId is required.'
            });
        }

        const isPublicCheckout =
            !token &&
            typeof bookingReference === 'string' &&
            bookingReference.startsWith('web_');

        const supabaseUrl =
            process.env.VITE_SUPABASE_URL;

        const serviceRoleKey =
            process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !serviceRoleKey) {
            throw new Error(
                'Supabase server configuration missing.'
            );
        }

        const supabase = createClient(
            supabaseUrl,
            serviceRoleKey,
            {
                auth: {
                    persistSession: false,
                    autoRefreshToken: false
                }
            }
        );

        let user = null;

        if (!isPublicCheckout) {
            if (!token) {
                return res.status(401).json({
                    success: false,
                    error:
                        'Authentication required.'
                });
            }

            const {
                data: authData,
                error: authError
            } =
                await supabase.auth
                    .getUser(token);

            user = authData?.user || null;

            if (authError || !user) {
                return res.status(401).json({
                    success: false,
                    error:
                        'Invalid authentication.'
                });
            }
        }

        const {
            data: booking,
            error: bookingError
        } = await supabase
            .from('booking')
            .select(`
                id,
                chalet_id,
                guest_name,
                guest_email,
                start_date,
                end_date,
                source,
                status,
                payment_status,
                total_revenue,
                amount_paid,
                currency,
                payment_provider,
                payment_reference,
                external_uid,
                booking_channel,
                origin
            `)
            .eq('id', bookingId)
            .single();

        if (bookingError || !booking) {
            return res.status(404).json({
                success: false,
                error: 'Booking not found.'
            });
        }

        const {
            data: chalet,
            error: chaletError
        } = await supabase
            .from('chalets')
            .select('id, name, user_id')
            .eq('id', booking.chalet_id)
            .single();

        if (chaletError || !chalet) {
            throw new Error(
                'Property not found.'
            );
        }

        if (isPublicCheckout) {
            const publicChaletId =
                process.env.PUBLIC_SITE_CHALET_ID;

            const validPublicBooking =
                booking.chalet_id ===
                    publicChaletId &&
                booking.external_uid ===
                    bookingReference &&
                booking.booking_channel ===
                    'website' &&
                booking.origin ===
                    'chalet-ayana' &&
                booking.status ===
                    'pending';

            if (!validPublicBooking) {
                return res.status(403).json({
                    success: false,
                    error:
                        'Invalid public booking reference.'
                });
            }
        } else if (
            chalet.user_id !== user.id
        ) {
            return res.status(403).json({
                success: false,
                error:
                    'Not authorized for this booking.'
            });
        }

        if (
            String(booking.source).toLowerCase() !==
            'direct'
        ) {
            return res.status(409).json({
                success: false,
                error:
                    'Payments for external platform bookings are not managed by ALTARA.'
            });
        }

        if (booking.status === 'cancelled') {
            return res.status(409).json({
                success: false,
                error:
                    'Cannot request payment for a cancelled booking.'
            });
        }

        if (booking.payment_status === 'paid') {
            return res.status(409).json({
                success: false,
                error: 'Booking is already paid.'
            });
        }

        const total =
            Number(booking.total_revenue || 0);

        const amountPaid =
            Number(booking.amount_paid || 0);

        const balance =
            Math.max(total - amountPaid, 0);

        if (balance <= 0) {
            return res.status(409).json({
                success: false,
                error: 'No balance remains to be paid.'
            });
        }

        /*
         * Reuse the current Stripe Checkout Session whenever
         * it is still open. This prevents multiple payment links.
         */
        if (
            booking.payment_provider === 'stripe' &&
            booking.payment_reference?.startsWith('cs_')
        ) {
            try {
                const existingSession =
                    await stripe.checkout.sessions.retrieve(
                        booking.payment_reference
                    );

                const expectedAmountCents =
                    Math.round(balance * 100);

                const sessionAmountMatches =
                    Number(existingSession.amount_total) ===
                    expectedAmountCents;

                const sessionCurrencyMatches =
                    String(existingSession.currency || '')
                        .toLowerCase() ===
                    String(booking.currency || 'CAD')
                        .toLowerCase();

                const sessionDatesMatch =
                    existingSession.metadata
                        ?.booking_start_date ===
                        booking.start_date &&
                    existingSession.metadata
                        ?.booking_end_date ===
                        booking.end_date;

                if (
                    existingSession.status === 'open' &&
                    existingSession.url &&
                    sessionAmountMatches &&
                    sessionCurrencyMatches &&
                    sessionDatesMatch
                ) {
                    return res.status(200).json({
                        success: true,
                        sessionId: existingSession.id,
                        url: existingSession.url,
                        reused: true,
                        expiresAt:
                            existingSession.expires_at
                    });
                }

                if (existingSession.status === 'open') {
                    await stripe.checkout.sessions.expire(
                        existingSession.id
                    );
                }
            } catch (error) {
                console.warn(
                    '[CREATE CHECKOUT SESSION] Existing Stripe session unavailable:',
                    error.message
                );
            }
        }

        const currency =
            String(booking.currency || 'CAD')
                .toLowerCase();

        /*
         * ALTARA and the public booking site are independent.
         *
         * ALTARA_APP_URL:
         *   back-office / admin return URL.
         *
         * PUBLIC_BOOKING_SITE_URL:
         *   public website return URL (AYANA today).
         *
         * req.headers.origin remains a migration fallback.
         */
        const altaraAppUrl =
            process.env.ALTARA_APP_URL ||
            req.headers.origin;

        const publicBookingSiteUrl =
            process.env.PUBLIC_BOOKING_SITE_URL ||
            req.headers.origin;

        const appUrl =
            isPublicCheckout
                ? publicBookingSiteUrl
                : altaraAppUrl;

        if (!appUrl) {
            throw new Error(
                isPublicCheckout
                    ? 'PUBLIC_BOOKING_SITE_URL configuration missing.'
                    : 'ALTARA_APP_URL configuration missing.'
            );
        }

        const session =
            await stripe.checkout.sessions.create({
                mode: 'payment',

                ...(isPublicCheckout
                    ? {
                        expires_at:
                            Math.floor(Date.now() / 1000) +
                            30 * 60
                    }
                    : {}),

                client_reference_id: booking.id,

                customer_email:
                    booking.guest_email || undefined,

                locale: 'fr-CA',

                metadata: {
                    booking_id: booking.id,
                    chalet_id: booking.chalet_id,
                    altara_user_id:
                        chalet.user_id,
                    checkout_origin:
                        isPublicCheckout
                            ? 'website'
                            : 'altara-admin',
                    expected_amount_cents:
                        String(Math.round(balance * 100)),
                    expected_currency:
                        String(booking.currency || 'CAD')
                            .toLowerCase(),
                    booking_start_date:
                        booking.start_date,
                    booking_end_date:
                        booking.end_date
                },

                line_items: [
                    {
                        quantity: 1,

                        price_data: {
                            currency,

                            unit_amount:
                                Math.round(balance * 100),

                            product_data: {
                                name:
                                    `Séjour — ${chalet.name}`,

                                description:
                                    `${booking.start_date} → ${booking.end_date}`
                            }
                        }
                    }
                ],

                success_url:
                    `${appUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,

                cancel_url:
                    isPublicCheckout
                        ? `${appUrl}/reservation?payment=cancelled`
                        : `${appUrl}/planning?payment=cancelled&booking=${booking.id}`
            });

        const {
            error: updateError
        } = await supabase
            .from('booking')
            .update({
                payment_status: 'payment_pending',
                payment_provider: 'stripe',
                payment_reference: session.id
            })
            .eq('id', booking.id);

        if (updateError) {
            /*
             * Do not leave an orphan Checkout Session active
             * if ALTARA could not save its reference.
             */
            try {
                await stripe.checkout.sessions.expire(
                    session.id
                );
            } catch {
                // Best effort cleanup.
            }

            throw updateError;
        }

        return res.status(200).json({
            success: true,
            sessionId: session.id,
            url: session.url,
            reused: false,
            expiresAt: session.expires_at
        });

    } catch (error) {
        console.error(
            '[CREATE CHECKOUT SESSION]',
            error
        );

        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
