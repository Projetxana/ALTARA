import React from 'react';
import { User, DollarSign, Sparkles } from 'lucide-react';

const ReservationCard = ({ guestName, platform, revenue, upsells = [], color }) => {
    return (
        <div style={{
            marginTop: '0.25rem',
            padding: '0.5rem',
            borderRadius: 'var(--radius-md)',
            background: color || 'linear-gradient(135deg, #3b82f6, #2563eb)',
            color: '#fff',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            cursor: 'pointer',
            fontSize: '0.75rem',
            position: 'relative',
            overflow: 'hidden',
            borderLeft: '3px solid rgba(255,255,255,0.3)'
        }}>
            {/* Top Row: Name & Platform Icon */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', overflow: 'hidden' }}>
                    <span style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {guestName}
                    </span>
                </div>
                <div style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.65rem',
                    fontWeight: 700
                }}>
                    {platform?.icon || 'D'}
                </div>
            </div>

            {/* Bottom Row: Revenue & Upsells */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.9 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.1rem' }}>

                    <span>{revenue}</span>
                </div>

                {upsells.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Sparkles size={10} />
                        <span>{upsells.length}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReservationCard;
