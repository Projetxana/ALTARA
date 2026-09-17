const roundMoney = value =>
    Math.round(Number(value || 0) * 100) / 100;

const safeNumber = (value, fallback = 0) => {
    const number = Number(value);
    return Number.isFinite(number)
        ? number
        : fallback;
};

export const DEFAULT_BOOKING_FEES = {
    cleaning: 150,
    pet: 30,
    extraGuest: 20,
    includedGuests: 4,
    securityDeposit: 500
};

export const DEFAULT_TAX_SETTINGS = {
    lodgingTaxEnabled: true,
    lodgingTaxPct: 3.5,

    gstEnabled: true,
    gstPct: 5,

    qstEnabled: true,
    qstPct: 9.975
};

export function getBookingSettingsFromChalet(
    chalet = {}
) {
    /*
     * Browser objects currently expose pricingInfo.
     * Supabase server rows may expose pricing_info
     * depending on the legacy schema.
     */
    const rawPricingInfo =
        chalet.pricingInfo ??
        chalet.pricing_info ??
        {};

    let pricingInfo =
        rawPricingInfo;

    if (typeof rawPricingInfo === 'string') {
        try {
            pricingInfo =
                JSON.parse(rawPricingInfo);
        } catch (error) {
            console.warn(
                '[BookingCostCalculator] Invalid pricing_info JSON:',
                error.message
            );

            pricingInfo = {};
        }
    }

    return {
        fees: {
            ...DEFAULT_BOOKING_FEES,
            ...(pricingInfo?.fees || {})
        },

        taxes: {
            ...DEFAULT_TAX_SETTINGS,
            ...(pricingInfo?.taxes || {})
        }
    };
}

export function calculateBookingTotals({
    accommodation = 0,
    extras = 0,
    settings = {}
} = {}) {
    const fees = {
        ...DEFAULT_BOOKING_FEES,
        ...(settings.fees || {})
    };

    const taxSettings = {
        ...DEFAULT_TAX_SETTINGS,
        ...(settings.taxes || {})
    };

    const accommodationAmount =
        roundMoney(
            Math.max(
                0,
                safeNumber(accommodation)
            )
        );

    const cleaningFee =
        roundMoney(
            Math.max(
                0,
                safeNumber(fees.cleaning)
            )
        );

    const extrasAmount =
        roundMoney(
            Math.max(
                0,
                safeNumber(extras)
            )
        );

    /*
     * Québec lodging tax:
     * 3.5% of the accommodation/nightly portion.
     */
    const lodgingTax =
        taxSettings.lodgingTaxEnabled
            ? roundMoney(
                accommodationAmount *
                (
                    Math.max(
                        0,
                        safeNumber(
                            taxSettings.lodgingTaxPct,
                            3.5
                        )
                    ) / 100
                )
            )
            : 0;

    /*
     * GST/QST base:
     * accommodation
     * + cleaning / taxable extras
     * + lodging tax.
     */
    const taxBase =
        roundMoney(
            accommodationAmount +
            cleaningFee +
            extrasAmount +
            lodgingTax
        );

    const gst =
        taxSettings.gstEnabled
            ? roundMoney(
                taxBase *
                (
                    Math.max(
                        0,
                        safeNumber(
                            taxSettings.gstPct,
                            5
                        )
                    ) / 100
                )
            )
            : 0;

    const qst =
        taxSettings.qstEnabled
            ? roundMoney(
                taxBase *
                (
                    Math.max(
                        0,
                        safeNumber(
                            taxSettings.qstPct,
                            9.975
                        )
                    ) / 100
                )
            )
            : 0;

    const subtotal =
        roundMoney(
            accommodationAmount +
            cleaningFee +
            extrasAmount
        );

    const taxes =
        roundMoney(
            lodgingTax +
            gst +
            qst
        );

    const total =
        roundMoney(
            subtotal +
            taxes
        );

    return {
        accommodation:
            accommodationAmount,

        cleaningFee,

        extras:
            extrasAmount,

        subtotal,

        lodgingTax,

        gst,

        qst,

        taxBase,

        taxes,

        total,

        settings: {
            fees,
            taxes: taxSettings
        }
    };
}

export default {
    DEFAULT_BOOKING_FEES,
    DEFAULT_TAX_SETTINGS,
    getBookingSettingsFromChalet,
    calculateBookingTotals
};
