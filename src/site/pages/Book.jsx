import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const Book = () => {
    const navigate = useNavigate();
    const [chalet, setChalet] = useState(null);
    const [loadingChalet, setLoadingChalet] = useState(true);
    const [blockedDates, setBlockedDates] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        checkIn: '',
        checkOut: '',
        guests: 2,
        fullName: '',
        email: '',
        phone: '',
        note: ''
    });

    useEffect(() => {
        const fetchChaletInfoAndAvailability = async () => {
            try {
                // Fetch first chalet (Ayana)
                const { data: chalets, error: chaletError } = await supabase
                    .from('chalet')
                    .select('*')
                    .limit(1);

                if (chaletError) throw chaletError;
                if (!chalets || chalets.length === 0) throw new Error('Aucun chalet trouvé.');

                const currentChalet = chalets[0];
                setChalet(currentChalet);

                // Fetch availability
                const res = await fetch(`/api/public/availability?chaletId=${currentChalet.id}`);
                const availData = await res.json();

                if (availData.success && availData.blocked) {
                    setBlockedDates(availData.blocked);
                }
            } catch (err) {
                console.error('Error fetching chalet info:', err);
                setError('Impossible de charger les informations. Veuillez réessayer plus tard.');
            } finally {
                setLoadingChalet(false);
            }
        };

        fetchChaletInfoAndAvailability();
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (new Date(formData.checkIn) >= new Date(formData.checkOut)) {
            return setError("La date de départ doit être ultérieure à la date d'arrivée.");
        }

        if (checkOverlap(formData.checkIn, formData.checkOut)) {
            return setError('Ces dates ne sont plus disponibles. Veuillez sélectionner une autre période.');
        }

        if (!chalet) return setError('Informations du chalet indisponibles.');

        setSubmitting(true);
        try {
            const res = await fetch('/api/public/request-booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chaletId: chalet.id,
                    ...formData
                })
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Erreur lors de la réservation.');
            }

            navigate(`/ayana/thanks?bookingId=${data.bookingId}`);
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
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

    if (loadingChalet) {
        return <div style={{ paddingTop: '120px', textAlign: 'center', color: 'var(--ayana-text)', minHeight: '100vh', backgroundColor: 'var(--ayana-bg)' }}>Préparation de votre expérience...</div>;
    }

    return (
        <div style={{ backgroundColor: 'var(--ayana-bg)', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ padding: '8rem 2rem 4rem', textAlign: 'center', borderBottom: '1px solid var(--ayana-border)' }}>
                <h1 className="ayana-animate" style={{ fontFamily: 'var(--ayana-font-heading)', fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: '1rem', fontWeight: 300, color: 'var(--ayana-text)' }}>Demande de Séjour</h1>
                <p className="ayana-animate ayana-delay-1" style={{ color: 'var(--ayana-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
                    Plongez dans l'expérience Ayana. Saisissez vos dates pour vérifier la disponibilité.
                </p>
            </div>

            <div className="ayana-container" style={{ padding: '4rem 2rem 6rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '4rem', alignItems: 'start' }}>

                    {/* Colonne Gauche: Formulaire */}
                    <div className="ayana-animate ayana-delay-2">
                        <form onSubmit={handleSubmit} className="ayana-card" style={{ padding: '3rem' }}>
                            {error && (
                                <div style={{ padding: '1rem 1.5rem', backgroundColor: '#fef2f2', borderLeft: '4px solid #ef4444', color: '#991b1b', borderRadius: '4px', marginBottom: '2rem', fontSize: '0.95rem' }}>
                                    {error}
                                </div>
                            )}

                            <h3 style={{ fontFamily: 'var(--ayana-font-heading)', fontSize: '1.5rem', marginBottom: '2rem', color: 'var(--ayana-text)', fontWeight: 400 }}>Dates du Séjour</h3>
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
                                <label style={labelStyle}>Nombre de convives (Max: {chalet?.capacity || 8})</label>
                                <select
                                    name="guests"
                                    value={formData.guests} onChange={handleChange}
                                    style={inputStyle}
                                >
                                    {[...Array(chalet?.capacity || 8)].map((_, i) => (
                                        <option key={i + 1} value={i + 1}>{i + 1} {i === 0 ? 'convive' : 'convives'}</option>
                                    ))}
                                </select>
                            </div>

                            <h3 style={{ fontFamily: 'var(--ayana-font-heading)', fontSize: '1.5rem', marginBottom: '2rem', marginTop: '1rem', borderTop: '1px solid var(--ayana-border)', paddingTop: '3rem', color: 'var(--ayana-text)', fontWeight: 400 }}>
                                Vos Informations
                            </h3>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <label style={labelStyle}>Prénom et Nom *</label>
                                    <input
                                        type="text" name="fullName" required
                                        value={formData.fullName} onChange={handleChange}
                                        style={inputStyle} placeholder="Entrez votre nom"
                                    />
                                </div>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={labelStyle}>Courriel *</label>
                                    <input
                                        type="email" name="email" required
                                        value={formData.email} onChange={handleChange}
                                        style={inputStyle} placeholder="Entrez votre courriel"
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={labelStyle}>Téléphone (optionnel)</label>
                                <input
                                    type="tel" name="phone"
                                    value={formData.phone} onChange={handleChange}
                                    style={inputStyle} placeholder="+1 555 123 4567"
                                />
                            </div>

                            <div style={{ marginBottom: '3rem' }}>
                                <label style={labelStyle}>Une occasion spéciale ? (optionnel)</label>
                                <textarea
                                    name="note" rows="3"
                                    value={formData.note} onChange={handleChange}
                                    style={{ ...inputStyle, resize: 'vertical' }} placeholder="Faites-nous part de vos besoins particuliers..."
                                />
                            </div>

                            <button type="submit" disabled={submitting} className="ayana-btn" style={{ width: '100%', padding: '1.25rem', fontSize: '1.1rem', opacity: submitting ? 0.7 : 1 }}>
                                {submitting ? 'Traitement en cours...' : 'Soumettre la demande'}
                            </button>

                            <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--ayana-muted)', fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
                                Aucun paiement immédiat • Confirmation sous 24h
                            </p>
                        </form>
                    </div>

                    {/* Colonne Droite: Récapitulatif (Sticky) */}
                    <div className="ayana-animate ayana-delay-3" style={{ position: 'sticky', top: '100px' }}>
                        <div className="ayana-card" style={{ padding: 0, overflow: 'hidden' }}>
                            <div style={{ height: '250px', position: 'relative' }}>
                                <img src="/ayana/photos/exterior.jpg" alt="Chalet Ayana" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div style={{ padding: '2.5rem' }}>
                                <h3 style={{ fontFamily: 'var(--ayana-font-heading)', fontSize: '1.8rem', marginBottom: '0.5rem', color: 'var(--ayana-text)' }}>Chalet Ayana</h3>
                                <p style={{ color: 'var(--ayana-muted)', marginBottom: '2rem', fontSize: '0.95rem' }}>La Conception, Laurentides QC</p>

                                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', color: 'var(--ayana-text)', fontSize: '0.95rem' }}>
                                    <li style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px dashed var(--ayana-border)' }}>
                                        <span style={{ color: 'var(--ayana-muted)' }}>Capacité</span>
                                        <span>Jusqu'à {chalet?.capacity || 8} personnes</span>
                                    </li>
                                    <li style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px dashed var(--ayana-border)' }}>
                                        <span style={{ color: 'var(--ayana-muted)' }}>Expérience</span>
                                        <span>Circuit thermal inclus</span>
                                    </li>
                                </ul>

                                {nights > 0 ? (
                                    <div style={{ backgroundColor: 'var(--ayana-bg)', padding: '1.5rem', borderRadius: '8px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--ayana-muted)' }}>
                                            <span>{nights} {nights > 1 ? 'nuits' : 'nuit'} à ${chalet?.base_night_price || 0}</span>
                                            <span>${estimatedTotal.toFixed(2)}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 600, borderTop: '1px solid var(--ayana-border)', paddingTop: '1rem', color: 'var(--ayana-text)' }}>
                                            <span>Total Estimé</span>
                                            <span>${estimatedTotal.toFixed(2)}</span>
                                        </div>
                                        <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--ayana-muted)', marginTop: '0.5rem' }}>*Avant taxes et frais de ménage</div>
                                    </div>
                                ) : (
                                    <div style={{ backgroundColor: 'var(--ayana-bg)', padding: '1.5rem', borderRadius: '8px', textAlign: 'center', color: 'var(--ayana-muted)', fontSize: '0.95rem' }}>
                                        Sélectionnez vos dates pour obtenir une estimation du tarif.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
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
