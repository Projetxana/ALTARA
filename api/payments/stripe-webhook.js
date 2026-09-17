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

        const ensureCleaningTask =
            async (bookingRecord) => {

                if (
                    !bookingRecord?.id ||
                    !bookingRecord?.chalet_id ||
                    !bookingRecord?.end_date
                ) {
                    throw new Error(
                        'Missing booking data for cleaning task'
                    );
                }

                const {
                    data: existingTask,
                    error: existingTaskError
                } = await supabase
                    .from('cleaning_tasks')
                    .select('id')
                    .eq(
                        'booking_id',
                        bookingRecord.id
                    )
                    .limit(1)
                    .maybeSingle();

                if (existingTaskError) {
                    throw existingTaskError;
                }

                if (existingTask) {
                    return existingTask;
                }

                const {
                    data: createdTask,
                    error: cleaningError
                } = await supabase
                    .from('cleaning_tasks')
                    .insert({
                        chalet_id:
                            bookingRecord.chalet_id,
                        booking_id:
                            bookingRecord.id,
                        date:
                            bookingRecord.end_date,
                        status: 'pending',
                        auto_generated: true
                    })
                    .select('id')
                    .single();

                if (cleaningError) {
                    throw cleaningError;
                }

                console.log(
                    `[Stripe webhook] Cleaning task created for booking ${bookingRecord.id}`
                );

                return createdTask;
            };

        const ensureConfirmationEmail =
            async (bookingRecord) => {

                if (
                    !bookingRecord?.guest_email ||
                    bookingRecord?.confirmation_email_sent_at
                ) {
                    return;
                }

                const apiKey =
                    process.env.RESEND_API_KEY;

                const fromEmail =
                    process.env.RESEND_FROM_EMAIL;

                if (!apiKey || !fromEmail) {
                    console.warn(
                        '[Stripe webhook] Resend not configured'
                    );
                    return;
                }

                const escapeHtml = value =>
                    String(value ?? '')
                        .replaceAll('&', '&amp;')
                        .replaceAll('<', '&lt;')
                        .replaceAll('>', '&gt;')
                        .replaceAll('"', '&quot;')
                        .replaceAll("'", '&#039;');

                const formatDate = value => {
                    if (!value) return '';

                    return new Intl.DateTimeFormat(
                        'fr-CA',
                        {
                            dateStyle: 'long',
                            timeZone: 'UTC'
                        }
                    ).format(
                        new Date(`${value}T12:00:00Z`)
                    );
                };

                const amount =
                    new Intl.NumberFormat(
                        'fr-CA',
                        {
                            style: 'currency',
                            currency:
                                String(
                                    bookingRecord.currency ||
                                    'CAD'
                                ).toUpperCase()
                        }
                    ).format(
                        Number(
                            bookingRecord.total_revenue ||
                            0
                        )
                    );

                const guestName =
                    bookingRecord.guest_name ||
                    'cher voyageur';

                const reference =
                    bookingRecord.external_uid ||
                    bookingRecord.id;

                const checkIn =
                    formatDate(
                        bookingRecord.start_date
                    );

                const checkOut =
                    formatDate(
                        bookingRecord.end_date
                    );

                const html = `
                    <div style="
                        max-width:620px;
                        margin:0 auto;
                        font-family:Arial,sans-serif;
                        color:#173A35;
                        line-height:1.6;
                    ">
                        <h1>
                            Réservation confirmée
                        </h1>

                        <p>
                            Bonjour ${escapeHtml(guestName)},
                        </p>

                        <p>
                            Votre paiement a bien été reçu.
                            Votre séjour au
                            <strong>Chalet Ayana</strong>
                            est maintenant confirmé.
                        </p>

                        <div style="
                            background:#F7F4EE;
                            padding:22px;
                            border-radius:12px;
                            margin:24px 0;
                        ">
                            <p>
                                <strong>Arrivée :</strong>
                                ${escapeHtml(checkIn)}
                            </p>

                            <p>
                                <strong>Départ :</strong>
                                ${escapeHtml(checkOut)}
                            </p>

                            <p>
                                <strong>Montant payé :</strong>
                                ${escapeHtml(amount)}
                            </p>

                            <p>
                                <strong>Référence :</strong>
                                ${escapeHtml(reference)}
                            </p>
                        </div>

                        <p>
                            Nous vous transmettrons les
                            informations pratiques de votre
                            séjour avant votre arrivée.
                        </p>

                        <p>
                            À bientôt,<br>
                            <strong>Chalet Ayana</strong>
                        </p>
                    </div>
                `;

                const response =
                    await fetch(
                        'https://api.resend.com/emails',
                        {
                            method: 'POST',
                            headers: {
                                Authorization:
                                    `Bearer ${apiKey}`,
                                'Content-Type':
                                    'application/json',
                                'Idempotency-Key':
                                    `ayana-booking-${bookingRecord.id}`
                            },
                            body: JSON.stringify({
                                from: fromEmail,
                                to: [
                                    bookingRecord.guest_email
                                ],
                                subject:
                                    'Votre réservation au Chalet Ayana est confirmée',
                                html
                            })
                        }
                    );

                if (!response.ok) {
                    const body =
                        await response.text();

                    throw new Error(
                        `Resend ${response.status}: ${body}`
                    );
                }

                const sentAt =
                    new Date().toISOString();

                const {
                    error: trackingError
                } = await supabase
                    .from('booking')
                    .update({
                        confirmation_email_sent_at:
                            sentAt
                    })
                    .eq('id', bookingRecord.id);

                if (trackingError) {
                    throw trackingError;
                }

                bookingRecord
                    .confirmation_email_sent_at =
                    sentAt;

                console.log(
                    `[Stripe webhook] Confirmation email sent for booking ${bookingRecord.id}`
                );
            };

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
                        chalet_id,
                        guest_name,
                        guest_email,
                        start_date,
                        end_date,
                        external_uid,
                        confirmation_email_sent_at,
                        total_revenue,
                        amount_paid,
                        currency,
                        payment_reference,
                        payment_status,
                        status,
                        booking_channel,
                        origin
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

                /*
                 * Stripe may retry the same webhook.
                 * Do not count an already processed payment twice.
                 * Still repair the cleaning task if necessary.
                 */
                if (
                    booking.payment_status === 'paid' &&
                    booking.payment_reference ===
                        session.id
                ) {
                    await ensureCleaningTask(
                        booking
                    );

                    await ensureConfirmationEmail(
                        booking
                    );

                    return Response.json({
                        received: true,
                        duplicate: true
                    });
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
                        status:
                            booking.status === 'pending'
                                ? 'confirmed'
                                : booking.status,
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

                await ensureCleaningTask(
                    booking
                );

                booking.payment_reference =
                    session.id;

                await ensureConfirmationEmail(
                    booking
                );

                console.log(
                    `[Stripe webhook] Booking ${bookingId} marked PAID`
                );
            }

            if (
                event.type ===
                    'checkout.session.expired'
            ) {
                const {
                    error: updateError
                } = await supabase
                    .from('booking')
                    .update({
                        status: 'cancelled',
                        payment_status: 'unpaid'
                    })
                    .eq('id', bookingId)
                    .eq(
                        'payment_reference',
                        session.id
                    )
                    .eq('status', 'pending')
                    .eq(
                        'booking_channel',
                        'website'
                    );

                if (updateError) {
                    throw updateError;
                }
            }

            if (
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
