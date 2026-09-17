import { applyPublicCors } from '../../server/lib/public-cors.js';
import { randomUUID } from 'crypto';
import { createClient } from '@supabase/supabase-js';

import {
    resolveRatesForRange
} from '../../src/features/pricing/RateResolver.js';

import {
    summarizeStayRates
} from '../../src/features/pricing/BookingPricingResolver.js';

import {
    calculateBookingTotals,
    getBookingSettingsFromChalet
} from '../../src/features/pricing/BookingCostCalculator.js';

const previousDate = dateString => {
    const [year, month, day] =
        dateString.split('-').map(Number);

    const date =
        new Date(year, month - 1, day);

    date.setDate(
        date.getDate() - 1
    );

    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0')
    ].join('-');
};

const roundMoney = value =>
    Math.round(Number(value || 0) * 100) / 100;

export default async function handler(req, res) {
    if (
        applyPublicCors(
            req,
            res,
            { methods: ['POST', 'OPTIONS'] }
        )
    ) {
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed'
        });
    }

    try {
        const {
            checkIn,
            checkOut,
            guests,
            fullName,
            email,
            phone,
            note
        } = req.body || {};

        if (
            !checkIn ||
            !checkOut ||
            !fullName ||
            !email
        ) {
            return res.status(400).json({
                success: false,
                error:
                    'Dates, nom et courriel sont requis.'
            });
        }

        if (checkOut <= checkIn) {
            return res.status(400).json({
                success: false,
                error:
                    'La date de départ doit être après la date d’arrivée.'
            });
        }

        const supabaseUrl =
            process.env.VITE_SUPABASE_URL;

        const serviceRoleKey =
            process.env.SUPABASE_SERVICE_ROLE_KEY;

        const chaletId =
            process.env.PUBLIC_SITE_CHALET_ID;

        if (
            !supabaseUrl ||
            !serviceRoleKey ||
            !chaletId
        ) {
            throw new Error(
                'Public booking configuration missing.'
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

        /*
         * Never accept chaletId from the browser.
         * The public site is attached server-side
         * to PUBLIC_SITE_CHALET_ID.
         */
        const {
            data: chalet,
            error: chaletError
        } = await supabase
            .from('chalets')
            .select('*')
            .eq('id', chaletId)
            .single();

        if (chaletError || !chalet) {
            throw new Error(
                'Public property not found.'
            );
        }

        /*
         * Authoritative availability check:
         * confirmed + pending bookings.
         */
        const {
            data: overlappingBookings,
            error: overlapError
        } = await supabase
            .from('booking')
            .select('id')
            .eq('chalet_id', chaletId)
            .in(
                'status',
                ['confirmed', 'pending']
            )
            .lt('start_date', checkOut)
            .gt('end_date', checkIn);

        if (overlapError) {
            throw overlapError;
        }

        if (
            overlappingBookings?.length
        ) {
            return res.status(409).json({
                success: false,
                error:
                    'Ces dates ne sont plus disponibles.'
            });
        }

        /*
         * Calendar blocks also make the property unavailable.
         */
        const now =
            new Date().toISOString();

        const {
            data: overlappingBlocks,
            error: blockError
        } = await supabase
            .from('calendar_blocks')
            .select('id')
            .eq('chalet_id', chaletId)
            .lt('start_date', checkOut)
            .gt('end_date', checkIn)
            .or(
                `expires_at.is.null,expires_at.gt.${now}`
            );

        if (blockError) {
            throw blockError;
        }

        if (
            overlappingBlocks?.length
        ) {
            return res.status(409).json({
                success: false,
                error:
                    'Ces dates ne sont plus disponibles.'
            });
        }

        /*
         * Canonical ALTARA pricing.
         */
        const {
            data: rules,
            error: rulesError
        } = await supabase
            .from('rate_rules')
            .select(`
                id,
                chalet_id,
                name,
                rule_type,
                start_date,
                end_date,
                month_of_year,
                nightly_rate,
                weekend_rate,
                min_stay,
                priority,
                enabled
            `)
            .eq('chalet_id', chaletId)
            .eq('enabled', true)
            .order(
                'priority',
                { ascending: false }
            );

        if (rulesError) {
            throw rulesError;
        }

        const lastNight =
            previousDate(checkOut);

        const resolvedRates =
            resolveRatesForRange(
                rules || [],
                checkIn,
                lastNight
            );

        const stay =
            summarizeStayRates(
                chaletId,
                checkIn,
                checkOut,
                resolvedRates
            );

        const minimumStay =
            resolvedRates.reduce(
                (max, night) =>
                    Math.max(
                        max,
                        Number(
                            night.minStay || 1
                        )
                    ),
                1
            );

        if (
            stay.numberOfNights <
            minimumStay
        ) {
            return res.status(409).json({
                success: false,
                error:
                    `Séjour minimum de ${minimumStay} nuits pour ces dates.`
            });
        }

        const accommodation =
            roundMoney(
                stay.estimatedAccommodationRevenue
            );

        const bookingTotals =
            calculateBookingTotals({
                accommodation,
                settings:
                    getBookingSettingsFromChalet(
                        chalet
                    )
            });

        const cleaningFee =
            bookingTotals.cleaningFee;

        const subtotal =
            bookingTotals.subtotal;

        const lodgingTax =
            bookingTotals.lodgingTax;

        const gst =
            bookingTotals.gst;

        const qst =
            bookingTotals.qst;

        const taxes =
            bookingTotals.taxes;

        const total =
            bookingTotals.total;

        /*
         * High-entropy public booking reference.
         * It will act as the authorization reference
         * for the public Stripe Checkout request.
         */
        const externalUid =
            `web_${randomUUID()}`;

        const bookingData = {
            chalet_id: chaletId,
            user_id: chalet.user_id,

            source: 'direct',
            booking_channel: 'website',
            origin: 'chalet-ayana',
            external_uid: externalUid,

            guest_name: fullName.trim(),
            guest_email:
                email.trim().toLowerCase(),
            guest_phone:
                phone?.trim() || null,

            guest_note:
                [
                    guests
                        ? `${guests} voyageur(s)`
                        : null,
                    note?.trim() || null
                ]
                    .filter(Boolean)
                    .join(' — ') || null,

            start_date: checkIn,
            end_date: checkOut,
            check_in: checkIn,
            check_out: checkOut,

            status: 'pending',

            payment_status: 'unpaid',
            amount_paid: 0,
            total_revenue: total,

            currency: 'CAD',

            color: '#C5A66A'
        };

        const {
            data: newBooking,
            error: insertError
        } = await supabase
            .from('booking')
            .insert(bookingData)
            .select(`
                id,
                external_uid,
                total_revenue,
                currency
            `)
            .single();

        if (insertError) {
            throw insertError;
        }

        return res.status(200).json({
            success: true,

            bookingId:
                newBooking.id,

            bookingReference:
                newBooking.external_uid,

            total:
                Number(
                    newBooking.total_revenue
                ),

            currency:
                newBooking.currency || 'CAD',

            propertyName:
                chalet.name
        });

    } catch (error) {
        console.error(
            '[REQUEST BOOKING]',
            error
        );

        return res.status(500).json({
            success: false,
            error:
                'Impossible de créer la réservation.',
            details:
                error.message || 'Unknown server error',
            code:
                error.code || null
        });
    }
}
