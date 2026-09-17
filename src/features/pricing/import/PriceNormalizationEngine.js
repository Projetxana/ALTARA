export const DEFAULT_IMPORT_SETTINGS = {
    // Airbnb-specific values
    cleaningFee: 200,
    assumedStayNights: 2,

    platformFeePct: 15,
    lodgingTaxPct: 3.5,
    gstPct: 5,
    qstPct: 9.975,

    // Checked = included in Airbnb displayed price and must be removed
    includeCleaning: false,
    includePlatformFee: true,
    includeLodgingTax: true,
    includeGst: true,
    includeQst: true,

    roundingStep: 1
};

function safeNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

function roundToStep(value, step = 1) {
    const safeStep = Math.max(0.01, safeNumber(step, 1));
    return Math.round(value / safeStep) * safeStep;
}

export function normalizeImportedPrice(displayedPrice, settings = {}) {
    const config = {
        ...DEFAULT_IMPORT_SETTINGS,
        ...settings
    };

    const observed = safeNumber(displayedPrice);

    if (observed <= 0) {
        return {
            displayedPrice: observed,
            proposedRate: 0,
            rawRate: 0,
            totalDeduction: 0,
            deductions: {
                taxes: 0,
                platformFee: 0,
                cleaning: 0
            }
        };
    }

    /*
     * STEP 1 — Remove taxes that are INCLUDED in the Airbnb price.
     *
     * Because these taxes are already inside the gross amount,
     * we reverse them instead of simply subtracting x% of gross.
     */
    const taxRates = {
        lodgingTax: config.includeLodgingTax
            ? Math.max(0, safeNumber(config.lodgingTaxPct))
            : 0,

        gst: config.includeGst
            ? Math.max(0, safeNumber(config.gstPct))
            : 0,

        qst: config.includeQst
            ? Math.max(0, safeNumber(config.qstPct))
            : 0
    };

    const combinedTaxPct =
        taxRates.lodgingTax +
        taxRates.gst +
        taxRates.qst;

    let priceWithoutTaxes = observed;
    let taxDeduction = 0;

    if (combinedTaxPct > 0) {
        priceWithoutTaxes =
            observed / (1 + combinedTaxPct / 100);

        taxDeduction =
            observed - priceWithoutTaxes;
    }

    /*
     * STEP 2 — Remove Airbnb commission.
     *
     * If Airbnb retains 15%, ALTARA direct does not need
     * that amount. We therefore remove that cost.
     */
    const platformFeeDeduction =
        config.includePlatformFee
            ? priceWithoutTaxes *
              (Math.max(
                  0,
                  safeNumber(config.platformFeePct)
              ) / 100)
            : 0;

    let afterPlatformFee =
        priceWithoutTaxes -
        platformFeeDeduction;

    /*
     * STEP 3 — Remove Airbnb cleaning fee if the screenshot
     * price includes it.
     *
     * Cleaning is a per-stay charge, so it must be allocated
     * over the stay length represented by the displayed price.
     *
     * ALTARA's own cleaning fee is NOT added here.
     * It remains a separate checkout fee.
     */
    const referenceNights = Math.max(
        1,
        safeNumber(config.assumedStayNights, 1)
    );

    const cleaningDeduction =
        config.includeCleaning
            ? Math.max(
                  0,
                  safeNumber(config.cleaningFee)
              ) / referenceNights
            : 0;

    const rawRate = Math.max(
        0,
        afterPlatformFee -
        cleaningDeduction
    );

    const proposedRate = Math.max(
        0,
        roundToStep(
            rawRate,
            config.roundingStep
        )
    );

    return {
        displayedPrice: observed,
        proposedRate,
        rawRate,

        totalDeduction:
            observed - rawRate,

        deductions: {
            taxes: taxDeduction,
            platformFee:
                platformFeeDeduction,
            cleaning:
                cleaningDeduction,

            lodgingTaxPct:
                taxRates.lodgingTax,
            gstPct:
                taxRates.gst,
            qstPct:
                taxRates.qst,
            combinedTaxPct
        },

        referenceNights
    };
}

export default {
    normalizeImportedPrice,
    DEFAULT_IMPORT_SETTINGS
};
