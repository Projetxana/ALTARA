import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Filter, Home, Sparkles, List, Calendar as CalendarIcon } from 'lucide-react';
import { useSanctuum } from '../../context/SanctuumContext';
import { useLanguage } from '../../context/LanguageContext';
import ReservationCard from './ReservationCard';
import RateEngine from '../pricing/RateEngine';

const CalendarBoard = () => {
    const {
        chalets,
        selectedChaletId,
        setSelectedChaletId,
        currentChalet,
        formatPrice,
        bookings,
        cleaningTasks
    } = useSanctuum();
    const { t, language } = useLanguage();

    // STATE: Dynamic Calendar Date
    const [viewDate, setViewDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [resolvedRates, setResolvedRates] = useState({});
    const [ratesLoading, setRatesLoading] = useState(false);
    const [ratesError, setRatesError] = useState(null);

    // Compute formatted events for the currently selected chalet
    const events = React.useMemo(() => {
        if (!selectedChaletId) return [];

        const chaletBookings = bookings.filter(b => b.chaletId === selectedChaletId);

        // 1. Map to uniform format
        const mapped = chaletBookings.map(b => ({
            id: b.id,
            start: b.checkInDate,
            end: b.checkOutDate,
            title: b.source || 'reservation',
            color: b.color,
            guestName: b.guestName || 'Guest',
            source: b.source,
            totalRevenue: b.totalRevenue || 0,
            status: b.status
        }));

        // 2. Deduplicate "blocked" events that overlap with "confirmed" ones
        const confirmedEvents = mapped.filter(e => e.status !== 'blocked');

        return mapped.filter(event => {
            // Keep all confirmed events
            if (event.status !== 'blocked') return true;

            // For blocked events, check if there's any overlapping confirmed event
            const hasOverlap = confirmedEvents.some(confirmed => {
                // Check for date overlap: A ends after B starts AND A starts before B ends
                return event.end > confirmed.start && event.start < confirmed.end;
            });

            // If it overlaps with a real booking, filter out this blocked period
            return !hasOverlap;
        });
    }, [bookings, selectedChaletId]);

    const groupedEvents = React.useMemo(() => {
        const groups = {};
        const sortedEvents = [...events].sort((a, b) => new Date(a.start) - new Date(b.start));

        sortedEvents.forEach(b => {
            const date = new Date(b.start);
            // using UTC string explicitly to avoid timezone shifts
            const monthKey = new Date(date.getTime() + date.getTimezoneOffset() * 60000).toLocaleString(language, { month: 'long', year: 'numeric' });
            if (!groups[monthKey]) groups[monthKey] = [];
            groups[monthKey].push(b);
        });
        return groups;
    }, [events, language]);

    // Load authoritative pricing for the visible month.
    useEffect(() => {
        let cancelled = false;

        const loadRates = async () => {
            if (!selectedChaletId) {
                setResolvedRates({});
                return;
            }

            const year = viewDate.getFullYear();
            const month = viewDate.getMonth();

            const startDate =
                `${year}-${String(month + 1).padStart(2, '0')}-01`;

            const lastDay = new Date(year, month + 1, 0).getDate();

            const endDate =
                `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

            try {
                setRatesLoading(true);
                setRatesError(null);

                const rates = await RateEngine.getRatesForRange(
                    selectedChaletId,
                    startDate,
                    endDate
                );

                if (cancelled) return;

                const map = Object.fromEntries(
                    rates.map(rate => [rate.date, rate])
                );

                setResolvedRates(map);
            } catch (error) {
                console.error(
                    '[CalendarBoard] Unable to load canonical rates:',
                    error
                );

                if (!cancelled) {
                    setResolvedRates({});
                    setRatesError(error.message);
                }
            } finally {
                if (!cancelled) {
                    setRatesLoading(false);
                }
            }
        };

        loadRates();

        return () => {
            cancelled = true;
        };
    }, [selectedChaletId, viewDate]);

    const days = [t('cal_mon'), t('cal_tue'), t('cal_wed'), t('cal_thu'), t('cal_fri'), t('cal_sat'), t('cal_sun')];

    const generateDates = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        let startDay = firstDayOfMonth.getDay();
        if (startDay === 0) startDay = 7;
        startDay -= 1;

        const dates = [];

        // Previous month padding
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let j = startDay - 1; j >= 0; j--) {
            const padDate = new Date(year, month - 1, prevMonthLastDay - j);
            const y = padDate.getFullYear();
            const m = String(padDate.getMonth() + 1).padStart(2, '0');
            const d = String(padDate.getDate()).padStart(2, '0');
            dates.push({ day: padDate.getDate(), dateStr: `${y}-${m}-${d}`, isPadding: true });
        }

        // Current month
        const numDays = lastDayOfMonth.getDate();
        for (let i = 1; i <= numDays; i++) {
            const m = String(month + 1).padStart(2, '0');
            const d = String(i).padStart(2, '0');
            dates.push({ day: i, dateStr: `${year}-${m}-${d}`, isPadding: false });
        }

        // Next month padding
        const remainder = dates.length % 7;
        if (remainder !== 0) {
            const needed = 7 - remainder;
            for (let i = 1; i <= needed; i++) {
                const padDate = new Date(year, month + 1, i);
                const y = padDate.getFullYear();
                const m = String(padDate.getMonth() + 1).padStart(2, '0');
                const d = String(padDate.getDate()).padStart(2, '0');
                dates.push({ day: padDate.getDate(), dateStr: `${y}-${m}-${d}`, isPadding: true });
            }
        }

        return dates;
    };

    const dates = React.useMemo(() => generateDates(viewDate), [viewDate]);

    // Handlers for navigation
    const nextMonth = () => {
        setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const prevMonth = () => {
        setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    // Calculate Monthly Stats
    const monthStats = React.useMemo(() => {
        if (!currentChalet) return { occupancy: 0, revPar: 0 };

        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const monthStart = `${year}-${String(month + 1).padStart(2, '0')}-01`;
        const monthEnd = `${year}-${String(month + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

        let bookedDays = 0;
        let totalRevenue = 0;

        events.forEach(b => {
            if (b.end > monthStart && b.start <= monthEnd && b.status !== 'blocked') {
                const overlapStart = b.start > monthStart ? b.start : monthStart;
                const overlapEnd = b.end < monthEnd ? b.end : monthEnd;

                const startD = new Date(overlapStart);
                const endD = new Date(overlapEnd);
                const daysOverlap = Math.max(0, Math.round((endD - startD) / (1000 * 60 * 60 * 24)));

                bookedDays += daysOverlap;

                const totalBookingDays = Math.max(1, Math.round((new Date(b.end) - new Date(b.start)) / (1000 * 60 * 60 * 24)));
                const dailyRate = b.totalRevenue ? b.totalRevenue / totalBookingDays : (currentChalet.baseNightPrice || 0);

                totalRevenue += (dailyRate * daysOverlap);
            }
        });

        const validBookedDays = Math.min(bookedDays, daysInMonth);
        const occupancy = Math.round((validBookedDays / daysInMonth) * 100);
        const revPar = totalRevenue / daysInMonth;

        return { occupancy, revPar };
    }, [events, viewDate, currentChalet]);

    // Calculate Daily Price
    // Canonical source: RateEngine / rate_rules.
    // Legacy pricingInfo remains as temporary fallback.
    const getDailyPrice = (dateStr) => {
        const resolved = resolvedRates[dateStr];

        if (resolved) {
            return resolved.nightlyRate;
        }

        if (!currentChalet || !currentChalet.pricingInfo) {
            return currentChalet?.baseNightPrice || 0;
        }

        const pricing = currentChalet.pricingInfo;

        const [y, m, d] = dateStr.split('-');
        const localDate = new Date(y, m - 1, d);
        const monthIndex = localDate.getMonth();

        let currentPrice = currentChalet.baseNightPrice || 0;
        let weekendPrice = null;

        if (pricing.monthlyRates && pricing.monthlyRates[monthIndex]) {
            currentPrice =
                pricing.monthlyRates[monthIndex].basePrice || currentPrice;

            weekendPrice =
                pricing.monthlyRates[monthIndex].weekendPrice;
        } else {
            currentPrice = pricing.basePrice || currentPrice;
            weekendPrice = pricing.weekendPrice;
        }

        if (pricing.customRules && pricing.customRules.length > 0) {
            const activeRule = pricing.customRules.find(rule => {
                if (!rule.startDate || !rule.endDate) return false;

                return (
                    dateStr >= rule.startDate &&
                    dateStr <= rule.endDate
                );
            });

            if (activeRule && activeRule.price) {
                return activeRule.price;
            }
        }

        const dayOfWeek = localDate.getDay();

        if (
            (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0) &&
            weekendPrice
        ) {
            return weekendPrice;
        }

        return currentPrice;
    };

    // Formatter for Header
    const monthLabel = viewDate.toLocaleString(language, { month: 'long', year: 'numeric' });

    if (!currentChalet) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh', flexDirection: 'column', gap: '1rem', color: 'var(--color-text-muted)' }}>
                <Home size={48} style={{ opacity: 0.5 }} />
                <h3>{t('cal_welcome')}</h3>
                <p>{t('cal_no_props')}</p>
                <a href="/properties" className="btn-primary" style={{ textDecoration: 'none' }}>
                    {t('cal_create_prop')}
                </a>
            </div>
        );
    }

    const getSegmentsForCell = (i) => {
        const cellDate = dates[i].dateStr;
        const isWeekStart = (i % 7 === 0);

        const weekStartIdx = i - (i % 7);
        const weekData = dates.slice(weekStartIdx, weekStartIdx + 7);
        const weekEndDate = weekData[6]?.dateStr;

        const segments = [];

        events.forEach(b => {
            const isCheckinHere = (b.start === cellDate);
            const isContinuingHere = isWeekStart && (b.start < cellDate) && (b.end >= cellDate);

            if (isCheckinHere || isContinuingHere) {
                let X1 = isCheckinHere ? (i % 7) + 0.5 : 0.0;

                let X2 = 7.0;
                let isCheckoutHere = false;

                if (b.end <= weekEndDate) {
                    const localColEnd = weekData.findIndex(d => d.dateStr === b.end);
                    if (localColEnd !== -1) {
                        X2 = localColEnd + 0.5;
                        isCheckoutHere = true;
                    }
                }

                segments.push({
                    booking: b,
                    isCheckin: isCheckinHere,
                    isCheckout: isCheckoutHere,
                    widthCells: X2 - X1,
                    leftPercent: isCheckinHere ? 50 : 0
                });
            }
        });

        return segments;
    };

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: '215px minmax(0, 1fr)',
                gap: '1rem',
                height: 'calc(100vh - 140px)',
                color: '#15211F'
            }}
        >
            {/* PROPERTY PANEL */}
            <aside
                style={{
                    padding: '1.1rem',
                    border: '1px solid #DED8CD',
                    borderRadius: '18px',
                    background: '#FCFAF6',
                    boxShadow: '0 6px 24px rgba(21,33,31,0.045)',
                    overflow: 'auto'
                }}
            >
                <div
                    style={{
                        marginBottom: '1.1rem',
                        color: '#A6553F',
                        fontSize: '0.67rem',
                        fontWeight: 700,
                        letterSpacing: '0.16em',
                        textTransform: 'uppercase'
                    }}
                >
                    {t('cal_collection')}
                </div>

                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.55rem'
                    }}
                >
                    {chalets.map(chalet => {
                        const active =
                            selectedChaletId === chalet.id;

                        return (
                            <button
                                key={chalet.id}
                                onClick={() =>
                                    setSelectedChaletId(chalet.id)
                                }
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.7rem',
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '12px',
                                    background: active
                                        ? '#F4EFE6'
                                        : 'transparent',
                                    border: active
                                        ? '1px solid #D7C7AC'
                                        : '1px solid transparent',
                                    color: '#15211F',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    transition: 'all 160ms ease'
                                }}
                            >
                                <div
                                    style={{
                                        width: '34px',
                                        height: '34px',
                                        flexShrink: 0,
                                        display: 'grid',
                                        placeItems: 'center',
                                        borderRadius: '9px',
                                        background: active
                                            ? '#173A35'
                                            : '#F4EFE6',
                                        color: active
                                            ? '#F4EFE6'
                                            : '#315D55'
                                    }}
                                >
                                    <Home size={16} />
                                </div>

                                <div style={{ minWidth: 0 }}>
                                    <div
                                        style={{
                                            fontSize: '0.85rem',
                                            fontWeight: 650,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        {chalet.name}
                                    </div>

                                    <div
                                        style={{
                                            marginTop: '0.1rem',
                                            color: '#66716D',
                                            fontSize: '0.68rem',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        {chalet.location}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div
                    style={{
                        marginTop: '1.5rem',
                        padding: '1rem',
                        border: '1px solid #E8E2D8',
                        borderRadius: '13px',
                        background: '#FCFAF6'
                    }}
                >
                    <div
                        style={{
                            marginBottom: '0.8rem',
                            color: '#66716D',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase'
                        }}
                    >
                        {t('cal_stats')}
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'baseline',
                            marginBottom: '0.65rem'
                        }}
                    >
                        <span
                            style={{
                                color: '#66716D',
                                fontSize: '0.78rem'
                            }}
                        >
                            {t('cal_occupancy')}
                        </span>

                        <span
                            style={{
                                color: '#173A35',
                                fontSize: '1.05rem',
                                fontWeight: 700
                            }}
                        >
                            {monthStats.occupancy}%
                        </span>
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'baseline'
                        }}
                    >
                        <span
                            style={{
                                color: '#66716D',
                                fontSize: '0.78rem'
                            }}
                        >
                            {t('cal_revpar')}
                        </span>

                        <span
                            style={{
                                color: '#A6553F',
                                fontSize: '1rem',
                                fontWeight: 700
                            }}
                        >
                            {formatPrice(monthStats.revPar)}
                        </span>
                    </div>
                </div>

                {ratesLoading && (
                    <div
                        style={{
                            marginTop: '1rem',
                            color: '#91A69F',
                            fontSize: '0.68rem'
                        }}
                    >
                        Actualisation des tarifs…
                    </div>
                )}

                {ratesError && (
                    <div
                        style={{
                            marginTop: '1rem',
                            color: '#A6553F',
                            fontSize: '0.68rem'
                        }}
                    >
                        Tarifs temporairement indisponibles
                    </div>
                )}
            </aside>

            {/* CALENDAR */}
            <section
                style={{
                    minWidth: 0,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid #DED8CD',
                    borderRadius: '18px',
                    background: '#FCFAF6',
                    boxShadow: '0 6px 24px rgba(21,33,31,0.045)'
                }}
            >
                {/* TOOLBAR */}
                <div
                    style={{
                        minHeight: '74px',
                        padding: '0.85rem 1rem',
                        borderBottom: '1px solid #DED8CD',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '1rem',
                        background: '#FCFAF6'
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.65rem'
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                overflow: 'hidden',
                                border: '1px solid #DED8CD',
                                borderRadius: '10px',
                                background: '#FCFAF6'
                            }}
                        >
                            <button
                                onClick={prevMonth}
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    display: 'grid',
                                    placeItems: 'center',
                                    border: 'none',
                                    background: 'transparent',
                                    color: '#315D55',
                                    cursor: 'pointer',
                                    visibility:
                                        viewMode === 'list'
                                            ? 'hidden'
                                            : 'visible'
                                }}
                            >
                                <ChevronLeft size={18} />
                            </button>

                            <span
                                style={{
                                    minWidth: '138px',
                                    padding: '0 0.8rem',
                                    color: '#15211F',
                                    fontSize: '0.9rem',
                                    fontWeight: 650,
                                    textAlign: 'center',
                                    textTransform: 'capitalize',
                                    visibility:
                                        viewMode === 'list'
                                            ? 'hidden'
                                            : 'visible'
                                }}
                            >
                                {monthLabel}
                            </span>

                            <button
                                onClick={nextMonth}
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    display: 'grid',
                                    placeItems: 'center',
                                    border: 'none',
                                    background: 'transparent',
                                    color: '#315D55',
                                    cursor: 'pointer',
                                    visibility:
                                        viewMode === 'list'
                                            ? 'hidden'
                                            : 'visible'
                                }}
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>

                        <button
                            onClick={() => setViewDate(new Date())}
                            style={{
                                minHeight: '36px',
                                padding: '0 0.8rem',
                                border: '1px solid #DED8CD',
                                borderRadius: '9px',
                                background: '#FFFFFF',
                                color: '#66716D',
                                cursor: 'pointer',
                                fontSize: '0.73rem',
                                fontWeight: 600,
                                visibility:
                                    viewMode === 'list'
                                        ? 'hidden'
                                        : 'visible'
                            }}
                        >
                            {t('cal_today')}
                        </button>
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            gap: '1rem',
                            minWidth: 0
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.9rem',
                                color: '#66716D',
                                fontSize: '0.67rem'
                            }}
                        >
                            {[
                                ['#FF5A5F', 'Airbnb'],
                                ['#3B82F6', 'VRBO'],
                                ['#315D55', 'Booking'],
                                ['#C5A66A', 'Direct']
                            ].map(([color, label]) => (
                                <div
                                    key={label}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.3rem'
                                    }}
                                >
                                    <span
                                        style={{
                                            width: 7,
                                            height: 7,
                                            borderRadius: '50%',
                                            background: color
                                        }}
                                    />
                                    {label}
                                </div>
                            ))}
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                gap: '0.2rem',
                                padding: '0.2rem',
                                border: '1px solid #DED8CD',
                                borderRadius: '9px',
                                background: '#F1EBE1'
                            }}
                        >
                            <button
                                onClick={() => setViewMode('grid')}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.35rem',
                                    padding: '0.42rem 0.65rem',
                                    border: 'none',
                                    borderRadius: '7px',
                                    background:
                                        viewMode === 'grid'
                                            ? '#173A35'
                                            : 'transparent',
                                    color:
                                        viewMode === 'grid'
                                            ? '#FFFFFF'
                                            : '#66716D',
                                    cursor: 'pointer',
                                    fontSize: '0.68rem',
                                    fontWeight: 650
                                }}
                            >
                                <CalendarIcon size={13} />
                                Grid
                            </button>

                            <button
                                onClick={() => setViewMode('list')}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.35rem',
                                    padding: '0.42rem 0.65rem',
                                    border: 'none',
                                    borderRadius: '7px',
                                    background:
                                        viewMode === 'list'
                                            ? '#173A35'
                                            : 'transparent',
                                    color:
                                        viewMode === 'list'
                                            ? '#FFFFFF'
                                            : '#66716D',
                                    cursor: 'pointer',
                                    fontSize: '0.68rem',
                                    fontWeight: 650
                                }}
                            >
                                <List size={13} />
                                List
                            </button>
                        </div>
                    </div>
                </div>

                {viewMode === 'grid' ? (
                    <>
                        {/* DAYS */}
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(7, 1fr)',
                                background: '#F1EBE1'
                            }}
                        >
                            {days.map(day => (
                                <div
                                    key={day}
                                    style={{
                                        padding: '0.65rem',
                                        borderBottom: '1px solid #DED8CD',
                                        borderRight: '1px solid #DED8CD',
                                        color: '#66716D',
                                        fontSize: '0.64rem',
                                        fontWeight: 700,
                                        letterSpacing: '0.1em',
                                        textAlign: 'center',
                                        textTransform: 'uppercase'
                                    }}
                                >
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* GRID */}
                        <div
                            style={{
                                flex: 1,
                                overflowY: 'auto',
                                display: 'grid',
                                gridTemplateColumns: 'repeat(7, 1fr)',
                                gridAutoRows: 'minmax(108px, 1fr)',
                                background: '#FCFAF6'
                            }}
                        >
                            {dates.map((dateObj, i) => {
                                const segments =
                                    getSegmentsForCell(i);

                                return (
                                    <div
                                        key={i}
                                        style={{
                                            position: 'relative',
                                            minWidth: 0,
                                            padding: '0.5rem',
                                            borderBottom: '1px solid #EEE8DE',
                                            borderRight: '1px solid #EEE8DE',
                                            background:
                                                dateObj.isPadding
                                                    ? '#FAF8F4'
                                                    : '#FFFFFF',
                                            cursor: dateObj.isPadding
                                                ? 'default'
                                                : 'pointer',
                                            transition: 'background 160ms ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!dateObj.isPadding) {
                                                e.currentTarget.style.background =
                                                    '#F8F4ED';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background =
                                                dateObj.isPadding
                                                    ? '#F4EFE6'
                                                    : '#FCFAF6';
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'flex-start'
                                            }}
                                        >
                                            <span
                                                style={{
                                                    color:
                                                        dateObj.isPadding
                                                            ? '#C9C6C0'
                                                            : '#52605C',
                                                    fontSize: '0.76rem',
                                                    fontWeight: 600
                                                }}
                                            >
                                                {dateObj.day}
                                            </span>

                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.4rem'
                                                }}
                                            >
                                                {!dateObj.isPadding &&
                                                    cleaningTasks.some(
                                                        t =>
                                                            t.date === dateObj.dateStr &&
                                                            t.chaletId === selectedChaletId &&
                                                            t.status !== 'completed'
                                                    ) && (
                                                        <div
                                                            title="Housekeeping required"
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                padding: '2px 4px',
                                                                borderRadius: '5px',
                                                                background: 'rgba(166,85,63,0.10)',
                                                                color: '#A6553F'
                                                            }}
                                                        >
                                                            <Sparkles size={10} />
                                                        </div>
                                                    )}

                                                {!dateObj.isPadding && (
                                                    <span
                                                        style={{
                                                            color: '#91A69F',
                                                            fontSize: '0.58rem',
                                                            fontWeight: 600
                                                        }}
                                                    >
                                                        {formatPrice(
                                                            getDailyPrice(
                                                                dateObj.dateStr
                                                            )
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {segments.map(segment => (
                                            <ReservationCard
                                                key={`${segment.booking.id}-${i}`}
                                                segment={segment}
                                            />
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    </>
                ) : (
                    /* LIST VIEW */
                    <div
                        style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: '1.5rem'
                        }}
                    >
                        {Object.keys(groupedEvents).length === 0 ? (
                            <div
                                style={{
                                    padding: '4rem',
                                    color: '#66716D',
                                    textAlign: 'center'
                                }}
                            >
                                <List
                                    size={42}
                                    style={{
                                        margin: '0 auto 1rem',
                                        opacity: 0.22
                                    }}
                                />
                                <div
                                    style={{
                                        fontSize: '0.95rem',
                                        fontWeight: 500
                                    }}
                                >
                                    No reservations found.
                                </div>
                            </div>
                        ) : (
                            Object.entries(groupedEvents).map(
                                ([month, monthEvents]) => (
                                    <div
                                        key={month}
                                        style={{
                                            marginBottom: '2.5rem'
                                        }}
                                    >
                                        <h4
                                            style={{
                                                marginBottom: '1rem',
                                                paddingBottom: '0.7rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.6rem',
                                                borderBottom: '1px solid #DED8CD',
                                                color: '#15211F',
                                                fontSize: '1.05rem',
                                                fontWeight: 600,
                                                textTransform: 'capitalize'
                                            }}
                                        >
                                            <CalendarIcon
                                                size={17}
                                                color="#A6553F"
                                            />
                                            {month}
                                        </h4>

                                        <table
                                            style={{
                                                width: '100%',
                                                borderCollapse: 'collapse'
                                            }}
                                        >
                                            <thead>
                                                <tr
                                                    style={{
                                                        borderBottom: '1px solid #DED8CD',
                                                        color: '#66716D',
                                                        fontSize: '0.64rem',
                                                        letterSpacing: '0.09em',
                                                        textAlign: 'left',
                                                        textTransform: 'uppercase'
                                                    }}
                                                >
                                                    <th style={{ padding: '0.8rem', fontWeight: 700 }}>
                                                        Guest & Source
                                                    </th>
                                                    <th style={{ padding: '0.8rem', fontWeight: 700 }}>
                                                        Arrival
                                                    </th>
                                                    <th style={{ padding: '0.8rem', fontWeight: 700 }}>
                                                        Departure
                                                    </th>
                                                    <th style={{ padding: '0.8rem', fontWeight: 700, textAlign: 'right' }}>
                                                        Duration
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {monthEvents.map(b => {
                                                    const nights = Math.round(
                                                        (
                                                            new Date(b.end) -
                                                            new Date(b.start)
                                                        ) /
                                                            (
                                                                1000 *
                                                                60 *
                                                                60 *
                                                                24
                                                            )
                                                    );

                                                    const isBlocked =
                                                        b.status === 'blocked';

                                                    return (
                                                        <tr
                                                            key={b.id}
                                                            style={{
                                                                borderBottom: '1px solid #EEE9E1',
                                                                opacity: isBlocked ? 0.45 : 1
                                                            }}
                                                        >
                                                            <td
                                                                style={{
                                                                    padding: '0.85rem',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '0.75rem'
                                                                }}
                                                            >
                                                                <div
                                                                    style={{
                                                                        width: 10,
                                                                        height: 10,
                                                                        flexShrink: 0,
                                                                        borderRadius: '50%',
                                                                        background: b.color
                                                                    }}
                                                                />

                                                                <div>
                                                                    <div
                                                                        style={{
                                                                            color: '#15211F',
                                                                            fontSize: '0.86rem',
                                                                            fontWeight: 650
                                                                        }}
                                                                    >
                                                                        {b.guestName}
                                                                    </div>

                                                                    <div
                                                                        style={{
                                                                            marginTop: '0.08rem',
                                                                            color: '#66716D',
                                                                            fontSize: '0.68rem',
                                                                            textTransform: 'capitalize'
                                                                        }}
                                                                    >
                                                                        {b.source}
                                                                    </div>
                                                                </div>
                                                            </td>

                                                            <td
                                                                style={{
                                                                    padding: '0.85rem',
                                                                    color: '#315D55',
                                                                    fontSize: '0.78rem',
                                                                    fontWeight: 500
                                                                }}
                                                            >
                                                                {new Date(
                                                                    b.start
                                                                ).toLocaleDateString(
                                                                    navigator.language,
                                                                    {
                                                                        weekday: 'short',
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                        timeZone: 'UTC'
                                                                    }
                                                                )}
                                                            </td>

                                                            <td
                                                                style={{
                                                                    padding: '0.85rem',
                                                                    color: '#315D55',
                                                                    fontSize: '0.78rem',
                                                                    fontWeight: 500
                                                                }}
                                                            >
                                                                {new Date(
                                                                    b.end
                                                                ).toLocaleDateString(
                                                                    navigator.language,
                                                                    {
                                                                        weekday: 'short',
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                        timeZone: 'UTC'
                                                                    }
                                                                )}
                                                            </td>

                                                            <td
                                                                style={{
                                                                    padding: '0.85rem',
                                                                    textAlign: 'right'
                                                                }}
                                                            >
                                                                <span
                                                                    style={{
                                                                        display: 'inline-block',
                                                                        padding: '0.3rem 0.65rem',
                                                                        border: '1px solid #DED8CD',
                                                                        borderRadius: '999px',
                                                                        background: '#F4EFE6',
                                                                        color: '#173A35',
                                                                        fontSize: '0.68rem',
                                                                        fontWeight: 700
                                                                    }}
                                                                >
                                                                    {nights} nights
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )
                            )
                        )}
                    </div>
                )}
            </section>
        </div>
    );
};

export default CalendarBoard;
