import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Filter, Home } from 'lucide-react';
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
        bookings
    } = useSanctuum();
    const { t, language } = useLanguage();

    // STATE: Dynamic Calendar Date
    const [viewDate, setViewDate] = useState(new Date());

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

    const days = [t('cal_mon'), t('cal_tue'), t('cal_wed'), t('cal_thu'), t('cal_fri'), t('cal_sat'), t('cal_sun')];

    // Generate dates for current viewDate (Month)
    const generateDates = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth(); // 0-indexed

        // First day of month
        const firstDay = new Date(year, month, 1);
        // Last day of month
        const lastDay = new Date(year, month + 1, 0);

        const dates = [];

        // Padding for starting day (if month doesn't start on Monday)
        // Day of week: 0 (Sun) - 6 (Sat)
        // We want Mon=0, Sun=6
        let startDay = firstDay.getDay();
        if (startDay === 0) startDay = 7; // Convert Sun 0 to 7 for easy math
        startDay -= 1; // Make Mon 0

        // Add empty slots for padding
        for (let j = 0; j < startDay; j++) {
            dates.push(null);
        }

        // Days in month
        const numDays = lastDay.getDate();
        for (let i = 1; i <= numDays; i++) {
            const dayString = i < 10 ? `0${i}` : `${i}`;
            const monthString = (month + 1) < 10 ? `0${month + 1}` : `${month + 1}`;
            const dateStr = `${year}-${monthString}-${dayString}`;
            dates.push({ day: i, dateStr });
        }

        return dates;
    };

    const dates = generateDates(viewDate);

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

    const getBookingForDate = (dateStr) => {
        if (!dateStr) return [];
        // Use new events state
        return events.filter(b => {
            return dateStr >= b.start && dateStr < b.end;
        });
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
                                style={{ padding: '0.5rem', border: 'none', background: 'transparent', color: 'var(--color-text-main)', cursor: 'pointer' }}>
                                <ChevronLeft size={20} />
                            </button>
                            <span style={{ padding: '0 1rem', fontWeight: 600, fontSize: '0.95rem', minWidth: '140px', textAlign: 'center' }}>{monthLabel}</span>
                            <button
                                onClick={nextMonth}
                                style={{ padding: '0.5rem', border: 'none', background: 'transparent', color: 'var(--color-text-main)', cursor: 'pointer' }}>
                                <ChevronRight size={20} />
                            </button>
                        </div>
                        <button
                            onClick={() => setViewDate(new Date())}
                            style={{ fontSize: '0.8rem', background: 'none', border: '1px solid var(--color-border)', padding: '0.25rem 0.75rem', borderRadius: '4px', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                            {t('cal_today')}
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF5A5F' }}></span>Airbnb</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6' }}></span>VRBO</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#003580' }}></span>Booking</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#d4af37' }}></span>Direct</div>
                    </div>
                </div>

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
                        // Handle Padding Strings (nulls)
                        if (!dateObj) {
                            return <div key={`pad-${i}`} style={{ background: 'rgba(0,0,0,0.2)', borderRight: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}></div>;
                        }

                        const bookingsForDay = getBookingForDate(dateObj.dateStr);

                        return (
                            <div key={i} style={{
                                borderBottom: '1px solid var(--color-border)',
                                borderRight: '1px solid var(--color-border)',
                                padding: '0.5rem',
                                position: 'relative',
                                cursor: 'pointer',
                                transition: 'background 0.2s',
                            }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <span style={{
                                        color: 'var(--color-text-muted)',
                                        fontSize: '0.85rem',
                                        fontWeight: 500
                                    }}>{dateObj.day}</span>
                                    <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)' }}>{formatPrice(currentChalet.baseNightPrice)}</span>
                                </div>

                                {bookingsForDay.map(booking => {
                                    return (
                                        <ReservationCard
                                            key={booking.id}
                                            guestName={booking.guestName || booking.guest || 'Unknown'}
                                            platform={{ name: booking.source, color: booking.color }}
                                            color={booking.color}
                                            revenue={formatPrice(booking.totalRevenue || 0)}
                                            upsells={booking.upsells}
                                        />
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default CalendarBoard;
