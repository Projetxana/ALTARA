import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSanctuum } from '../../context/SanctuumContext';
import { useNotification } from '../../context/NotificationContext';
import { useLanguage } from '../../context/LanguageContext';
import { differenceInDays, addDays, format } from 'date-fns';
import { Calendar, Users, Star, ArrowRight } from 'lucide-react';
import PaymentForm from './PaymentForm';

const BookingPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { chalets, experiences, createBooking } = useSanctuum();
    const { addNotification } = useNotification();
    const { t } = useLanguage();

    const chalet = chalets.find(c => c.id === id);

    // State
    const [startDate, setStartDate] = useState(format(addDays(new Date(), 7), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(addDays(new Date(), 10), 'yyyy-MM-dd'));
    const [guestName, setGuestName] = useState('');
    const [selectedUpsells, setSelectedUpsells] = useState([]);
    const [step, setStep] = useState(1); // 1: Details, 2: Payment, 3: Success

    // Derived Logic
    if (!chalet) return <div>Chalet not found</div>;

    const nights = differenceInDays(new Date(endDate), new Date(startDate)) || 0;
    const nightTotal = nights * chalet.baseNightPrice;
    const cleaningFee = 150;
    const upsellTotal = selectedUpsells.reduce((sum, id) => {
        const exp = experiences.find(e => e.id === id);
        return sum + (exp ? exp.price : 0);
    }, 0);
    const subtotal = nightTotal + cleaningFee + upsellTotal;
    const tax = subtotal * 0.10;
    const total = subtotal + tax;

    const toggleUpsell = (id) => {
        setSelectedUpsells(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleBookingComplete = () => {
        createBooking({
            chaletId: chalet.id,
            guestName: guestName || 'Guest User',
            startDate,
            endDate,
            totalPrice: total
        });
        addNotification('success', 'Booking Confirmed', 'Confirmation email sent to guest.');
        // Set success step
        setStep(3);
    };

    if (step === 3) {
        return (
            <div style={{ maxWidth: '800px', margin: '4rem auto', textAlign: 'center' }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>{t('book_success_title')}</h1>
                <p style={{ fontSize: '1.25rem', color: 'var(--color-text-muted)', marginBottom: '3rem' }}>
                    {t('book_success_msg')}
                </p>
                <button className="btn-primary" onClick={() => navigate('/planning')}>
                    {t('book_return')}
                </button>
            </div>
        );
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '3rem', maxWidth: '1200px', margin: '0 auto' }}>

            {/* LEFT COLUMN */}
            <div>
                <header style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{chalet.name}</h1>
                    <p style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Users size={16} /> 8 {t('book_guests')} • {chalet.location}
                    </p>
                </header>

                <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>{t('book_your_stay')}</h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{t('book_checkin')}</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: '#fff' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{t('book_checkout')}</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: '#fff' }}
                            />
                        </div>
                    </div>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Star size={20} color="var(--color-primary)" />
                        {t('book_enhance')}
                    </h3>

                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {experiences.filter(e => e.active).map(exp => (
                            <div
                                key={exp.id}
                                onClick={() => toggleUpsell(exp.id)}
                                className="glass-panel"
                                style={{
                                    padding: '1rem',
                                    borderRadius: 'var(--radius-md)',
                                    cursor: 'pointer',
                                    border: selectedUpsells.includes(exp.id) ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <div>
                                    <div style={{ fontWeight: 600 }}>{exp.name}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{t('book_premium_addon')}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <span>€{exp.price}</span>
                                    <div style={{
                                        width: 20, height: 20, borderRadius: '50%',
                                        border: '1px solid var(--color-text-muted)',
                                        background: selectedUpsells.includes(exp.id) ? 'var(--color-primary)' : 'transparent',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        {selectedUpsells.includes(exp.id) && <Users size={12} color="#000" />}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* RIGHT COLUMN (STICKY) */}
            <div>
                <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', position: 'sticky', top: '2rem' }}>

                    {step === 1 ? (
                        <>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>{t('book_price_details')}</h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--color-text-muted)' }}>€{chalet.baseNightPrice} x {nights} {t('book_nights')}</span>
                                    <span>€{nightTotal.toLocaleString()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--color-text-muted)' }}>{t('book_cleaning')}</span>
                                    <span>€{cleaningFee}</span>
                                </div>
                                {selectedUpsells.length > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--color-text-muted)' }}>Experiences ({selectedUpsells.length})</span>
                                        <span>€{upsellTotal}</span>
                                    </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--color-text-muted)' }}>{t('book_taxes')} (10%)</span>
                                    <span>€{tax.toFixed(0)}</span>
                                </div>

                                <div style={{ height: '1px', background: 'var(--color-border)', margin: '0.5rem 0' }}></div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 600 }}>
                                    <span>{t('book_total')}</span>
                                    <span>€{total.toLocaleString()}</span>
                                </div>
                            </div>

                            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setStep(2)}>
                                {t('book_proceed')} <ArrowRight size={18} />
                            </button>
                        </>
                    ) : (
                        <PaymentForm total={total.toFixed(0)} onSubmit={handleBookingComplete} />
                    )}

                </div>
            </div>
        </div>
    );
};

export default BookingPage;
