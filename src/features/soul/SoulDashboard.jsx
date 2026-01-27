import React, { useState } from 'react';
import { useSanctuum } from '../../context/SanctuumContext';
import { useNotification } from '../../context/NotificationContext';
import { useLanguage } from '../../context/LanguageContext';
import { AutomationEngine } from '../../services/AutomationEngine';
import { Mail, MessageCircle, Clock, Check, Send } from 'lucide-react';

const SoulDashboard = () => {
    const { rituals, toggleRitual } = useSanctuum();
    const { addNotification } = useNotification();
    const { t } = useLanguage();
    const [sending, setSending] = useState(null);

    const handleTestTrigger = (ritualId) => {
        setSending(ritualId);
        const ritual = rituals.find(r => r.id === ritualId);

        setTimeout(() => {
            const result = AutomationEngine.triggerRitual({ guestName: 'Jerome' }, ritual);
            addNotification('success', 'Ritual Sent', result.message);
            setSending(null);
        }, 1500);
    };

    return (
        <div>
            <div style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{t('soul_title')}</h2>
                <p style={{ color: 'var(--color-text-muted)' }}>{t('soul_subtitle')}</p>
            </div>

            {/* TIMELINE VISUALIZATION */}
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', marginBottom: '3rem', overflowX: 'auto' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '2rem' }}>{t('soul_guest_journey')}</h3>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', minWidth: '800px', padding: '0 2rem' }}>
                    {/* Line */}
                    <div style={{ position: 'absolute', top: '24px', left: '0', right: '0', height: '2px', background: 'rgba(255,255,255,0.1)', zIndex: 0 }}></div>

                    {rituals.map((ritual, index) => (
                        <div key={ritual.id} style={{ position: 'relative', zIndex: 1, textAlign: 'center', width: '150px' }}>
                            <div style={{
                                width: 50, height: 50, borderRadius: '50%',
                                background: ritual.active ? 'var(--color-primary)' : 'var(--color-bg-card)',
                                border: `2px solid ${ritual.active ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 1rem auto',
                                transition: 'all 0.3s'
                            }}>
                                <Clock size={20} color={ritual.active ? '#000' : 'var(--color-text-muted)'} />
                            </div>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{ritual.trigger}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{ritual.name}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* RITUAL CARDS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
                {rituals.map(ritual => (
                    <div key={ritual.id} className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: '1.5rem', borderLeft: ritual.active ? '4px solid #10b981' : '4px solid transparent', opacity: ritual.active ? 1 : 0.7 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
                            <div>
                                <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{ritual.name}</h4>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                    <span>{ritual.trigger}</span> •
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        {ritual.channel === 'whatsapp' ? <MessageCircle size={12} /> : <Mail size={12} />}
                                        {ritual.channel === 'whatsapp' ? 'WhatsApp' : 'Email'}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => toggleRitual(ritual.id)}
                                style={{
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '20px',
                                    border: 'none',
                                    background: ritual.active ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.1)',
                                    color: ritual.active ? '#10b981' : 'var(--color-text-muted)',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                {ritual.active ? t('soul_active') : t('soul_paused')}
                            </button>
                        </div>

                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', fontStyle: 'italic', marginBottom: '1.5rem', color: 'rgba(255,255,255,0.8)' }}>
                            "{ritual.messageTemplate}"
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => handleTestTrigger(ritual.id)}
                                disabled={sending === ritual.id}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-md)',
                                    padding: '0.5rem 1rem',
                                    color: '#fff',
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem'
                                }}
                            >
                                {sending === ritual.id ? <Clock size={14} className="spin" /> : <Send size={14} />}
                                {t('soul_test_trigger')}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <style>{`
                @keyframes spin { 100% { transform: rotate(360deg); } }
                .spin { animation: spin 1s linear infinite; }
            `}</style>
        </div>
    );
};

export default SoulDashboard;
