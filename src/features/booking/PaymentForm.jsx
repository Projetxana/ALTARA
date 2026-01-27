import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { CreditCard, Lock } from 'lucide-react';

const PaymentForm = ({ total, onSubmit }) => {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate Stripe API call
        setTimeout(() => {
            setLoading(false);
            setSuccess(true);
            setTimeout(() => onSubmit(), 1000);
        }, 2000);
    };

    if (success) {
        return (
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: '#10b981', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✓</div>
                <h3>Payment Successful</h3>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{t('pay_cardholder')}</label>
                <input
                    type="text"
                    placeholder="John Doe"
                    required
                    style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: '#fff' }}
                />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{t('pay_cardnumber')}</label>
                <div style={{ position: 'relative' }}>
                    <CreditCard size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                    <input
                        type="text"
                        placeholder="0000 0000 0000 0000"
                        required
                        style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: '#fff' }}
                    />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{t('pay_expiry')}</label>
                    <input
                        type="text"
                        placeholder="MM / YY"
                        required
                        style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: '#fff' }}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{t('pay_cvc')}</label>
                    <input
                        type="text"
                        placeholder="123"
                        required
                        style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: '#fff' }}
                    />
                </div>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                {loading ? 'Processing...' : `${t('pay_btn')} €${total}`}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                <Lock size={12} /> {t('pay_secure')}
            </div>
        </form>
    );
};

export default PaymentForm;
