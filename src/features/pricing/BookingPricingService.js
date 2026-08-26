import RateEngine from './RateEngine';
import { summarizeStayRates } from './BookingPricingResolver';

/**
 * Pricing calculations for a stay.
 *
 * checkInDate is inclusive.
 * checkOutDate is exclusive.
 */
export const BookingPricingService = {

    async calculateStay(chaletId, checkInDate, checkOutDate) {
        if (!chaletId) {
            throw new Error('BookingPricingService: chaletId is required');
        }

        if (!checkInDate || !checkOutDate) {
            throw new Error(
                'BookingPricingService: check-in and check-out dates are required'
            );
        }

        if (checkOutDate <= checkInDate) {
            throw new Error(
                'BookingPricingService: check-out must be after check-in'
            );
        }

        const checkout = new Date(`${checkOutDate}T12:00:00`);
        checkout.setDate(checkout.getDate() - 1);

        const lastNightDate = [
            checkout.getFullYear(),
            String(checkout.getMonth() + 1).padStart(2, '0'),
            String(checkout.getDate()).padStart(2, '0')
        ].join('-');

        const rates = await RateEngine.getRatesForRange(
            chaletId,
            checkInDate,
            lastNightDate
        );

        return summarizeStayRates(
            chaletId,
            checkInDate,
            checkOutDate,
            rates
        );
    }

};

export default BookingPricingService;
