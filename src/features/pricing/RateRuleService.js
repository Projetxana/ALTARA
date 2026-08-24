import { supabase } from '../../lib/supabase';

/**
 * Data-access layer for ALTARA pricing rules.
 *
 * rate_rules is the canonical pricing source.
 * Business pricing logic must remain outside this service.
 */
export const RateRuleService = {

    async getRulesForChalet(chaletId) {
        if (!chaletId) {
            throw new Error('RateRuleService: chaletId is required');
        }

        const { data, error } = await supabase
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
                enabled,
                created_at,
                updated_at
            `)
            .eq('chalet_id', chaletId)
            .eq('enabled', true)
            .order('priority', { ascending: false });

        if (error) {
            throw new Error(`Unable to load rate rules: ${error.message}`);
        }

        return data ?? [];
    },

    async getBaseRule(chaletId) {
        if (!chaletId) {
            throw new Error('RateRuleService: chaletId is required');
        }

        const { data, error } = await supabase
            .from('rate_rules')
            .select(`
                id,
                chalet_id,
                name,
                rule_type,
                nightly_rate,
                weekend_rate,
                min_stay,
                priority,
                enabled
            `)
            .eq('chalet_id', chaletId)
            .eq('rule_type', 'base')
            .eq('enabled', true)
            .maybeSingle();

        if (error) {
            throw new Error(`Unable to load base rate: ${error.message}`);
        }

        return data ?? null;
    }
};

export default RateRuleService;
