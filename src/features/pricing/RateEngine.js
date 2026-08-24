import RateRuleService from './RateRuleService';
import {
    resolveRateForDate,
    resolveRatesForRange
} from './RateResolver';

/**
 * ALTARA Rate Engine
 *
 * Orchestrates rule loading and delegates all deterministic pricing
 * calculations to RateResolver.
 */
export const RateEngine = {

    async getRateForDate(chaletId, date) {
        if (!chaletId) {
            throw new Error('RateEngine: chaletId is required');
        }

        const rules = await RateRuleService.getRulesForChalet(chaletId);
        const resolved = resolveRateForDate(rules, date);

        return {
            ...resolved,
            chaletId
        };
    },

    async getRatesForRange(chaletId, startDate, endDate) {
        if (!chaletId) {
            throw new Error('RateEngine: chaletId is required');
        }

        const rules = await RateRuleService.getRulesForChalet(chaletId);

        return resolveRatesForRange(rules, startDate, endDate).map(rate => ({
            ...rate,
            chaletId
        }));
    }
};

export default RateEngine;
