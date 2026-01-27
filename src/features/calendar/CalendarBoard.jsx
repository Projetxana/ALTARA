import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Filter, Home } from 'lucide-react';
import { useSanctuum } from '../../context/SanctuumContext';
import ReservationCard from './ReservationCard';

const CalendarBoard = () => {
    const {
        chalets,
        selectedChaletId,
        setSelectedChaletId,
        currentChalet,
        getBookingsForChalet,
        getPlatformById,
        getGuestById,
        experiences,
        formatPrice
    } = useSanctuum();

    // STATE: Dynamic Calendar Date
    const [viewDate, setViewDate] = useState(new Date());

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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
    const monthLabel = viewDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    if (!currentChalet) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh', flexDirection: 'column', gap: '1rem', color: 'var(--color-text-muted)' }}>
                <Home size={48} style={{ opacity: 0.5 }} />
                <h3>Welcome to ALTARA</h3>
                <p>You have no properties under management yet.</p>
                <a href="/properties" className="btn-primary" style={{ textDecoration: 'none' }}>
                    Create your first Property
                </a>
            </div>
        );
    }

    const chaletBookings = getBookingsForChalet(selectedChaletId);

    const getBookingForDate = (dateStr) => {
        if (!dateStr) return [];
        // Find booking where date is within range [checkIn, checkOut)
        // ALSO: Be robust to string/date mismatch. Assuming strings "YYYY-MM-DD"
        return chaletBookings.filter(b => {
            return dateStr >= b.checkInDate && dateStr < b.checkOutDate;
        });
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '1.5rem', height: 'calc(100vh - 140px)' }}>

            {/* 2. PLANNING UI - LEFT PANEL (Chalet Selector) */}
            <div className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: '1rem' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Collection</h3>
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
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Current Stats</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.85rem' }}>Occupancy</span>
                        <span style={{ fontWeight: 600, color: 'var(--color-accent)' }}>78%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.85rem' }}>RevPAR</span>
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
                            Today
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
                                    // Logic requested by user for coloring
                                    // Mapping internal schema to the requested visual logic
                                    const backgroundColor =
                                        booking.source === "airbnb" ? "#FF5A5F" :
                                            booking.source === "manual" ? "#4CAF50" :
                                                booking.source === "booking" ? "#3F51B5" :
                                                    booking.source === "vrbo" ? "#FF9800" :
                                                        "#9E9E9E";

                                    return (
                                        <ReservationCard
                                            key={booking.id}
                                            guestName={booking.guestName || booking.guest || 'Unknown'}
                                            platform={{ name: booking.source, color: backgroundColor }} // Mocking platform obj to pass color
                                            color={backgroundColor}
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
