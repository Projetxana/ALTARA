import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export default {
    async fetch(request) {
        if (request.method !== 'POST') {
            return Response.json(
                { error: 'Method not allowed' },
                { status: 405 }
            );
        }

        const stripeSecretKey =
            process.env.STRIPE_SECRET_KEY;

        const webhookSecret =
            process.env.STRIPE_WEBHOOK_SECRET;

        const supabaseUrl =
            process.env.VITE_SUPABASE_URL;

        const serviceRoleKey =
            process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (
            !stripeSecretKey ||
            !webhookSecret ||
            !supabaseUrl ||
            !serviceRoleKey
        ) {
            console.error(
                '[Stripe webhook] Missing server configuration',
                {
                    stripe:
                        Boolean(stripeSecretKey),
                    webhook:
                        Boolean(webhookSecret),
                    supabase:
                        Boolean(supabaseUrl),
                    serviceRole:
                        Boolean(serviceRoleKey)
                }
            );

            return Response.json(
                {
                    error:
                        'Webhook server configuration missing'
                },
                { status: 500 }
            );
        }

        const stripe =
            new Stripe(stripeSecretKey);

        const signature =
            request.headers.get(
                'stripe-signature'
            );

        if (!signature) {
            return new Response(
                'Stripe signature missing',
                { status: 400 }
            );
        }

        /*
         * IMPORTANT:
         * Stripe must receive the exact raw body.
         * Do not call request.json() before this.
         */
        const rawBody =
            await request.text();

        let event;

        try {
            event =
                stripe.webhooks.constructEvent(
                    rawBody,
                    signature,
                    webhookSecret
                );
        } catch (error) {
            console.error(
                '[Stripe webhook] Signature verification failed:',
                error.message
            );

            return new Response(
                `Webhook signature error: ${error.message}`,
                { status: 400 }
            );
        }

        console.log(
            `[Stripe webhook] ${event.type}`
        );

        /*
         * Ignore events we don't use,
         * but acknowledge them with HTTP 200.
         */
        const supportedEvents = [
            'checkout.session.completed',
            'checkout.session.async_payment_succeeded',
            'checkout.session.async_payment_failed',
            'checkout.session.expired'
        ];

        if (!supportedEvents.includes(event.type)) {
            return Response.json({
                received: true,
                ignored: true
            });
        }

        const session =
            event.data.object;

        const bookingId =
            session.metadata?.booking_id ||
            session.client_reference_id;

        if (!bookingId) {
            console.warn(
                '[Stripe webhook] No booking ID'
            );

            return Response.json({
                received: true,
                ignored: 'missing_booking_id'
            });
        }

        const supabase =
            createClient(
                supabaseUrl,
                serviceRoleKey,
                {
                    auth: {
                        persistSession: false,
                        autoRefreshToken: false
                    }
                }
            );

        try {
            if (
                event.type ===
                    'checkout.session.completed' ||
                event.type ===
                    'checkout.session.async_payment_succeeded'
            ) {
                if (
                    session.payment_status !==
                    'paid'
                ) {
                    return Response.json({
                        received: true,
                        ignored: 'not_paid'
                    });
                }

                const {
                    data: booking,
                    error: bookingError
                } = await supabase
                    .from('booking')
                    .select(`
                        id,
                        total_revenue,
                        amount_paid,
                        currency,
                        payment_reference
                    `)
                    .eq('id', bookingId)
                    .single();

                if (
                    bookingError ||
                    !booking
                ) {
                    throw (
                        bookingError ||
                        new Error(
                            'Booking not found'
                        )
                    );
                }

                const expectedBalanceCents =
                    Math.round(
                        Math.max(
                            Number(booking.total_revenue || 0) -
                            Number(booking.amount_paid || 0),
                            0
                        ) * 100
                    );

                const paidAmountCents =
                    Number(session.amount_total || 0);

                const expectedCurrency =
                    String(booking.currency || 'CAD')
                        .toLowerCase();

                const paidCurrency =
                    String(session.currency || '')
                        .toLowerCase();

                const metadataAmount =
                    Number(
                        session.metadata
                            ?.expected_amount_cents || 0
                    );

                const metadataCurrency =
                    String(
                        session.metadata
                            ?.expected_currency || ''
                    ).toLowerCase();

                if (
                    paidAmountCents <= 0 ||
                    paidAmountCents !== expectedBalanceCents ||
                    paidCurrency !== expectedCurrency
                ) {
                    console.error(
                        '[Stripe webhook] Payment validation failed',
                        {
                            bookingId,
                            expectedBalanceCents,
                            paidAmountCents,
                            expectedCurrency,
                            paidCurrency
                        }
                    );

                    return Response.json(
                        {
                            received: false,
                            error:
                                'Payment amount or currency mismatch'
                        },
                        { status: 409 }
                    );
                }

                if (
                    metadataAmount &&
                    metadataAmount !== paidAmountCents
                ) {
                    console.error(
                        '[Stripe webhook] Metadata amount mismatch'
                    );

                    return Response.json(
                        {
                            received: false,
                            error:
                                'Checkout metadata amount mismatch'
                        },
                        { status: 409 }
                    );
                }

                if (
                    metadataCurrency &&
                    metadataCurrency !== paidCurrency
                ) {
                    console.error(
                        '[Stripe webhook] Metadata currency mismatch'
                    );

                    return Response.json(
                        {
                            received: false,
                            error:
                                'Checkout metadata currency mismatch'
                        },
                        { status: 409 }
                    );
                }

                /*
                 * Protect against an old Checkout
                 * session changing a newer payment.
                 */
                if (
                    booking.payment_reference &&
                    booking.payment_reference !==
                        session.id
                ) {
                    console.warn(
                        '[Stripe webhook] Old Checkout session ignored'
                    );

                    return Response.json({
                        received: true,
                        ignored: 'stale_session'
                    });
                }

                const {
                    error: updateError
                } = await supabase
                    .from('booking')
                    .update({
                        payment_status: 'paid',
                        amount_paid:
                            Number(booking.amount_paid || 0) +
                            paidAmountCents / 100,
                        payment_provider:
                            'stripe',
                        payment_reference:
                            session.id
                    })
                    .eq('id', bookingId);

                if (updateError) {
                    throw updateError;
                }

                console.log(
                    `[Stripe webhook] Booking ${bookingId} marked PAID`
                );
            }

            if (
                event.type ===
                    'checkout.session.expired' ||
                event.type ===
                    'checkout.session.async_payment_failed'
            ) {
                const {
                    error: updateError
                } = await supabase
                    .from('booking')
                    .update({
                        payment_status: 'unpaid'
                    })
                    .eq('id', bookingId)
                    .eq(
                        'payment_reference',
                        session.id
                    );

                if (updateError) {
                    throw updateError;
                }
            }

            return Response.json({
                received: true
            });

        } catch (error) {
            console.error(
                '[Stripe webhook] Processing error:',
                error
            );

            return Response.json(
                {
                    received: false,
                    error: error.message
                },
                { status: 500 }
            );
        }
    }
};
