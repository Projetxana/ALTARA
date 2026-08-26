/**
 * Pure booking pricing calculations.
 *
 * No Supabase dependency.
 * No network access.
 */
export function summarizeStayRates(
    chaletId,
    checkInDate,
    checkOutDate,
    rates
) {
    if (!Array.isArray(rates)) {
        throw new Error('BookingPricingResolver: rates must be an array');
    }

    const nightlyBreakdown = rates.map(rate => ({
        date: rate.date,
        nightlyRate: Number(rate.nightlyRate),
        rule: rate.rule,
        isWeekend: rate.isWeekend
    }));

    const estimatedAccommodationRevenue = nightlyBreakdown.reduce(
        (sum, night) => sum + night.nightlyRate,
        0
    );

    const numberOfNights = nightlyBreakdown.length;

    const averageNightlyRate = numberOfNights > 0
        ? estimatedAccommodationRevenue / numberOfNights
        : 0;

    return {
        chaletId,
        checkInDate,
        checkOutDate,
        numberOfNights,
        estimatedAccommodationRevenue,
        averageNightlyRate,
        nightlyBreakdown
    };
}
