import React from 'react';
import { Sparkles, MoreHorizontal, Power } from 'lucide-react';

const ExperienceCard = ({ experience }) => {
    return (
        <div className="glass-panel" style={{
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            position: 'relative',
            transition: 'transform 0.2s',
            cursor: 'pointer'
        }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
            {/* Visual Placeholder */}
            <div style={{
                height: '160px',
                background: experience.active ?
                    'linear-gradient(135deg, #1e293b, #0f172a)' :
                    'linear-gradient(135deg, #1e293b, #0f172a)',
                opacity: experience.active ? 1 : 0.6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
            }}>
                <Sparkles size={32} color={experience.active ? 'var(--color-primary)' : 'var(--color-text-muted)'} opacity={0.5} />

                {/* Status Badge */}
                <div style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '20px',
                    background: experience.active ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                    color: experience.active ? '#10b981' : 'var(--color-text-muted)',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    backdropFilter: 'blur(4px)'
                }}>
                    {experience.active ? 'Active' : 'Archived'}
                </div>
            </div>

            <div style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', color: experience.active ? '#fff' : 'var(--color-text-muted)' }}>{experience.name}</h3>
                    <button style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                        <MoreHorizontal size={18} />
                    </button>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem', lineHeight: '1.4' }}>
                    Enhance the guest stay with this premium add-on. Automatically offered during checkout flow.
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-primary)' }}>€{experience.price}</span>
                    <button style={{
                        padding: '0.5rem',
                        borderRadius: '50%',
                        background: experience.active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--color-border)',
                        color: experience.active ? '#10b981' : 'var(--color-text-muted)',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Power size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExperienceCard;
