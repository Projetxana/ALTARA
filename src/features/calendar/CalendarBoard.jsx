import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Filter, Home, Sparkles, List, Calendar as CalendarIcon } from 'lucide-react';
import { useSanctuum } from '../../context/SanctuumContext';
import { useLanguage } from '../../context/LanguageContext';
import ReservationCard from './ReservationCard';

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

    // Compute formatted events for the currently selected chalet
    const events = React.useMemo(() => {
        if (!selectedChaletId) return [];

        const chaletBookings = bookings.filter(b => b.chaletId === selectedChaletId);

        return chaletBookings.map(b => {
            // Context standardizes start to checkInDate, end to checkOutDate
            return {
                id: b.id,
                start: b.checkInDate,
                end: b.checkOutDate,
                title: b.source || 'reservation',
                color: b.color,
                guestName: b.guestName || 'Guest',
                source: b.source,
                totalRevenue: b.totalRevenue || 0
            };
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
        <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '1.5rem', height: 'calc(100vh - 140px)' }}>

            {/* 2. PLANNING UI - LEFT PANEL (Chalet Selector) */}
            <div className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: '1rem' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('cal_collection')}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {chalets.map(chalet => (
                        <button
                            key={chalet.id}
                            onClick={() => setSelectedChaletId(chalet.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.75rem',
                                borderRadius: 'var(--radius-md)',
                                background: selectedChaletId === chalet.id ? 'var(--color-primary)' : 'rgba(255,255,255,0.03)',
                                border: '1px solid',
                                borderColor: selectedChaletId === chalet.id ? 'var(--color-primary)' : 'transparent',
                                color: selectedChaletId === chalet.id ? '#000' : 'var(--color-text-main)',
                                textAlign: 'left',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{
                                width: '32px', height: '32px', borderRadius: '6px',
                                background: selectedChaletId === chalet.id ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Home size={16} />
                            </div>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{chalet.name}</div>
                                <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>{chalet.location}</div>
                            </div>
                        </button>
                    ))}
                </div>

                <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>{t('cal_stats')}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.85rem' }}>{t('cal_occupancy')}</span>
                        <span style={{ fontWeight: 600, color: 'var(--color-accent)' }}>78%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.85rem' }}>{t('cal_revpar')}</span>
                        <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{formatPrice(currentChalet.baseNightPrice)}</span>
                    </div>
                </div>
            </div>

            {/* MAIN AREA - CALENDAR GRID */}
            <div className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {/* Calendar Toolbar */}
                <div style={{
                    padding: '1rem 1.5rem',
                    borderBottom: '1px solid var(--color-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(0,0,0,0.2)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)' }}>
                            <button
                                onClick={prevMonth}
                                style={{ padding: '0.5rem', border: 'none', background: 'transparent', color: 'var(--color-text-main)', cursor: 'pointer', visibility: viewMode === 'list' ? 'hidden' : 'visible' }}>
                                <ChevronLeft size={20} />
                            </button>
                            <span style={{ padding: '0 1rem', fontWeight: 600, fontSize: '0.95rem', minWidth: '140px', textAlign: 'center', visibility: viewMode === 'list' ? 'hidden' : 'visible' }}>{monthLabel}</span>
                            <button
                                onClick={nextMonth}
                                style={{ padding: '0.5rem', border: 'none', background: 'transparent', color: 'var(--color-text-main)', cursor: 'pointer', visibility: viewMode === 'list' ? 'hidden' : 'visible' }}>
                                <ChevronRight size={20} />
                            </button>
                        </div>
                        <button
                            onClick={() => setViewDate(new Date())}
                            style={{ fontSize: '0.8rem', background: 'none', border: '1px solid var(--color-border)', padding: '0.25rem 0.75rem', borderRadius: '4px', color: 'var(--color-text-muted)', cursor: 'pointer', visibility: viewMode === 'list' ? 'hidden' : 'visible' }}>
                            {t('cal_today')}
                        </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF5A5F' }}></span>Airbnb</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6' }}></span>VRBO</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#003580' }}></span>Booking</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#d4af37' }}></span>Direct</div>
                        </div>

                        {/* View Toggle */}
                        <div style={{ display: 'flex', gap: '0.25rem', padding: '0.25rem', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)' }}>
                            <button
                                onClick={() => setViewMode('grid')}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)', border: 'none', background: viewMode === 'grid' ? 'var(--color-primary)' : 'transparent', color: viewMode === 'grid' ? '#000' : 'var(--color-text-muted)', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', transition: 'all 0.2s' }}
                            >
                                <CalendarIcon size={14} /> Grid
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)', border: 'none', background: viewMode === 'list' ? 'var(--color-primary)' : 'transparent', color: viewMode === 'list' ? '#000' : 'var(--color-text-muted)', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', transition: 'all 0.2s' }}
                            >
                                <List size={14} /> List
                            </button>
                        </div>
                    </div>
                </div>

                {viewMode === 'grid' ? (
                    <>
                        {/* Calendar Grid Header */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: 'rgba(255,255,255,0.02)' }}>
                            {days.map(day => (
                                <div key={day} style={{
                                    padding: '0.75rem',
                                    textAlign: 'center',
                                    borderBottom: '1px solid var(--color-border)',
                                    borderRight: '1px solid var(--color-border)',
                                    color: 'var(--color-text-muted)',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}>
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Scrollable Grid */}
                        <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridAutoRows: 'minmax(120px, 1fr)' }}>
                            {dates.map((dateObj, i) => {
                                const segments = getSegmentsForCell(i);

                                return (
                                    <div key={i} style={{
                                        borderBottom: '1px solid var(--color-border)',
                                        borderRight: '1px solid var(--color-border)',
                                        padding: '0.5rem',
                                        position: 'relative',
                                        cursor: 'pointer',
                                        background: dateObj.isPadding ? 'rgba(0,0,0,0.2)' : 'transparent',
                                        transition: 'background 0.2s',
                                    }}
                                        onMouseEnter={(e) => !dateObj.isPadding && (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                                        onMouseLeave={(e) => !dateObj.isPadding && (e.currentTarget.style.background = 'transparent')}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <span style={{
                                                color: dateObj.isPadding ? 'rgba(255,255,255,0.2)' : 'var(--color-text-muted)',
                                                fontSize: '0.85rem',
                                                fontWeight: 500
                                            }}>{dateObj.day}</span>
                                            {/* Additional Cell Indicators */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                {!dateObj.isPadding && cleaningTasks.some(t => t.date === dateObj.dateStr && t.chaletId === selectedChaletId && t.status !== 'completed') && (
                                                    <div title="Housekeeping required" style={{
                                                        background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', borderRadius: '4px', padding: '2px 4px', display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.65rem', fontWeight: 600
                                                    }}>
                                                        <Sparkles size={10} />
                                                    </div>
                                                )}
                                                {/* Hide base price on padding days */}
                                                {!dateObj.isPadding && (
                                                    <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)' }}>
                                                        {formatPrice(currentChalet.baseNightPrice)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Render Continuous Event Segments */}
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
                    <div style={{ padding: '2rem', overflowY: 'auto', flex: 1, animation: 'fadeIn 0.2s' }}>
                        {Object.keys(groupedEvents).length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
                                <List size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
                                <div style={{ fontSize: '1.1rem', fontWeight: 500 }}>No reservations found.</div>
                            </div>
                        ) : (
                            Object.entries(groupedEvents).map(([month, monthEvents]) => (
                                <div key={month} style={{ marginBottom: '3rem' }}>
                                    <h4 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--color-text-main)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem', textTransform: 'capitalize', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <CalendarIcon size={20} color="var(--color-primary)" />
                                        {month}
                                    </h4>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ textAlign: 'left', fontSize: '0.85rem', color: 'var(--color-text-muted)', borderBottom: '1px solid rgba(255,255,255,0.05)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                <th style={{ padding: '1rem', fontWeight: 600 }}>Guest & Source</th>
                                                <th style={{ padding: '1rem', fontWeight: 600 }}>Arrival</th>
                                                <th style={{ padding: '1rem', fontWeight: 600 }}>Departure</th>
                                                <th style={{ padding: '1rem', fontWeight: 600, textAlign: 'right' }}>Duration</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {monthEvents.map(b => {
                                                const nights = Math.round((new Date(b.end) - new Date(b.start)) / (1000 * 60 * 60 * 24));
                                                return (
                                                    <tr key={b.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                                                        <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                            <div style={{ width: 14, height: 14, borderRadius: '50%', background: b.color, boxShadow: `0 0 10px ${b.color}80` }}></div>
                                                            <div>
                                                                <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>{b.guestName}</div>
                                                                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textTransform: 'capitalize', marginTop: '0.1rem' }}>{b.source}</div>
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '1rem', fontWeight: 500 }}>
                                                            {new Date(b.start).toLocaleDateString(navigator.language, { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' })}
                                                        </td>
                                                        <td style={{ padding: '1rem', fontWeight: 500 }}>
                                                            {new Date(b.end).toLocaleDateString(navigator.language, { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' })}
                                                        </td>
                                                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                            <span style={{ display: 'inline-block', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                                                                {nights} nights
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CalendarBoard;
