import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    CalendarDays,
    Hammer,
    Home,
    UserRound,
    Users,
    Wrench,
    Clock3
} from 'lucide-react';
import { addDays, format } from 'date-fns';

import { useSanctuum } from '../../context/SanctuumContext';
import { useNotification } from '../../context/NotificationContext';
import BookingPricingService from '../pricing/BookingPricingService';
import BookingService from './BookingService';

const fieldStyle = {
    width: '100%',
    padding: '0.8rem 0.9rem',
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--color-text-main)'
};

const labelStyle = {
    display: 'block',
    marginBottom: '0.45rem',
    fontSize: '0.8rem',
    fontWeight: 600,
    color: 'var(--color-text-muted)'
};

const BookingPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const {
        chalets,
        experiences,
        createBooking,
        createCalendarBlock,
        formatPrice,
        currency
    } = useSanctuum();

    const { addNotification } = useNotification();

    const chalet = chalets.find(c => c.id === id);

    const [mode, setMode] = useState(null);

    const [startDate, setStartDate] = useState(
        format(addDays(new Date(), 7), 'yyyy-MM-dd')
    );

    const [endDate, setEndDate] = useState(
        format(addDays(new Date(), 10), 'yyyy-MM-dd')
    );

    // Booking
    const [guestName, setGuestName] = useState('');
    const [guestEmail, setGuestEmail] = useState('');
    const [guestPhone, setGuestPhone] = useState('');
    const [guestNote, setGuestNote] = useState('');
    const [selectedUpsells, setSelectedUpsells] = useState([]);

    // Calendar block
    const [blockType, setBlockType] = useState('owner');
    const [blockGuestName, setBlockGuestName] = useState('');
    const [blockGuestEmail, setBlockGuestEmail] = useState('');
    const [blockNote, setBlockNote] = useState('');
    const [expiryPreset, setExpiryPreset] = useState('none');

    // Shared
    const [stayPricing, setStayPricing] = useState(null);
    const [pricingLoading, setPricingLoading] = useState(false);
    const [pricingError, setPricingError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        let cancelled = false;

        const loadPricing = async () => {
            if (
                mode !== 'booking' ||
                !chalet?.id ||
                !startDate ||
                !endDate ||
                startDate >= endDate
            ) {
                setStayPricing(null);
                return;
            }

            try {
                setPricingLoading(true);
                setPricingError(null);

                const pricing =
                    await BookingPricingService.calculateStay(
                        chalet.id,
                        startDate,
                        endDate
                    );

                if (!cancelled) {
                    setStayPricing(pricing);
                }
            } catch (error) {
                console.error(
                    '[BookingPage] Unable to calculate stay:',
                    error
                );

                if (!cancelled) {
                    setStayPricing(null);
                    setPricingError(error.message);
                }
            } finally {
                if (!cancelled) {
                    setPricingLoading(false);
                }
            }
        };

        loadPricing();

        return () => {
            cancelled = true;
        };
    }, [mode, chalet?.id, startDate, endDate]);

    if (!chalet) {
        return <div>Propriété introuvable.</div>;
    }

    const nightTotal =
        stayPricing?.estimatedAccommodationRevenue || 0;

    const nights =
        stayPricing?.numberOfNights || 0;

    const cleaningFee = 150;

    const upsellTotal = selectedUpsells.reduce(
        (sum, experienceId) => {
            const experience = experiences.find(
                item => item.id === experienceId
            );

            return sum + (experience?.price || 0);
        },
        0
    );

    const subtotal =
        nightTotal + cleaningFee + upsellTotal;

    const tax = subtotal * 0.10;
    const total = subtotal + tax;

    const toggleUpsell = (experienceId) => {
        setSelectedUpsells(prev =>
            prev.includes(experienceId)
                ? prev.filter(id => id !== experienceId)
                : [...prev, experienceId]
        );
    };

    const getExpiresAt = () => {
        if (expiryPreset === 'none') {
            return null;
        }

        const hours = Number(expiryPreset);

        return new Date(
            Date.now() + hours * 60 * 60 * 1000
        ).toISOString();
    };

    const validateAvailability = async () => {
        const available =
            await BookingService.checkAvailability(
                chalet.id,
                startDate,
                endDate
            );

        if (!available) {
            throw new Error(
                'Cette période n’est plus disponible.'
            );
        }
    };

    const handleCreateBooking = async () => {
        try {
            setSubmitting(true);
            setSubmitError('');

            if (!guestName.trim()) {
                throw new Error(
                    'Le nom du client est requis.'
                );
            }

            await validateAvailability();

            const booking = await createBooking({
                chaletId: chalet.id,
                guestName,
                guestEmail,
                guestPhone,
                guestNote,
                startDate,
                endDate,
                totalPrice: total,
                currency
            });

            addNotification(
                'success',
                'Réservation créée',
                'La réservation est enregistrée. Paiement non encaissé.'
            );

            setSuccess({
                type: 'booking',
                item: booking
            });
        } catch (error) {
            console.error(error);
            setSubmitError(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCreateBlock = async () => {
        try {
            setSubmitting(true);
            setSubmitError('');

            await validateAvailability();

            const block = await createCalendarBlock({
                chaletId: chalet.id,
                blockType,
                startDate,
                endDate,
                guestName:
                    blockType === 'guest_hold'
                        ? blockGuestName
                        : '',
                guestEmail:
                    blockType === 'guest_hold'
                        ? blockGuestEmail
                        : '',
                note: blockNote,
                expiresAt:
                    blockType === 'guest_hold'
                        ? getExpiresAt()
                        : null
            });

            addNotification(
                'success',
                'Période bloquée',
                'Les dates sont maintenant indisponibles.'
            );

            setSuccess({
                type: 'block',
                item: block
            });
        } catch (error) {
            console.error(error);
            setSubmitError(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        const isBooking = success.type === 'booking';

        return (
            <div
                style={{
                    maxWidth: 760,
                    margin: '4rem auto',
                    textAlign: 'center'
                }}
            >
                <div
                    style={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        background: '#173A35',
                        color: '#fff',
                        margin: '0 auto 1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    ✓
                </div>

                <h1
                    className="page-title"
                    style={{
                        fontSize: '2.6rem',
                        marginBottom: '0.75rem'
                    }}
                >
                    {isBooking
                        ? 'Réservation créée'
                        : 'Période bloquée'}
                </h1>

                <p
                    style={{
                        color: 'var(--color-text-muted)',
                        fontSize: '1.05rem',
                        marginBottom: '2rem'
                    }}
                >
                    {isBooking
                        ? 'La réservation est enregistrée. Aucun paiement n’a encore été encaissé.'
                        : 'Les dates sont maintenant protégées dans le planning.'}
                </p>

                {isBooking && (
                    <div
                        className="glass-panel"
                        style={{
                            padding: '1.25rem 1.5rem',
                            marginBottom: '2rem',
                            textAlign: 'left'
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between'
                            }}
                        >
                            <span>Paiement</span>

                            <strong
                                style={{
                                    color: '#A75B45'
                                }}
                            >
                                Non payé
                            </strong>
                        </div>

                        <div
                            style={{
                                marginTop: '0.6rem',
                                color: 'var(--color-text-muted)',
                                fontSize: '0.85rem'
                            }}
                        >
                            Le lien de paiement sécurisé sera ajouté
                            dans la prochaine étape.
                        </div>
                    </div>
                )}

                <button
                    className="btn-primary"
                    onClick={() => navigate('/planning')}
                >
                    Retour au planning
                </button>
            </div>
        );
    }

    if (!mode) {
        return (
            <div
                style={{
                    maxWidth: 920,
                    margin: '2rem auto'
                }}
            >
                <header
                    style={{
                        marginBottom: '2.5rem'
                    }}
                >
                    <h1
                        className="page-title"
                        style={{
                            fontSize: '2.7rem',
                            marginBottom: '0.5rem'
                        }}
                    >
                        Nouvelle occupation
                    </h1>

                    <p
                        style={{
                            color: 'var(--color-text-muted)'
                        }}
                    >
                        {chalet.name} · {chalet.location}
                    </p>
                </header>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns:
                            'repeat(2, minmax(0, 1fr))',
                        gap: '1.5rem'
                    }}
                >
                    <button
                        onClick={() => setMode('booking')}
                        className="glass-panel"
                        style={{
                            padding: '2rem',
                            border: '1px solid var(--color-border)',
                            background: '#FFFFFF',
                            textAlign: 'left',
                            cursor: 'pointer'
                        }}
                    >
                        <UserRound
                            size={30}
                            color="#A75B45"
                        />

                        <h2
                            style={{
                                margin: '1rem 0 0.5rem'
                            }}
                        >
                            Réservation client
                        </h2>

                        <p
                            style={{
                                color: 'var(--color-text-muted)',
                                lineHeight: 1.55
                            }}
                        >
                            Ajouter une réservation provenant d’un
                            appel, email, WhatsApp ou client direct.
                        </p>
                    </button>

                    <button
                        onClick={() => setMode('block')}
                        className="glass-panel"
                        style={{
                            padding: '2rem',
                            border: '1px solid var(--color-border)',
                            background: '#FFFFFF',
                            textAlign: 'left',
                            cursor: 'pointer'
                        }}
                    >
                        <CalendarDays
                            size={30}
                            color="#173A35"
                        />

                        <h2
                            style={{
                                margin: '1rem 0 0.5rem'
                            }}
                        >
                            Bloquer des dates
                        </h2>

                        <p
                            style={{
                                color: 'var(--color-text-muted)',
                                lineHeight: 1.55
                            }}
                        >
                            Usage personnel, maintenance, option client
                            ou autre indisponibilité.
                        </p>
                    </button>
                </div>
            </div>
        );
    }

    const dateFields = (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem'
            }}
        >
            <div>
                <label style={labelStyle}>
                    Début
                </label>

                <input
                    type="date"
                    value={startDate}
                    onChange={e =>
                        setStartDate(e.target.value)
                    }
                    style={fieldStyle}
                />
            </div>

            <div>
                <label style={labelStyle}>
                    Fin
                </label>

                <input
                    type="date"
                    value={endDate}
                    onChange={e =>
                        setEndDate(e.target.value)
                    }
                    style={fieldStyle}
                />
            </div>
        </div>
    );

    if (mode === 'block') {
        const blockOptions = [
            {
                id: 'owner',
                label: 'Usage personnel',
                icon: Home
            },
            {
                id: 'maintenance',
                label: 'Maintenance',
                icon: Wrench
            },
            {
                id: 'guest_hold',
                label: 'Option client',
                icon: Clock3
            },
            {
                id: 'other',
                label: 'Autre',
                icon: Hammer
            }
        ];

        return (
            <div
                style={{
                    maxWidth: 820,
                    margin: '1rem auto'
                }}
            >
                <button
                    onClick={() => {
                        setMode(null);
                        setSubmitError('');
                    }}
                    style={{
                        border: 0,
                        background: 'transparent',
                        cursor: 'pointer',
                        color: 'var(--color-text-muted)',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                    }}
                >
                    <ArrowLeft size={16} />
                    Retour
                </button>

                <h1
                    className="page-title"
                    style={{
                        fontSize: '2.5rem',
                        marginBottom: '0.5rem'
                    }}
                >
                    Bloquer une période
                </h1>

                <p
                    style={{
                        color: 'var(--color-text-muted)',
                        marginBottom: '2rem'
                    }}
                >
                    {chalet.name}
                </p>

                <div
                    className="glass-panel"
                    style={{
                        padding: '2rem'
                    }}
                >
                    {dateFields}

                    <div
                        style={{
                            marginTop: '2rem'
                        }}
                    >
                        <label style={labelStyle}>
                            Motif
                        </label>

                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns:
                                    'repeat(2, 1fr)',
                                gap: '0.75rem'
                            }}
                        >
                            {blockOptions.map(option => {
                                const Icon = option.icon;
                                const selected =
                                    blockType === option.id;

                                return (
                                    <button
                                        type="button"
                                        key={option.id}
                                        onClick={() =>
                                            setBlockType(option.id)
                                        }
                                        style={{
                                            padding: '1rem',
                                            borderRadius:
                                                'var(--radius-md)',
                                            border: selected
                                                ? '1px solid #173A35'
                                                : '1px solid var(--color-border)',
                                            background: selected
                                                ? '#EEF2EE'
                                                : '#FFFFFF',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            color:
                                                'var(--color-text-main)'
                                        }}
                                    >
                                        <Icon
                                            size={18}
                                            style={{
                                                marginBottom: '0.5rem'
                                            }}
                                        />

                                        <div
                                            style={{
                                                fontWeight: 600
                                            }}
                                        >
                                            {option.label}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {blockType === 'guest_hold' && (
                        <div
                            style={{
                                marginTop: '1.5rem',
                                display: 'grid',
                                gap: '1rem'
                            }}
                        >
                            <div>
                                <label style={labelStyle}>
                                    Nom du client
                                </label>

                                <input
                                    value={blockGuestName}
                                    onChange={e =>
                                        setBlockGuestName(
                                            e.target.value
                                        )
                                    }
                                    style={fieldStyle}
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>
                                    Email
                                </label>

                                <input
                                    type="email"
                                    value={blockGuestEmail}
                                    onChange={e =>
                                        setBlockGuestEmail(
                                            e.target.value
                                        )
                                    }
                                    style={fieldStyle}
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>
                                    Expiration de l’option
                                </label>

                                <select
                                    value={expiryPreset}
                                    onChange={e =>
                                        setExpiryPreset(
                                            e.target.value
                                        )
                                    }
                                    style={fieldStyle}
                                >
                                    <option value="none">
                                        Aucune expiration
                                    </option>
                                    <option value="24">
                                        24 heures
                                    </option>
                                    <option value="48">
                                        48 heures
                                    </option>
                                    <option value="72">
                                        72 heures
                                    </option>
                                </select>
                            </div>
                        </div>
                    )}

                    <div
                        style={{
                            marginTop: '1.5rem'
                        }}
                    >
                        <label style={labelStyle}>
                            Note
                        </label>

                        <textarea
                            value={blockNote}
                            onChange={e =>
                                setBlockNote(e.target.value)
                            }
                            rows={4}
                            style={{
                                ...fieldStyle,
                                resize: 'vertical'
                            }}
                        />
                    </div>

                    {submitError && (
                        <div
                            style={{
                                marginTop: '1rem',
                                color: '#A75B45'
                            }}
                        >
                            {submitError}
                        </div>
                    )}

                    <button
                        className="btn-primary"
                        disabled={submitting}
                        onClick={handleCreateBlock}
                        style={{
                            width: '100%',
                            justifyContent: 'center',
                            marginTop: '2rem'
                        }}
                    >
                        {submitting
                            ? 'Enregistrement…'
                            : 'Bloquer les dates'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            style={{
                maxWidth: 1100,
                margin: '1rem auto'
            }}
        >
            <button
                onClick={() => {
                    setMode(null);
                    setSubmitError('');
                }}
                style={{
                    border: 0,
                    background: 'transparent',
                    cursor: 'pointer',
                    color: 'var(--color-text-muted)',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                }}
            >
                <ArrowLeft size={16} />
                Retour
            </button>

            <h1
                className="page-title"
                style={{
                    fontSize: '2.5rem',
                    marginBottom: '0.5rem'
                }}
            >
                Nouvelle réservation
            </h1>

            <p
                style={{
                    color: 'var(--color-text-muted)',
                    marginBottom: '2rem'
                }}
            >
                {chalet.name}
            </p>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: '1.4fr 0.8fr',
                    gap: '2rem'
                }}
            >
                <div
                    className="glass-panel"
                    style={{
                        padding: '2rem'
                    }}
                >
                    {dateFields}

                    <div
                        style={{
                            marginTop: '1.5rem',
                            display: 'grid',
                            gap: '1rem'
                        }}
                    >
                        <div>
                            <label style={labelStyle}>
                                Nom du client
                            </label>

                            <input
                                value={guestName}
                                onChange={e =>
                                    setGuestName(e.target.value)
                                }
                                style={fieldStyle}
                            />
                        </div>

                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '1rem'
                            }}
                        >
                            <div>
                                <label style={labelStyle}>
                                    Email
                                </label>

                                <input
                                    type="email"
                                    value={guestEmail}
                                    onChange={e =>
                                        setGuestEmail(
                                            e.target.value
                                        )
                                    }
                                    style={fieldStyle}
                                />
                            </div>

                            <div>
                                <label style={labelStyle}>
                                    Téléphone
                                </label>

                                <input
                                    value={guestPhone}
                                    onChange={e =>
                                        setGuestPhone(
                                            e.target.value
                                        )
                                    }
                                    style={fieldStyle}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={labelStyle}>
                                Note
                            </label>

                            <textarea
                                value={guestNote}
                                onChange={e =>
                                    setGuestNote(e.target.value)
                                }
                                rows={3}
                                style={{
                                    ...fieldStyle,
                                    resize: 'vertical'
                                }}
                            />
                        </div>
                    </div>

                    {experiences.filter(e => e.active).length > 0 && (
                        <div
                            style={{
                                marginTop: '2rem'
                            }}
                        >
                            <h3>
                                Expériences
                            </h3>

                            <div
                                style={{
                                    display: 'grid',
                                    gap: '0.7rem',
                                    marginTop: '1rem'
                                }}
                            >
                                {experiences
                                    .filter(e => e.active)
                                    .map(exp => (
                                        <button
                                            type="button"
                                            key={exp.id}
                                            onClick={() =>
                                                toggleUpsell(exp.id)
                                            }
                                            style={{
                                                display: 'flex',
                                                justifyContent:
                                                    'space-between',
                                                padding: '0.9rem 1rem',
                                                borderRadius:
                                                    'var(--radius-md)',
                                                border:
                                                    selectedUpsells.includes(
                                                        exp.id
                                                    )
                                                        ? '1px solid #173A35'
                                                        : '1px solid var(--color-border)',
                                                background:
                                                    selectedUpsells.includes(
                                                        exp.id
                                                    )
                                                        ? '#EEF2EE'
                                                        : '#FFFFFF',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <span>{exp.name}</span>
                                            <span>
                                                {formatPrice(exp.price)}
                                            </span>
                                        </button>
                                    ))}
                            </div>
                        </div>
                    )}
                </div>

                <div>
                    <div
                        className="glass-panel"
                        style={{
                            padding: '1.75rem',
                            position: 'sticky',
                            top: '1.5rem'
                        }}
                    >
                        <h2
                            style={{
                                marginBottom: '1.5rem'
                            }}
                        >
                            Récapitulatif
                        </h2>

                        {pricingLoading ? (
                            <p>Calcul du tarif…</p>
                        ) : pricingError ? (
                            <p
                                style={{
                                    color: '#A75B45'
                                }}
                            >
                                {pricingError}
                            </p>
                        ) : (
                            <>
                                <div
                                    style={{
                                        display: 'grid',
                                        gap: '0.9rem'
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent:
                                                'space-between'
                                        }}
                                    >
                                        <span>
                                            {nights} nuit
                                            {nights > 1 ? 's' : ''}
                                        </span>
                                        <span>
                                            {formatPrice(nightTotal)}
                                        </span>
                                    </div>

                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent:
                                                'space-between'
                                        }}
                                    >
                                        <span>Ménage</span>
                                        <span>
                                            {formatPrice(cleaningFee)}
                                        </span>
                                    </div>

                                    {upsellTotal > 0 && (
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent:
                                                    'space-between'
                                            }}
                                        >
                                            <span>Expériences</span>
                                            <span>
                                                {formatPrice(
                                                    upsellTotal
                                                )}
                                            </span>
                                        </div>
                                    )}

                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent:
                                                'space-between'
                                        }}
                                    >
                                        <span>Taxes</span>
                                        <span>
                                            {formatPrice(tax)}
                                        </span>
                                    </div>
                                </div>

                                <div
                                    style={{
                                        height: 1,
                                        background:
                                            'var(--color-border)',
                                        margin: '1.25rem 0'
                                    }}
                                />

                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent:
                                            'space-between',
                                        fontSize: '1.25rem',
                                        fontWeight: 700
                                    }}
                                >
                                    <span>Total</span>
                                    <span>
                                        {formatPrice(total)}
                                    </span>
                                </div>

                                <div
                                    style={{
                                        marginTop: '1rem',
                                        padding: '0.8rem',
                                        borderRadius:
                                            'var(--radius-md)',
                                        background: '#F7F1EC',
                                        color: '#81513F',
                                        fontSize: '0.85rem'
                                    }}
                                >
                                    Paiement : Non payé
                                </div>
                            </>
                        )}

                        {submitError && (
                            <div
                                style={{
                                    marginTop: '1rem',
                                    color: '#A75B45'
                                }}
                            >
                                {submitError}
                            </div>
                        )}

                        <button
                            className="btn-primary"
                            disabled={
                                submitting ||
                                pricingLoading ||
                                !stayPricing
                            }
                            onClick={handleCreateBooking}
                            style={{
                                width: '100%',
                                justifyContent: 'center',
                                marginTop: '1.5rem'
                            }}
                        >
                            {submitting
                                ? 'Création…'
                                : 'Créer la réservation'}
                        </button>

                        <p
                            style={{
                                marginTop: '0.8rem',
                                fontSize: '0.75rem',
                                textAlign: 'center',
                                color: 'var(--color-text-muted)'
                            }}
                        >
                            Aucun paiement bancaire n’est demandé ici.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingPage;
