import React from 'react';

const ReservationCard = ({ segment }) => {
    const { booking, isCheckin, isCheckout, widthCells, leftPercent } = segment;

    const platformColors = {
        airbnb: '#B85F49',
        vrbo: '#6D8290',
        booking: '#315D55',
        mrchalet: '#8B7564',
        direct: '#C5A66A'
    };

    const reservationColor =
        platformColors[booking.source] ||
        '#7A8580';

    let borderRadius = '0';
    if (isCheckin && isCheckout) {
        borderRadius = '20px';
    } else if (isCheckin) {
        borderRadius = '20px 0 0 20px';
    } else if (isCheckout) {
        borderRadius = '0 20px 20px 0';
    }

    const sourceNames = {
        airbnb: 'Airbnb',
        booking: 'Booking.com',
        vrbo: 'VRBO',
        mrchalet: 'Mr Chalet',
        direct: 'Direct'
    };

    return (
        <div style={{
            position: 'absolute',
            left: `${leftPercent}%`,
            width: `calc(${widthCells * 100}% + 1px)`,
            top: '32px',
            height: '26px',
            background: reservationColor,
            opacity: booking.status === 'blocked' ? 0.20 : 0.94,
            borderRadius: borderRadius,
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            padding: '0 10px',
            color: '#fff',
            fontSize: '0.75rem',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            border: '1px solid rgba(21,33,31,0.08)',
            borderLeft: isCheckin ? '1px solid rgba(21,33,31,0.08)' : 'none',
            borderRight: isCheckout ? '1px solid rgba(21,33,31,0.08)' : 'none',
            boxSizing: 'border-box'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                <div style={{
                    width: '16px', height: '16px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '9px'
                }}>
                    {(booking.source || 'd').charAt(0).toUpperCase()}
                </div>
                <span style={{ opacity: 0.9 }}>{sourceNames[booking.source] || 'Direct'}</span>
                {booking.guestName && (
                    <>
                        <span style={{ opacity: 0.5 }}>|</span>
                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden' }}>{booking.guestName}</span>
                    </>
                )}
            </div>
        </div>
    );
};

export default ReservationCard;
