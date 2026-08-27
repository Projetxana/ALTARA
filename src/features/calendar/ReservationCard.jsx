import React from 'react';

const ReservationCard = ({
    segment,
    onClick
}) => {
    const {
        booking,
        isCheckin,
        isCheckout,
        widthCells,
        leftPercent
    } = segment;

    let borderRadius = '0';

    if (isCheckin && isCheckout) {
        borderRadius = '20px';
    } else if (isCheckin) {
        borderRadius = '20px 0 0 20px';
    } else if (isCheckout) {
        borderRadius = '0 20px 20px 0';
    }

    const isCalendarBlock =
        booking.eventType === 'calendar_block';

    const sourceNames = {
        airbnb: 'Airbnb',
        booking: 'Booking.com',
        vrbo: 'VRBO',
        mrchalet: 'Mr Chalet',
        direct: 'Direct',
        'altara-block': 'Blocage'
    };

    const paymentStatus =
        booking.paymentStatus ||
        booking.payment_status;

    const showPaymentIndicator =
        !isCalendarBlock &&
        booking.source === 'direct' &&
        widthCells >= 2;

    const paymentIndicator = {
        paid: '✓',
        partially_paid: '◐',
        payment_pending: '◷',
        unpaid: '$',
        refunded: '↩'
    };

    const handleOpen = () => {
        if (onClick) {
            onClick(booking);
        }
    };

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={(e) => {
                e.stopPropagation();
                handleOpen();
            }}
            onKeyDown={(e) => {
                if (
                    e.key === 'Enter' ||
                    e.key === ' '
                ) {
                    e.preventDefault();
                    handleOpen();
                }
            }}
            title="Voir les détails"
            style={{
                position: 'absolute',
                left: `${leftPercent}%`,
                width:
                    `calc(${widthCells * 100}% + 1px)`,
                top: '32px',
                height: '26px',
                background:
                    booking.color || '#3b82f6',
                opacity:
                    booking.status === 'blocked'
                        ? 0.4
                        : 1,
                borderRadius,
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                padding: '0 10px',
                color: '#fff',
                fontSize: '0.75rem',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                border:
                    '1px solid rgba(0,0,0,0.1)',
                borderLeft: isCheckin
                    ? '1px solid rgba(0,0,0,0.1)'
                    : 'none',
                borderRight: isCheckout
                    ? '1px solid rgba(0,0,0,0.1)'
                    : 'none',
                boxSizing: 'border-box',
                cursor: 'pointer'
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    minWidth: 0,
                    width: '100%'
                }}
            >
                <div
                    style={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        background:
                            'rgba(255,255,255,0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '9px',
                        flexShrink: 0
                    }}
                >
                    {isCalendarBlock
                        ? 'B'
                        : (
                            booking.source || 'd'
                        )
                            .charAt(0)
                            .toUpperCase()}
                </div>

                <span
                    style={{
                        opacity: 0.9,
                        flexShrink: 0
                    }}
                >
                    {sourceNames[booking.source] ||
                        'Direct'}
                </span>

                {booking.guestName && (
                    <>
                        <span
                            style={{
                                opacity: 0.5
                            }}
                        >
                            |
                        </span>

                        <span
                            style={{
                                textOverflow: 'ellipsis',
                                overflow: 'hidden',
                                minWidth: 0
                            }}
                        >
                            {booking.guestName}
                        </span>
                    </>
                )}

                {showPaymentIndicator && (
                    <span
                        title={
                            paymentStatus === 'paid'
                                ? 'Payé'
                                : paymentStatus ===
                                    'partially_paid'
                                    ? 'Partiellement payé'
                                    : 'Non payé'
                        }
                        style={{
                            marginLeft: 'auto',
                            flexShrink: 0,
                            width: 17,
                            height: 17,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background:
                                'rgba(255,255,255,0.22)',
                            fontSize: '9px'
                        }}
                    >
                        {paymentIndicator[
                            paymentStatus
                        ] || '$'}
                    </span>
                )}
            </div>
        </div>
    );
};

export default ReservationCard;
