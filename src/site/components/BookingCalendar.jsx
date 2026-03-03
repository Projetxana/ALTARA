import React, { useState, useEffect } from 'react';
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isBefore, startOfToday, addDays, getDay } from 'date-fns';
import { fr } from 'date-fns/locale';

const BookingCalendar = ({ chalet, blockedDates, onDatesSelected, onClose }) => {
    const today = startOfToday();
    const [currentDate, setCurrentDate] = useState(startOfMonth(today));

    // Selection state
    const [checkIn, setCheckIn] = useState(null);
    const [checkOut, setCheckOut] = useState(null);
    const [hoverDate, setHoverDate] = useState(null);

    // Calculate nights for validation text
    const nights = (checkIn && checkOut) ? Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24)) : 0;

    // Helper: is a specific date blocked?
    const isDateBlocked = (dateObj) => {
        // First strictly check if it's before today
        if (isBefore(dateObj, today)) return true;

        for (const block of blockedDates) {
            const start = new Date(block.start);
            const end = new Date(block.end);
            start.setHours(0, 0, 0, 0);
            end.setHours(0, 0, 0, 0);

            // If date is >= start and STRICTLY < end, it's blocked.
            // If date === end, it's available for check-in ONLY IF it's not starting another block immediately.
            // For simplicity in this grid: if it's during a booking [start, end-1], it's blocked.
            if (dateObj >= start && dateObj < end) return true;
        }
        return false;
    };

    // Helper: is a range valid (no blocked dates in between)?
    const isRangeValid = (start, end) => {
        if (!start || !end || start >= end) return false;

        // Check every day in between
        const days = eachDayOfInterval({ start, end });
        // We exclude the very last day (checkOut) from being "blocked" 
        // because you can check out on a day someone else checks in.
        for (let i = 0; i < days.length - 1; i++) {
            if (isDateBlocked(days[i])) return false;
        }
        return true;
    };

    const handleDateClick = (date) => {
        if (isDateBlocked(date)) return;

        // Reset if we already have both, or if selecting a date before check-in
        if (checkIn && checkOut) {
            setCheckIn(date);
            setCheckOut(null);
        } else if (checkIn && isBefore(date, checkIn)) {
            setCheckIn(date);
            setCheckOut(null);
        } else if (checkIn && !checkOut) {
            // Trying to set checkout
            if (isRangeValid(checkIn, date)) {
                setCheckOut(date);
            } else {
                // Invalid range (blocked dates in middle), reset check-in
                setCheckIn(date);
            }
        } else {
            // Setting check-in
            setCheckIn(date);
        }
    };

    const handleValidate = () => {
        if (checkIn && checkOut) {
            // Send back YYYY-MM-DD strings local time adjusted
            const formatStr = (d) => {
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };
            onDatesSelected(formatStr(checkIn), formatStr(checkOut));
            onClose();
        }
    };

    // Render a single month
    const renderMonth = (monthStart) => {
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfMonth(monthStart);

        // Days of the month
        const days = eachDayOfInterval({ start: startDate, end: monthEnd });

        // Padding for the first week (0 = Sunday in JS, but UI usually wants 1 = Lundi)
        const firstDayOfWeek = getDay(startDate);
        // Adjust so Monday is 0, Sunday is 6
        const paddingDays = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

        return (
            <div key={monthStart.toString()} style={{ marginBottom: '4rem' }}>
                <h3 style={{ fontSize: '2rem', fontFamily: 'var(--ayana-font-heading)', color: 'var(--ayana-text)', marginBottom: '2rem', textTransform: 'lowercase' }}>
                    {format(monthStart, 'MMMM', { locale: fr })}
                </h3>

                {/* Days of week header */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1rem', marginBottom: '1rem', textAlign: 'center', color: 'var(--ayana-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    <div>Lu</div><div>Ma</div><div>Me</div><div>Je</div><div>Ve</div><div>Sa</div><div>Di</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
                    {/* Empty padding blocks */}
                    {[...Array(paddingDays)].map((_, i) => (
                        <div key={`pad-${i}`} />
                    ))}

                    {/* Actual days */}
                    {days.map(date => {
                        const blocked = isDateBlocked(date);
                        const isPast = isBefore(date, today);

                        let isSelected = false;
                        let isBetween = false;

                        if (checkIn && isSameDay(date, checkIn)) isSelected = true;
                        if (checkOut && isSameDay(date, checkOut)) isSelected = true;

                        if (checkIn && checkOut && date > checkIn && date < checkOut) {
                            isBetween = true;
                        } else if (checkIn && !checkOut && hoverDate && date > checkIn && date <= hoverDate) {
                            // Only highlight hover if range is valid
                            if (isRangeValid(checkIn, hoverDate)) {
                                isBetween = true;
                            }
                        }

                        // Style logic matching screenshot
                        let bgColor = 'var(--ayana-surface)'; // Default grey
                        let borderColor = 'transparent';
                        let textColor = 'var(--ayana-text)';
                        let priceColor = 'var(--ayana-text)';

                        if (blocked || isPast) {
                            bgColor = 'transparent';
                            textColor = 'var(--ayana-muted)';
                            priceColor = 'var(--ayana-muted)';
                        } else {
                            // Available
                            borderColor = 'rgba(31,35,40,0.1)';

                            if (isSelected) {
                                bgColor = 'var(--ayana-text)';
                                textColor = 'var(--ayana-bg)';
                                priceColor = 'var(--ayana-bg)';
                                borderColor = 'var(--ayana-text)';
                            } else if (isBetween) {
                                bgColor = 'rgba(31,35,40,0.1)';
                                borderColor = 'transparent';
                            }
                        }

                        return (
                            <button
                                key={date.toString()}
                                disabled={blocked || isPast}
                                onClick={() => handleDateClick(date)}
                                onMouseEnter={() => setHoverDate(date)}
                                onMouseLeave={() => setHoverDate(null)}
                                style={{
                                    border: `1px solid ${borderColor}`,
                                    backgroundColor: bgColor,
                                    borderRadius: '12px',
                                    padding: '1.5rem 1rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    minHeight: '100px',
                                    cursor: (blocked || isPast) ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s ease',
                                    position: 'relative'
                                }}
                            >
                                <span style={{
                                    fontSize: '1rem',
                                    fontWeight: isSelected ? 600 : 400,
                                    color: textColor,
                                    textDecoration: (blocked || isPast) ? 'line-through' : 'none',
                                    marginBottom: '0.5rem'
                                }}>
                                    {format(date, 'd')}
                                </span>

                                {!(blocked || isPast) && (
                                    <span style={{ fontSize: '0.8rem', color: priceColor, fontWeight: isSelected ? 500 : 400 }}>
                                        {chalet?.base_night_price}$ CAD
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'var(--ayana-bg)', zIndex: 1000, display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--ayana-border)', backgroundColor: 'var(--ayana-bg)', zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', padding: '0.5rem', color: 'var(--ayana-text)' }}>✕</button>
                    <div>
                        <h2 style={{ fontFamily: 'var(--ayana-font-heading)', fontSize: '1.5rem', fontWeight: 400 }}>Dates du Séjour</h2>
                        {checkIn ? (
                            <p style={{ color: 'var(--ayana-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                                {format(checkIn, 'd MMM yyyy', { locale: fr })} — {checkOut ? format(checkOut, 'd MMM yyyy', { locale: fr }) : 'Sélectionnez le départ'}
                            </p>
                        ) : (
                            <p style={{ color: 'var(--ayana-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Sélectionnez l'arrivée</p>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    {checkIn && checkOut && (
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{(nights * (chalet?.base_night_price || 0))}$ CAD</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--ayana-muted)' }}>{nights} nuits à {chalet?.base_night_price}$</div>
                        </div>
                    )}
                    <button
                        onClick={handleValidate}
                        disabled={!checkIn || !checkOut}
                        className="ayana-btn"
                        style={{ padding: '1rem 3rem', opacity: (!checkIn || !checkOut) ? 0.5 : 1, cursor: (!checkIn || !checkOut) ? 'not-allowed' : 'pointer' }}
                    >
                        Valider ces dates
                    </button>
                </div>
            </div>

            {/* Scrollable Calendar Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '4rem 2rem' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    {/* Render current month + next 3 months */}
                    {renderMonth(currentDate)}
                    {renderMonth(addMonths(currentDate, 1))}
                    {renderMonth(addMonths(currentDate, 2))}
                    {renderMonth(addMonths(currentDate, 3))}
                </div>
            </div>
        </div>
    );
};

export default BookingCalendar;
