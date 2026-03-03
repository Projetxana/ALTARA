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
                setError('Impossible de charger les informations du chalet.');
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
            return setError('La date de départ doit être après la date d\'arrivée.');
        }

        if (checkOverlap(formData.checkIn, formData.checkOut)) {
            return setError('Ces dates ne sont plus disponibles. Veuillez en choisir d\'autres.');
        }

        if (!chalet) return setError('Chalet non trouvé.');

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
        return <div style={{ paddingTop: '120px', textAlign: 'center', color: '#fff', minHeight: '100vh', backgroundColor: 'var(--color-bg-main)' }}>Chargement...</div>;
    }

    return (
        <div style={{ paddingTop: '80px', minHeight: '100vh', backgroundColor: 'var(--color-bg-main)' }}>
            <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '3.5rem', marginBottom: '1rem' }}>Réservation {chalet?.name ? `- ${chalet.name}` : ''}</h1>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
                    Faites une demande de réservation. Notre équipe vous confirmera la disponibilité rapidement.
                </p>
            </div>

            <div className="container" style={{ maxWidth: '800px', paddingBottom: '6rem' }}>
                <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '3rem', borderRadius: '16px' }}>
                    {error && (
                        <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '8px', marginBottom: '2rem' }}>
                            {error}
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                        <div>
                            <label style={labelStyle}>Arrivée</label>
                            <input
                                type="date" name="checkIn" required
                                value={formData.checkIn} onChange={handleChange}
                                min={new Date().toISOString().split('T')[0]}
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Départ</label>
                            <input
                                type="date" name="checkOut" required
                                value={formData.checkOut} onChange={handleChange}
                                min={formData.checkIn || new Date().toISOString().split('T')[0]}
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={labelStyle}>Nombre de voyageurs (Max: {chalet?.capacity || 8})</label>
                        <select
                            name="guests"
                            value={formData.guests} onChange={handleChange}
                            style={inputStyle}
                        >
                            {[...Array(chalet?.capacity || 8)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>{i + 1} {i === 0 ? 'voyageur' : 'voyageurs'}</option>
                            ))}
                        </select>
                    </div>

                    {nights > 0 && chalet && (
                        <div style={{ padding: '1.5rem', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '12px', marginBottom: '2rem', border: '1px solid var(--color-border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>
                                <span>{nights} {nights > 1 ? 'nuits' : 'nuit'} à ${chalet.base_night_price}</span>
                                <span>${estimatedTotal.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 'bold', borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '0.5rem', paddingTop: '0.5rem' }}>
                                <span>Total Estimé (avant taxes)</span>
                                <span>${estimatedTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    )}

                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', marginBottom: '1.5rem', marginTop: '3rem', borderTop: '1px solid var(--color-border)', paddingTop: '2rem' }}>
                        Vos Coordonnées
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                        <div>
                            <label style={labelStyle}>Nom Complet *</label>
                            <input
                                type="text" name="fullName" required
                                value={formData.fullName} onChange={handleChange}
                                style={inputStyle} placeholder="Jean Dupont"
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Email *</label>
                            <input
                                type="email" name="email" required
                                value={formData.email} onChange={handleChange}
                                style={inputStyle} placeholder="jean@example.com"
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={labelStyle}>Téléphone (optionnel)</label>
                        <input
                            type="tel" name="phone"
                            value={formData.phone} onChange={handleChange}
                            style={inputStyle} placeholder="+1 555 123 4567"
                        />
                    </div>

                    <div style={{ marginBottom: '3rem' }}>
                        <label style={labelStyle}>Note (optionnel)</label>
                        <textarea
                            name="note" rows="3"
                            value={formData.note} onChange={handleChange}
                            style={{ ...inputStyle, resize: 'vertical' }} placeholder="Demandes particulières..."
                        />
                    </div>

                    <button type="submit" disabled={submitting} className="btn-primary" style={{ width: '100%', padding: '1.25rem', fontSize: '1.2rem', opacity: submitting ? 0.7 : 1 }}>
                        {submitting ? 'Envoi en cours...' : 'Demander une Réservation'}
                    </button>
                    <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                        Ceci ne constitue pas un engagement. Aucun paiement n'est requis à cette étape.
                    </p>
                </form>
            </div>
        </div>
    );
};

const labelStyle = {
    display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.9rem', fontWeight: 500
};

const inputStyle = {
    width: '100%', padding: '1rem', borderRadius: '8px',
    backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)',
    color: 'var(--color-text-main)', fontSize: '1rem', outline: 'none'
};

export default Book;
