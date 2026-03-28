import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import BookingCalendar from '../components/BookingCalendar';
import { useCurrency } from '../../context/CurrencyContext';

const Book = () => {
    const navigate = useNavigate();
    // Default chalet data for display since pricing is static in UI
    const chalet = {
        name: "Chalet Ayana",
        base_night_price: 405, // Extracted from DB previously
        capacity: 6
    };

    const { formatPrice, currency } = useCurrency();

    const [loading, setLoading] = useState(true);
    const [blockedDates, setBlockedDates] = useState([]);
    const [error, setError] = useState('');
    const [showCalendar, setShowCalendar] = useState(false);
    const [showPromo, setShowPromo] = useState(false);

    const [formData, setFormData] = useState({
        checkIn: '',
        checkOut: '',
        guests: 2
    });

    useEffect(() => {
        const fetchAvailability = async () => {
            try {
                // Fetch availability (API updated to find chalet automatically)
                const res = await fetch(`/api/public/availability`);
                const availData = await res.json();

                if (availData.success && availData.blocked) {
                    setBlockedDates(availData.blocked);
                }
            } catch (err) {
                console.error('Error fetching availability:', err);
                setError('Impossible de charger les disponibilités. Veuillez réessayer plus tard.');
            } finally {
                setLoading(false);
            }
        };

        fetchAvailability();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(''); // Reset error on change
    };

    const isDateBlocked = (dateStr) => {
        const dateObj = new Date(dateStr);
        for (const block of blockedDates) {
            const start = new Date(block.start);
            const end = new Date(block.end);
            if (dateObj >= start && dateObj < end) return true;
        }
        return false;
    };

    const checkOverlap = (inDate, outDate) => {
        const inObj = new Date(inDate);
        const outObj = new Date(outDate);
        for (const block of blockedDates) {
            const startObj = new Date(block.start);
            const endObj = new Date(block.end);
            // standard overlap logic
            if (inObj < endObj && outObj > startObj) {
                return true;
            }
        }
        return false;
    };

    const handleVerifyDates = () => {
        setError('');

        if (formData.checkIn && formData.checkOut) {
            if (new Date(formData.checkIn) >= new Date(formData.checkOut)) {
                return setError("La date de départ doit être ultérieure à la date d'arrivée.");
            }
            if (checkOverlap(formData.checkIn, formData.checkOut)) {
                return setError('Ces dates ne sont plus disponibles. Veuillez sélectionner une autre période.');
            }
        }

        // Simply open the visual calendar in all cases
        setShowCalendar(true);
    };

    // Calculate nights and estimate
    let nights = 0;
    let estimatedTotal = 0;
    if (formData.checkIn && formData.checkOut) {
        const inDate = new Date(formData.checkIn);
        const outDate = new Date(formData.checkOut);
        if (outDate > inDate) {
            nights = Math.round((outDate - inDate) / (1000 * 60 * 60 * 24));
            if (chalet && chalet.base_night_price) {
                estimatedTotal = nights * chalet.base_night_price;
            }
        }
    }

    if (loading) {
        return <div style={{ paddingTop: '120px', textAlign: 'center', color: 'var(--ayana-text)', minHeight: '100vh', backgroundColor: 'var(--ayana-bg)' }}>Préchargement des dates...</div>;
    }

    return (
        <div style={{ backgroundColor: 'var(--ayana-bg)', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ padding: '0 2rem 4rem', textAlign: 'center', borderBottom: '1px solid var(--ayana-border)' }}>
                <h1 className="ayana-animate" style={{ fontFamily: 'var(--ayana-font-heading)', fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: '1rem', fontWeight: 300, color: 'var(--ayana-text)' }}>Planifiez votre moment de détente</h1>
                <p className="ayana-animate ayana-delay-1" style={{ color: 'var(--ayana-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
                    Découvrez l'expérience AYANA et arrêtez le temps pour prendre soin de vous.
                </p>
            </div>

            <div className="ayana-container" style={{ padding: '4rem 2rem 6rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '4rem', alignItems: 'start' }}>

                    {/* Colonne Gauche: Formulaire */}
                    <div className="ayana-animate ayana-delay-2">
                        <div className="ayana-card" style={{ padding: '3rem' }}>
                            {error && (
                                <div style={{ padding: '1rem 1.5rem', backgroundColor: '#fef2f2', borderLeft: '4px solid #ef4444', color: '#991b1b', borderRadius: '4px', marginBottom: '2rem', fontSize: '0.95rem' }}>
                                    {error}
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h3 style={{ fontFamily: 'var(--ayana-font-heading)', fontSize: '1.5rem', color: 'var(--ayana-text)', fontWeight: 400, margin: 0 }}>Dates du Séjour</h3>
                                <button
                                    type="button"
                                    onClick={() => setShowCalendar(true)}
                                    style={{ background: 'none', border: 'none', color: 'var(--ayana-text)', textDecoration: 'none', borderBottom: '1px solid var(--ayana-text)', cursor: 'pointer', fontSize: '0.9rem', paddingBottom: '2px' }}
                                >
                                    Voir les disponibilités →
                                </button>
                            </div>

                            {/* Native Date Inputs */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                                <div>
                                    <label style={labelStyle}>Arrivée (16h00)</label>
                                    <input
                                        type="date" name="checkIn" required
                                        value={formData.checkIn} onChange={handleChange}
                                        min={new Date().toISOString().split('T')[0]}
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Départ (11h00)</label>
                                    <input
                                        type="date" name="checkOut" required
                                        value={formData.checkOut} onChange={handleChange}
                                        min={formData.checkIn || new Date().toISOString().split('T')[0]}
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '3rem' }}>
                                <label style={labelStyle}>Nombre de convives (Max: 6)</label>
                                <select
                                    name="guests"
                                    value={formData.guests} onChange={handleChange}
                                    style={inputStyle}
                                >
                                    {[...Array(6)].map((_, i) => (
                                        <option key={i + 1} value={i + 1}>{i + 1} {i === 0 ? 'convive' : 'convives'}</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                type="button"
                                onClick={handleVerifyDates}
                                className="ayana-btn-outline"
                                style={{ width: '100%', padding: '1.25rem', fontSize: '1.1rem', border: '1px solid var(--ayana-text)' }}
                            >
                                Vérifier les disponibilités
                            </button>
                        </div>
                    </div>

                    {/* Colonne Droite: Récapitulatif (Sticky) */}
                    <div className="ayana-animate ayana-delay-3" style={{ position: 'sticky', top: '100px' }}>
                        <div style={{ padding: '2.5rem', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid var(--ayana-border)' }}>
                            <h3 style={{ fontFamily: 'var(--ayana-font-heading)', fontSize: '1.4rem', fontWeight: 600, marginBottom: '2rem', color: 'var(--ayana-text)' }}>Résumé de la réservation</h3>
                            
                            {/* Property Mini-Info */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--ayana-border)' }}>
                                <img src="/ayana/photos/exterior.jpg" alt="Chalet Ayana" style={{ width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover' }} />
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--ayana-text)', fontWeight: 400 }}>Chalet Ayana</h4>
                                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: 'var(--ayana-muted)' }}>Sainte-Adèle, QC</p>
                                </div>
                                <a href="#lieux" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', border: '1px solid var(--ayana-border)', borderRadius: '4px', textDecoration: 'none', color: 'var(--ayana-text)', transition: 'background 0.3s' }}>
                                    Détails
                                </a>
                            </div>

                            {/* Promo section */}
                            <div style={{ padding: '1.5rem 0', borderBottom: '1px solid var(--ayana-border)' }}>
                                <button 
                                    type="button"
                                    onClick={() => setShowPromo(!showPromo)} 
                                    style={{ background: 'none', border: 'none', padding: 0, color: 'var(--ayana-text)', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    Ajouter un code promo
                                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: showPromo ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}>
                                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </button>
                                {showPromo && (
                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                        <input type="text" placeholder="Code promo" style={{ flex: 1, padding: '0.75rem', border: '1px solid var(--ayana-border)', borderRadius: '4px', backgroundColor: 'rgba(0,0,0,0.02)' }} />
                                        <button type="button" style={{ padding: '0.75rem 1.5rem', backgroundColor: 'var(--ayana-text)', color: 'var(--ayana-bg)', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Appliquer</button>
                                    </div>
                                )}
                            </div>

                            {/* Pricing summary */}
                            <div style={{ padding: '1.5rem 0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', color: 'var(--ayana-text)', fontSize: '1rem' }}>
                                    <span>Location {nights > 0 ? `(${nights} ${nights > 1 ? 'nuits' : 'nuit'})` : ''}</span>
                                    <span>{nights > 0 ? formatPrice(estimatedTotal) : formatPrice(0)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.3rem', fontWeight: 600, color: 'var(--ayana-text)' }}>
                                    <span>Total ({currency})</span>
                                    <span>{nights > 0 ? formatPrice(estimatedTotal) : formatPrice(0)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Calendar Modal */}
            {showCalendar && (
                <BookingCalendar
                    chalet={chalet}
                    blockedDates={blockedDates}
                    onDatesSelected={(inDate, outDate) => {
                        setFormData(prev => ({ ...prev, checkIn: inDate, checkOut: outDate }));
                        setIsDatesValidated(false); // Force re-validation
                    }}
                    onClose={() => setShowCalendar(false)}
                />
            )}
        </div>
    );
};

const labelStyle = {
    display: 'block',
    marginBottom: '0.5rem',
    color: 'var(--ayana-text)',
    fontSize: '0.9rem',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '1px'
};

const inputStyle = {
    width: '100%',
    padding: '1rem',
    borderRadius: '4px',
    backgroundColor: 'var(--ayana-bg)',
    border: '1px solid var(--ayana-border)',
    color: 'var(--ayana-text)',
    fontSize: '1rem',
    outline: 'none',
    fontFamily: 'var(--ayana-font-body)',
    transition: 'border-color 0.3s'
};

export default Book;
