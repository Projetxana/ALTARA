import { altaraApi } from '../../config/appRuntime.js';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BookingCalendar from '../components/BookingCalendar';
import { useCurrency } from '../../context/CurrencyContext';
import CurrencySelector from '../components/CurrencySelector';

const Book = ({ initialCheckIn = '', initialCheckOut = '', initialGuests = 2 }) => {
    const navigate = useNavigate();
    const [chalet, setChalet] = useState({
        name: 'Ayana',
        location: '',
        capacity: 6
    });

    const [quote, setQuote] = useState(null);
    const [quoteLoading, setQuoteLoading] = useState(false);
    const [dailyRates, setDailyRates] = useState({});

    const [guestData, setGuestData] = useState({
        fullName: '',
        email: '',
        phone: ''
    });

    const [bookingLoading, setBookingLoading] =
        useState(false);

    const { formatPrice, currency } = useCurrency();

    const [loading, setLoading] = useState(true);
    const [blockedDates, setBlockedDates] = useState([]);
    const [error, setError] = useState('');
    const [showCalendar, setShowCalendar] = useState(false);
    const [showPromo, setShowPromo] = useState(false);

    const [formData, setFormData] = useState({
        checkIn: initialCheckIn,
        checkOut: initialCheckOut,
        guests: initialGuests,
        pets: 0
    });

    useEffect(() => {
        if (initialCheckIn || initialCheckOut || initialGuests) {
            setFormData(prev => ({
                ...prev,
                checkIn: initialCheckIn || prev.checkIn,
                checkOut: initialCheckOut || prev.checkOut,
                guests: initialGuests || prev.guests
            }));
        }
    }, [initialCheckIn, initialCheckOut, initialGuests]);

    useEffect(() => {
        const fetchAvailability = async () => {
            try {
                // Fetch availability (API updated to find chalet automatically)
                const res = await fetch(altaraApi(`/api/public/availability`));
                const availData = await res.json();

                if (availData.success) {
                    setBlockedDates(
                        availData.blocked || []
                    );

                    if (availData.property) {
                        setChalet(prev => ({
                            ...prev,
                            ...availData.property
                        }));
                    }

                    if (availData.dailyRates) {
                        setDailyRates(
                            availData.dailyRates
                        );
                    }
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

    const handleVerifyDates = async () => {
        try {
            setError('');
            setQuote(null);

            if (
                !formData.checkIn ||
                !formData.checkOut
            ) {
                setShowCalendar(true);
                return;
            }

            if (
                formData.checkIn >=
                formData.checkOut
            ) {
                throw new Error(
                    "La date de départ doit être ultérieure à la date d'arrivée."
                );
            }

            setQuoteLoading(true);

            const params =
                new URLSearchParams({
                    checkIn:
                        formData.checkIn,
                    checkOut:
                        formData.checkOut
                });

            const response =
                await fetch(altaraApi(`/api/public/availability?${params.toString()}`)
                );

            const data =
                await response.json();

            if (
                !response.ok ||
                !data.success
            ) {
                throw new Error(
                    data.error ||
                    'Ces dates ne sont pas disponibles.'
                );
            }

            setBlockedDates(
                data.blocked || []
            );

            if (data.property) {
                setChalet(prev => ({
                    ...prev,
                    ...data.property
                }));
            }

            setQuote(data.quote);

        } catch (err) {
            console.error(err);

            setError(
                err.message ||
                'Impossible de vérifier ces dates.'
            );
        } finally {
            setQuoteLoading(false);
        }
    };

    const handleGuestChange = (e) => {
        setGuestData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));

        setError('');
    };

    const handleBookAndPay = async () => {
        try {
            setError('');

            if (!quote) {
                throw new Error(
                    'Veuillez d’abord vérifier vos dates.'
                );
            }

            if (
                !guestData.fullName.trim() ||
                !guestData.email.trim()
            ) {
                throw new Error(
                    'Votre nom et votre adresse courriel sont requis.'
                );
            }

            setBookingLoading(true);

            /*
             * 1. Server creates the authoritative
             * pending website booking and recalculates
             * the stay price.
             */
            const bookingResponse =
                await fetch(altaraApi('/api/public/request-booking'),
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type':
                                'application/json'
                        },
                        body: JSON.stringify({
                            checkIn:
                                formData.checkIn,
                            checkOut:
                                formData.checkOut,
                            guests:
                                Number(formData.guests),
                            fullName:
                                guestData.fullName,
                            email:
                                guestData.email,
                            phone:
                                guestData.phone
                        })
                    }
                );

            const bookingData =
                await bookingResponse.json();

            if (
                !bookingResponse.ok ||
                !bookingData.success
            ) {
                throw new Error(
                    bookingData.details ||
                    bookingData.error ||
                    'Impossible de créer la réservation.'
                );
            }

            /*
             * 2. Create hosted Stripe Checkout.
             * The high-entropy booking reference is
             * required for public authorization.
             */
            const checkoutResponse =
                await fetch(altaraApi('/api/payments/create-checkout-session'),
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type':
                                'application/json'
                        },
                        body: JSON.stringify({
                            bookingId:
                                bookingData.bookingId,
                            bookingReference:
                                bookingData.bookingReference
                        })
                    }
                );

            const checkoutData =
                await checkoutResponse.json();

            if (
                !checkoutResponse.ok ||
                !checkoutData.success ||
                !checkoutData.url
            ) {
                throw new Error(
                    checkoutData.error ||
                    'Impossible d’ouvrir le paiement sécurisé.'
                );
            }

            window.location.href =
                checkoutData.url;

        } catch (err) {
            console.error(
                '[PUBLIC BOOKING]',
                err
            );

            setError(
                err.message ||
                'Une erreur est survenue.'
            );
        } finally {
            setBookingLoading(false);
        }
    };

    const nights =
        quote?.nights || 0;

    const estimatedTotal =
        quote?.total || 0;

    if (loading) {
        return <div style={{ paddingTop: '120px', textAlign: 'center', color: 'var(--ayana-text)', minHeight: '100vh', backgroundColor: 'var(--ayana-bg)' }}>Préchargement des dates...</div>;
    }

    return (
        <div style={{ backgroundColor: 'var(--ayana-bg)', minHeight: '100vh' }}>
            {/* Header */}
            <div className="ayana-book-header" style={{ padding: '0 2rem 4rem', textAlign: 'center', borderBottom: '1px solid var(--ayana-border)' }}>
                <h1 className="ayana-animate" style={{ fontFamily: 'var(--ayana-font-heading)', fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: '1rem', fontWeight: 300, color: 'var(--ayana-text)' }}>Planifiez votre moment de détente</h1>
                <p className="ayana-animate ayana-delay-1" style={{ color: 'var(--ayana-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
                    Découvrez l'expérience AYANA et arrêtez le temps pour prendre soin de vous.
                </p>
            </div>

            <div className="ayana-container ayana-book-container" style={{ padding: '4rem 2rem 6rem' }}>
                <div className="ayana-book-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '4rem', alignItems: 'start' }}>

                    {/* Colonne Gauche: Formulaire */}
                    <div className="ayana-animate ayana-delay-2">
                        <div className="ayana-card ayana-book-form-card" style={{ padding: '3rem' }}>
                            {error && (
                                <div style={{ padding: '1rem 1.5rem', backgroundColor: '#fef2f2', borderLeft: '4px solid #ef4444', color: '#991b1b', borderRadius: '4px', marginBottom: '2rem', fontSize: '0.95rem' }}>
                                    {error}
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h3 style={{ fontFamily: 'var(--ayana-font-heading)', fontSize: '1.5rem', color: 'var(--ayana-text)', fontWeight: 400, margin: 0 }}>Dates du Séjour</h3>
                            </div>

                            {/* Single calendar date selector */}
                            <div style={{ marginBottom: '2rem' }}>
                                <label style={labelStyle}>Dates du séjour</label>

                                <button
                                    type="button"
                                    onClick={() => setShowCalendar(true)}
                                    className="ayana-book-date-picker"
                                    style={{
                                        width: '100%',
                                        padding: '1.15rem 1.2rem',
                                        border: '1px solid var(--ayana-border)',
                                        borderRadius: '8px',
                                        backgroundColor: 'var(--ayana-surface)',
                                        color: 'var(--ayana-text)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: '1rem',
                                        cursor: 'pointer',
                                        textAlign: 'left'
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.9rem',
                                            minWidth: 0
                                        }}
                                    >
                                        <svg
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            style={{ flexShrink: 0 }}
                                        >
                                            <rect x="3" y="4" width="18" height="18" rx="2" />
                                            <line x1="16" y1="2" x2="16" y2="6" />
                                            <line x1="8" y1="2" x2="8" y2="6" />
                                            <line x1="3" y1="10" x2="21" y2="10" />
                                        </svg>

                                        <span
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.65rem',
                                                flexWrap: 'wrap',
                                                fontSize: '1rem'
                                            }}
                                        >
                                            <span
                                                style={{
                                                    color: formData.checkIn
                                                        ? 'var(--ayana-text)'
                                                        : 'var(--ayana-muted)'
                                                }}
                                            >
                                                {formData.checkIn
                                                    ? new Date(
                                                        `${formData.checkIn}T12:00:00`
                                                      ).toLocaleDateString(
                                                        'fr-CA',
                                                        {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        }
                                                      )
                                                    : 'Arrivée'}
                                            </span>

                                            <span style={{ opacity: 0.4 }}>—</span>

                                            <span
                                                style={{
                                                    color: formData.checkOut
                                                        ? 'var(--ayana-text)'
                                                        : 'var(--ayana-muted)'
                                                }}
                                            >
                                                {formData.checkOut
                                                    ? new Date(
                                                        `${formData.checkOut}T12:00:00`
                                                      ).toLocaleDateString(
                                                        'fr-CA',
                                                        {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        }
                                                      )
                                                    : 'Départ'}
                                            </span>
                                        </span>
                                    </div>

                                    <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        style={{ flexShrink: 0, opacity: 0.5 }}
                                    >
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                </button>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={labelStyle}>Nombre de voyageurs (Max: 6)</label>
                                <select
                                    name="guests"
                                    value={formData.guests} onChange={handleChange}
                                    style={inputStyle}
                                >
                                    {[...Array(6)].map((_, i) => (
                                        <option key={i + 1} value={i + 1}>{i + 1} {i === 0 ? 'voyageur' : 'voyageurs'}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginBottom: '3rem' }}>
                                <label style={labelStyle}>Animaux de compagnie</label>
                                <select
                                    name="pets"
                                    value={formData.pets} onChange={handleChange}
                                    style={inputStyle}
                                >
                                    <option value={0}>Aucun animal</option>
                                    <option value={1}>1 animal (Maximum autorisé)</option>
                                </select>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    if (quote) {
                                        setShowCalendar(true);
                                        return;
                                    }

                                    handleVerifyDates();
                                }}
                                disabled={quoteLoading}
                                className="ayana-btn-outline"
                                style={{ width: '100%', padding: '1.25rem', fontSize: '1.1rem', border: '1px solid var(--ayana-text)' }}
                            >
                                {quoteLoading
                                    ? 'Vérification…'
                                    : quote
                                        ? 'Modifier mes dates'
                                        : 'Vérifier les disponibilités'}
                            </button>

                            {quote && (
                                <div
                                    style={{
                                        marginTop: '3rem',
                                        paddingTop: '3rem',
                                        borderTop:
                                            '1px solid var(--ayana-border)'
                                    }}
                                >
                                    <h3
                                        style={{
                                            fontFamily:
                                                'var(--ayana-font-heading)',
                                            fontSize: '1.5rem',
                                            color:
                                                'var(--ayana-text)',
                                            fontWeight: 400,
                                            margin:
                                                '0 0 2rem'
                                        }}
                                    >
                                        Vos coordonnées
                                    </h3>

                                    <div
                                        style={{
                                            display: 'grid',
                                            gap: '1.5rem'
                                        }}
                                    >
                                        <div>
                                            <label style={labelStyle}>
                                                Nom complet
                                            </label>

                                            <input
                                                type="text"
                                                name="fullName"
                                                value={
                                                    guestData.fullName
                                                }
                                                onChange={
                                                    handleGuestChange
                                                }
                                                autoComplete="name"
                                                style={inputStyle}
                                            />
                                        </div>

                                        <div>
                                            <label style={labelStyle}>
                                                Adresse courriel
                                            </label>

                                            <input
                                                type="email"
                                                name="email"
                                                value={
                                                    guestData.email
                                                }
                                                onChange={
                                                    handleGuestChange
                                                }
                                                autoComplete="email"
                                                style={inputStyle}
                                            />
                                        </div>

                                        <div>
                                            <label style={labelStyle}>
                                                Téléphone
                                            </label>

                                            <input
                                                type="tel"
                                                name="phone"
                                                value={
                                                    guestData.phone
                                                }
                                                onChange={
                                                    handleGuestChange
                                                }
                                                autoComplete="tel"
                                                style={inputStyle}
                                            />
                                        </div>

                                        <button
                                            type="button"
                                            onClick={
                                                handleBookAndPay
                                            }
                                            disabled={
                                                bookingLoading
                                            }
                                            className="ayana-btn"
                                            style={{
                                                width: '100%',
                                                padding: '1.25rem',
                                                fontSize: '1.1rem',
                                                marginTop: '1rem',
                                                opacity:
                                                    bookingLoading
                                                        ? 0.65
                                                        : 1,
                                                cursor:
                                                    bookingLoading
                                                        ? 'wait'
                                                        : 'pointer'
                                            }}
                                        >
                                            {bookingLoading
                                                ? 'Préparation du paiement…'
                                                : `Réserver et payer ${formatPrice(
                                                    quote.total
                                                )}`}
                                        </button>

                                        <p
                                            style={{
                                                margin: 0,
                                                textAlign: 'center',
                                                color:
                                                    'var(--ayana-muted)',
                                                fontSize: '0.85rem',
                                                lineHeight: 1.5
                                            }}
                                        >
                                            Paiement sécurisé par Stripe.
                                            Vos informations bancaires ne
                                            transitent jamais par AYANA.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Colonne Droite: Récapitulatif (Sticky) */}
                    <div className="ayana-animate ayana-delay-3 ayana-book-summary" style={{ position: 'sticky', top: '100px' }}>
                        <div style={{ padding: '2.5rem', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid var(--ayana-border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                                <h3 style={{ fontFamily: 'var(--ayana-font-heading)', fontSize: '1.4rem', fontWeight: 600, margin: 0, color: 'var(--ayana-text)' }}>Résumé de la réservation</h3>
                                <div style={{ marginTop: '-0.5rem', marginRight: '-0.5rem', zIndex: 50 }}>
                                    <CurrencySelector direction="down" />
                                </div>
                            </div>
                            
                            {/* Property Mini-Info */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--ayana-border)' }}>
                                <img src="/ayana/photos/exterior.jpg" alt={chalet.name} style={{ width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover' }} />
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--ayana-text)', fontWeight: 400 }}>{chalet.name}</h4>
                                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: 'var(--ayana-muted)' }}>{chalet.location || 'Sainte-Adèle, QC'}</p>
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
                                {quoteLoading ? (
                                    <div
                                        style={{
                                            color: 'var(--ayana-muted)',
                                            lineHeight: 1.6
                                        }}
                                    >
                                        Calcul du meilleur tarif disponible…
                                    </div>
                                ) : quote ? (
                                    <>
                                        <div
                                            style={{
                                                display: 'grid',
                                                gap: '0.9rem',
                                                paddingBottom: '1.25rem',
                                                borderBottom: '1px solid var(--ayana-border)'
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between'
                                                }}
                                            >
                                                <span>
                                                    Hébergement ({quote.nights}{' '}
                                                    {quote.nights > 1
                                                        ? 'nuits'
                                                        : 'nuit'})
                                                </span>

                                                <span>
                                                    {formatPrice(
                                                        quote.accommodation
                                                    )}
                                                </span>
                                            </div>

                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between'
                                                }}
                                            >
                                                <span>
                                                    Frais de ménage
                                                </span>

                                                <span>
                                                    {formatPrice(
                                                        quote.cleaningFee
                                                    )}
                                                </span>
                                            </div>

                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between'
                                                }}
                                            >
                                                <span>Taxes</span>

                                                <span>
                                                    {formatPrice(
                                                        quote.taxes
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                paddingTop: '1.25rem',
                                                fontSize: '1.3rem',
                                                fontWeight: 600,
                                                color: 'var(--ayana-text)'
                                            }}
                                        >
                                            <span>
                                                Total ({currency})
                                            </span>

                                            <span>
                                                {formatPrice(
                                                    quote.total
                                                )}
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <div
                                        style={{
                                            color: 'var(--ayana-muted)',
                                            lineHeight: 1.6
                                        }}
                                    >
                                        Sélectionnez vos dates pour obtenir le tarif exact du séjour.
                                    </div>
                                )}
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
                    dailyRates={dailyRates}
                    onDatesSelected={async (inDate, outDate) => {
                        setFormData(prev => ({
                            ...prev,
                            checkIn: inDate,
                            checkOut: outDate
                        }));

                        setError('');
                        setQuote(null);
                        setQuoteLoading(true);

                        try {
                            const params =
                                new URLSearchParams({
                                    checkIn: inDate,
                                    checkOut: outDate
                                });

                            const response =
                                await fetch(altaraApi(`/api/public/availability?${params.toString()}`)
                                );

                            const data =
                                await response.json();

                            if (
                                !response.ok ||
                                !data.success
                            ) {
                                throw new Error(
                                    data.error ||
                                    'Impossible de calculer le séjour.'
                                );
                            }

                            setBlockedDates(
                                data.blocked || []
                            );

                            if (data.property) {
                                setChalet(prev => ({
                                    ...prev,
                                    ...data.property
                                }));
                            }

                            setQuote(
                                data.quote || null
                            );

                        } catch (err) {
                            console.error(
                                '[QUOTE AFTER CALENDAR]',
                                err
                            );

                            setError(
                                err.message ||
                                'Impossible de calculer le séjour.'
                            );
                        } finally {
                            setQuoteLoading(false);
                        }
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
