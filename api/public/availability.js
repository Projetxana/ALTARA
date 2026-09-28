import { applyPublicCors } from '../../server/lib/public-cors.js';
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

    const date = new Date(
        year,
        month - 1,
        day
    );

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
            { methods: ['GET', 'OPTIONS'] }
        )
    ) {
        return;
    }

    if (req.method !== 'GET') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed'
        });
    }

    try {
        const supabaseUrl =
            process.env.VITE_SUPABASE_URL;

        const serviceRoleKey =
            process.env.SUPABASE_SERVICE_ROLE_KEY;

        const chaletId =
            process.env.PUBLIC_SITE_CHALET_ID;

        if (!supabaseUrl || !serviceRoleKey) {
            throw new Error(
                'Supabase server configuration missing.'
            );
        }

        if (!chaletId) {
            throw new Error(
                'PUBLIC_SITE_CHALET_ID is not configured.'
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
            data: property,
            error: propertyError
        } = await supabase
            .from('chalets')
            .select('*')
            .eq('id', chaletId)
            .single();

        if (propertyError || !property) {
            throw new Error(
                'Public property not found.'
            );
        }

        const {
            data: bookings,
            error: bookingError
        } = await supabase
            .from('booking')
            .select(`
                start_date,
                end_date,
                status
            `)
            .eq('chalet_id', chaletId)
            .in('status', [
                'confirmed',
                'pending'
            ]);

        if (bookingError) {
            throw bookingError;
        }

        const now =
            new Date().toISOString();

        const {
            data: blocks,
            error: blockError
        } = await supabase
            .from('calendar_blocks')
            .select(`
                start_date,
                end_date,
                block_type,
                expires_at
            `)
            .eq('chalet_id', chaletId)
            .or(
                `expires_at.is.null,expires_at.gt.${now}`
            );

        if (blockError) {
            throw blockError;
        }

        const blocked = [
            ...(bookings || []).map(item => ({
                start: item.start_date,
                end: item.end_date,
                type: 'booking',
                status: item.status
            })),

            ...(blocks || []).map(item => ({
                start: item.start_date,
                end: item.end_date,
                type: 'block',
                blockType: item.block_type
            }))
        ];

        const checkIn =
            req.query.checkIn;

        const checkOut =
            req.query.checkOut;

        const guests =
            Math.max(
                1,
                Number(req.query.guests || 1)
            );

        const pets =
            Math.max(
                0,
                Number(req.query.pets || 0)
            );

        const promoCode =
            String(req.query.promoCode || '')
                .trim()
                .toUpperCase();

        if (!checkIn && !checkOut) {
            /*
             * Public calendar pricing.
             * Load canonical ALTARA rate rules and resolve
             * the nightly rate for the next 18 months.
             */
            const {
                data: calendarRules,
                error: calendarRulesError
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

            if (calendarRulesError) {
                throw calendarRulesError;
            }

            const today = new Date();

            const calendarStart = [
                today.getFullYear(),
                String(today.getMonth() + 1).padStart(2, '0'),
                String(today.getDate()).padStart(2, '0')
            ].join('-');

            const calendarEndDate = new Date(
                today.getFullYear(),
                today.getMonth() + 18,
                today.getDate()
            );

            const calendarEnd = [
                calendarEndDate.getFullYear(),
                String(calendarEndDate.getMonth() + 1).padStart(2, '0'),
                String(calendarEndDate.getDate()).padStart(2, '0')
            ].join('-');

            const calendarRates =
                resolveRatesForRange(
                    calendarRules || [],
                    calendarStart,
                    calendarEnd
                );

            const dailyRates =
                Object.fromEntries(
                    calendarRates.map(rate => [
                        rate.date,
                        {
                            nightlyRate: Number(rate.nightlyRate),
                            minStay: Number(rate.minStay || 1),
                            isWeekend: Boolean(rate.isWeekend),
                            rule: rate.rule
                        }
                    ])
                );

            return res.status(200).json({
                success: true,

                property: {
                    id: property.id,
                    name: property.name,
                    location: 'Sainte-Adèle, QC'
                },

                blocked,
                dailyRates
            });
        }

        if (!checkIn || !checkOut) {
            return res.status(400).json({
                success: false,
                error:
                    'checkIn and checkOut are both required.'
            });
        }

        if (checkOut <= checkIn) {
            return res.status(400).json({
                success: false,
                error:
                    'Check-out must be after check-in.'
            });
        }

        const overlaps =
            blocked.some(item =>
                checkIn < item.end &&
                checkOut > item.start
            );

        if (overlaps) {
            return res.status(409).json({
                success: false,
                available: false,
                error:
                    'Ces dates ne sont plus disponibles.'
            });
        }

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
                        Number(night.minStay || 1)
                    ),
                1
            );

        if (
            stay.numberOfNights <
            minimumStay
        ) {
            return res.status(409).json({
                success: false,
                available: false,
                error:
                    `Séjour minimum de ${minimumStay} nuits pour ces dates.`,
                minimumStay
            });
        }

        const accommodation =
            roundMoney(
                stay.estimatedAccommodationRevenue
            );

        const bookingSettings =
            getBookingSettingsFromChalet(
                property
            );

        const includedGuests =
            Math.max(
                0,
                Number(
                    bookingSettings.fees?.includedGuests || 0
                )
            );

        const extraGuestRate =
            Math.max(
                0,
                Number(
                    bookingSettings.fees?.extraGuest || 0
                )
            );

        const petRate =
            Math.max(
                0,
                Number(
                    bookingSettings.fees?.pet || 0
                )
            );

        const extraGuestCount =
            Math.max(
                0,
                guests - includedGuests
            );

        const extraGuestFee =
            roundMoney(
                extraGuestCount *
                extraGuestRate *
                stay.numberOfNights
            );

        const petFee =
            roundMoney(
                pets * petRate
            );

        const extras =
            roundMoney(
                extraGuestFee +
                petFee
            );

        let promo = null;
        let discountAmount = 0;
        let discountedAccommodation = accommodation;

        if (promoCode) {
            const {
                data: promoRow,
                error: promoError
            } = await supabase
                .from('promo_codes')
                .select(`
                    id,
                    code,
                    discount_type,
                    discount_value,
                    active,
                    valid_from,
                    valid_until,
                    max_uses,
                    uses_count,
                    min_nights
                `)
                .eq('chalet_id', chaletId)
                .eq('code', promoCode)
                .maybeSingle();

            if (promoError) {
                throw promoError;
            }

            const today =
                new Date().toISOString().slice(0, 10);

            const promoValid =
                promoRow &&
                promoRow.active &&
                (!promoRow.valid_from ||
                    today >= promoRow.valid_from) &&
                (!promoRow.valid_until ||
                    today <= promoRow.valid_until) &&
                (!promoRow.max_uses ||
                    Number(promoRow.uses_count || 0) <
                        Number(promoRow.max_uses)) &&
                stay.numberOfNights >=
                    Number(promoRow.min_nights || 1);

            if (!promoValid) {
                return res.status(400).json({
                    success: false,
                    error:
                        'Ce code promo est invalide ou n’est plus disponible.'
                });
            }

            if (promoRow.discount_type === 'percent') {
                discountAmount =
                    roundMoney(
                        accommodation *
                        Math.max(
                            0,
                            Number(promoRow.discount_value || 0)
                        ) /
                        100
                    );
            } else {
                discountAmount =
                    roundMoney(
                        Math.max(
                            0,
                            Number(promoRow.discount_value || 0)
                        )
                    );
            }

            discountAmount =
                Math.min(
                    accommodation,
                    discountAmount
                );

            discountedAccommodation =
                roundMoney(
                    accommodation -
                    discountAmount
                );

            promo = {
                code: promoRow.code,
                type: promoRow.discount_type,
                value:
                    Number(promoRow.discount_value),
                discountAmount
            };
        }

        const bookingTotals =
            calculateBookingTotals({
                accommodation:
                    discountedAccommodation,
                extras,
                settings:
                    bookingSettings
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

        return res.status(200).json({
            success: true,
            available: true,

            property: {
                id: property.id,
                name: property.name,
                location: 'Sainte-Adèle, QC'
            },

            blocked,

            quote: {
                checkIn,
                checkOut,
                nights:
                    stay.numberOfNights,

                accommodation,
                discountedAccommodation,
                discountAmount,
                promo,
                cleaningFee,
                extras,
                extraGuestFee,
                extraGuestCount,
                petFee,
                guests,
                pets,
                feeSettings: {
                    cleaning:
                        bookingSettings.fees?.cleaning,
                    pet:
                        bookingSettings.fees?.pet,
                    extraGuest:
                        bookingSettings.fees?.extraGuest,
                    includedGuests:
                        bookingSettings.fees?.includedGuests
                },
                subtotal,                lodgingTax,
                gst,
                qst,
                taxes,
                total,

                minimumStay,
                currency: 'CAD',

                nightlyBreakdown:
                    stay.nightlyBreakdown
            }
        });

    } catch (error) {
        console.error(
            '[PUBLIC AVAILABILITY]',
            error
        );

        return res.status(500).json({
            success: false,
            error:
                'Impossible de charger les disponibilités.'
        });
    }
}
