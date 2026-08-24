/**
 * Pure pricing resolver for ALTARA.
 *
 * No database access.
 * No Supabase dependency.
 *
 * Precedence:
 * 1. Highest-priority matching dated rule
 * 2. Base rule
 *
 * Weekend definition keeps ALTARA's existing business rule:
 * Friday, Saturday and Sunday.
 */

export function normalizeRateDate(date) {
    if (date instanceof Date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }

    if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        throw new Error('RateResolver: expected a Date or YYYY-MM-DD string');
    }

    return date;
}

export function isWeekendRateDate(date) {
    const dateString = normalizeRateDate(date);
    const [year, month, day] = dateString.split('-').map(Number);
    const dayOfWeek = new Date(year, month - 1, day).getDay();

    // Existing ALTARA behavior: Friday, Saturday, Sunday.
    return dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0;
}

function matchesDate(rule, dateString) {
    if (!rule || rule.rule_type === 'base' || rule.enabled === false) {
        return false;
    }

    const month = Number(dateString.slice(5, 7));

    if (
        rule.rule_type === 'seasonal' &&
        rule.month_of_year !== null &&
        rule.month_of_year !== undefined
    ) {
        return Number(rule.month_of_year) === month;
    }

    if (rule.start_date && dateString < rule.start_date) {
        return false;
    }

    if (rule.end_date && dateString > rule.end_date) {
        return false;
    }

    return true;
}

function resolveNightlyRate(rule, dateString) {
    const useWeekendRate =
        isWeekendRateDate(dateString) &&
        rule.weekend_rate !== null &&
        rule.weekend_rate !== undefined;

    const value = useWeekendRate
        ? Number(rule.weekend_rate)
        : Number(rule.nightly_rate);

    if (!Number.isFinite(value) || value < 0) {
        throw new Error(`RateResolver: invalid nightly rate for rule ${rule.id || rule.name || 'unknown'}`);
    }

    return value;
}

export function resolveRateForDate(rules, date) {
    const dateString = normalizeRateDate(date);

    if (!Array.isArray(rules)) {
        throw new Error('RateResolver: rules must be an array');
    }

    const enabledRules = rules.filter(rule => rule?.enabled !== false);

    const baseRule = enabledRules.find(rule => rule.rule_type === 'base');

    if (!baseRule) {
        throw new Error('RateResolver: no active base rule found');
    }

    const matchingRules = enabledRules
        .filter(rule => matchesDate(rule, dateString))
        .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

    const appliedRule = matchingRules[0] ?? baseRule;

    return {
        date: dateString,
        nightlyRate: resolveNightlyRate(appliedRule, dateString),
        minStay: Number(appliedRule.min_stay ?? baseRule.min_stay ?? 1),
        isWeekend: isWeekendRateDate(dateString),

        rule: {
            id: appliedRule.id,
            name: appliedRule.name,
            type: appliedRule.rule_type,
            priority: appliedRule.priority ?? 0
        }
    };
}

export function resolveRatesForRange(rules, startDate, endDate) {
    const start = normalizeRateDate(startDate);
    const end = normalizeRateDate(endDate);

    if (start > end) {
        throw new Error('RateResolver: startDate must be before endDate');
    }

    const [startYear, startMonth, startDay] = start.split('-').map(Number);
    const [endYear, endMonth, endDay] = end.split('-').map(Number);

    const cursor = new Date(startYear, startMonth - 1, startDay);
    const lastDate = new Date(endYear, endMonth - 1, endDay);

    const results = [];

    while (cursor <= lastDate) {
        results.push(resolveRateForDate(rules, cursor));
        cursor.setDate(cursor.getDate() + 1);
    }

    return results;
}
