import { supabase } from '../../lib/supabase';

const MONTH_NAMES = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

/**
 * Data-access layer for ALTARA pricing rules.
 *
 * rate_rules is the canonical source for nightly pricing.
 * Business pricing resolution remains in RateResolver.
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
    },

    async upsertBaseRule(chaletId, rate) {
        if (!chaletId) {
            throw new Error('RateRuleService: chaletId is required');
        }

        const payload = {
            chalet_id: chaletId,
            name: 'Tarif de base',
            rule_type: 'base',
            start_date: null,
            end_date: null,
            month_of_year: null,
            nightly_rate: Number(rate.basePrice),
            weekend_rate: Number(rate.weekendPrice),
            min_stay: Number(rate.minStay),
            priority: 0,
            enabled: true
        };

        const { data: existing, error: lookupError } = await supabase
            .from('rate_rules')
            .select('id')
            .eq('chalet_id', chaletId)
            .eq('rule_type', 'base')
            .maybeSingle();

        if (lookupError) {
            throw new Error(`Unable to find base rate: ${lookupError.message}`);
        }

        const query = existing
            ? supabase.from('rate_rules').update(payload).eq('id', existing.id)
            : supabase.from('rate_rules').insert(payload);

        const { error } = await query;

        if (error) {
            throw new Error(`Unable to save base rate: ${error.message}`);
        }
    },

    async upsertMonthlyRules(chaletId, monthlyRates) {
        if (!chaletId) {
            throw new Error('RateRuleService: chaletId is required');
        }

        if (!Array.isArray(monthlyRates) || monthlyRates.length !== 12) {
            throw new Error('RateRuleService: monthlyRates must contain 12 months');
        }

        const payload = monthlyRates.map((rate, index) => ({
            chalet_id: chaletId,
            name: MONTH_NAMES[index],
            rule_type: 'seasonal',
            start_date: null,
            end_date: null,
            month_of_year: index + 1,
            nightly_rate: Number(rate.basePrice),
            weekend_rate: Number(rate.weekendPrice),
            min_stay: Number(rate.minStay),
            priority: 10,
            enabled: true
        }));

        const { error } = await supabase
            .from('rate_rules')
            .upsert(payload, {
                onConflict: 'chalet_id,rule_type,month_of_year'
            });

        if (error) {
            throw new Error(`Unable to save monthly rates: ${error.message}`);
        }
    },

    async replaceSpecialRules(chaletId, customRules) {
        if (!chaletId) {
            throw new Error('RateRuleService: chaletId is required');
        }

        const { error: deleteError } = await supabase
            .from('rate_rules')
            .delete()
            .eq('chalet_id', chaletId)
            .eq('rule_type', 'special');

        if (deleteError) {
            throw new Error(`Unable to replace special rates: ${deleteError.message}`);
        }

        if (!customRules?.length) {
            return;
        }

        const validRules = (customRules || []).filter(rule =>
            rule.startDate &&
            rule.endDate &&
            Number.isFinite(Number(rule.price)) &&
            Number(rule.price) >= 0
        );

        if (validRules.length === 0) {
            return;
        }

        const payload = validRules.map(rule => ({
            chalet_id: chaletId,
            name: rule.name || 'Règle spéciale',
            rule_type: 'special',
            start_date: rule.startDate,
            end_date: rule.endDate,
            month_of_year: null,
            nightly_rate: Number(rule.price),
            weekend_rate: null,
            min_stay: Math.max(1, Number(rule.minStay || 1)),
            priority: 100,
            enabled: true
        }));

        const { error } = await supabase
            .from('rate_rules')
            .insert(payload);

        if (error) {
            throw new Error(`Unable to save special rates: ${error.message}`);
        }
    },

    /**
     * Replace one-day manual overrides for imported calendar prices.
     *
     * These rules have the highest pricing precedence and therefore
     * override seasonal/special pricing only for the exact imported dates.
     */
    async replaceManualRatesForDates(chaletId, overrides) {
        if (!chaletId) {
            throw new Error('RateRuleService: chaletId is required');
        }

        const validOverrides = (overrides || []).filter(rule =>
            /^\\d{4}-\\d{2}-\\d{2}$/.test(rule.date || '') &&
            Number.isFinite(Number(rule.price)) &&
            Number(rule.price) >= 0
        );

        if (!validOverrides.length) {
            return { count: 0 };
        }

        const dates = [...new Set(
            validOverrides.map(rule => rule.date)
        )];

        // Only replace manual rules for the dates being imported.
        // Seasonal and special rules remain untouched.
        const { error: deleteError } = await supabase
            .from('rate_rules')
            .delete()
            .eq('chalet_id', chaletId)
            .eq('rule_type', 'manual')
            .in('start_date', dates);

        if (deleteError) {
            throw new Error(
                `Unable to replace imported rates: ${deleteError.message}`
            );
        }

        const payload = validOverrides.map(rule => ({
            chalet_id: chaletId,
            name: `Import Airbnb — ${rule.date}`,
            rule_type: 'manual',
            start_date: rule.date,
            end_date: rule.date,
            month_of_year: null,
            nightly_rate: Number(rule.price),
            weekend_rate: null,

            // Preserve the minimum stay that was already effective
            // on that date when the import was reviewed.
            min_stay: Math.max(1, Number(rule.minStay || 1)),

            priority: 1000,
            enabled: true
        }));

        const { error } = await supabase
            .from('rate_rules')
            .insert(payload);

        if (error) {
            throw new Error(
                `Unable to save imported rates: ${error.message}`
            );
        }

        return {
            count: payload.length
        };
    }
};

export default RateRuleService;
