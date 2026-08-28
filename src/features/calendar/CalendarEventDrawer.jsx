import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
    X,
    UserRound,
    Mail,
    Phone,
    CalendarDays,
    CreditCard,
    FileText,
    Clock3,
    Wrench,
    Home,
    LockKeyhole
} from 'lucide-react';

import { useSanctuum } from '../../context/SanctuumContext';
import PaymentService from '../payments/PaymentService';

const sourceLabels = {
    direct: 'Direct',
    airbnb: 'Airbnb',
    booking: 'Booking.com',
    vrbo: 'VRBO',
    mrchalet: 'Mr Chalet',
    'altara-block': 'Blocage ALTARA'
};

const paymentLabels = {
    unpaid: 'Non payé',
    payment_pending: 'Paiement en cours',
    partially_paid: 'Partiellement payé',
    paid: 'Payé',
    refunded: 'Remboursé'
};

const paymentColors = {
    unpaid: '#A75B45',
    payment_pending: '#9A8B7E',
    partially_paid: '#A88645',
    paid: '#2F6B5D',
    refunded: '#6B7280'
};

const blockLabels = {
    owner: 'Usage personnel',
    maintenance: 'Maintenance',
    guest_hold: 'Option client',
    other: 'Autre indisponibilité'
};

const fieldStyle = {
    width: '100%',
    minHeight: 42,
    padding: '0.7rem 0.8rem',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    background: '#FFFFFF',
    color: 'var(--color-text-main)'
};

const labelStyle = {
    display: 'block',
    marginBottom: '0.35rem',
    fontSize: '0.72rem',
    fontWeight: 700,
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
};

const formatDate = value => {
    if (!value) return '—';

    return new Date(`${value}T12:00:00`).toLocaleDateString(
        'fr-CA',
        {
            weekday: 'short',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }
    );
};

const InfoRow = ({ icon: Icon, label, value }) => {
    if (!value) return null;

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: '24px 130px 1fr',
                gap: '0.65rem',
                alignItems: 'start',
                padding: '0.8rem 0',
                borderBottom: '1px solid var(--color-border)'
            }}
        >
            <Icon
                size={16}
                style={{
                    color: 'var(--color-text-muted)',
                    marginTop: 2
                }}
            />

            <span
                style={{
                    color: 'var(--color-text-muted)',
                    fontSize: '0.82rem'
                }}
            >
                {label}
            </span>

            <span
                style={{
                    fontSize: '0.9rem',
                    color: 'var(--color-text-main)',
                    overflowWrap: 'anywhere'
                }}
            >
                {value}
            </span>
        </div>
    );
};

const CalendarEventDrawer = ({
    event,
    onClose,
    formatPrice
}) => {
    const {
        updateBooking,
        cancelBooking,
        updateCalendarBlock,
        deleteCalendarBlock
    } = useSanctuum();

    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const [draft, setDraft] = useState({});
    const [paymentLink, setPaymentLink] = useState('');
    const [paymentLinkLoading, setPaymentLinkLoading] = useState(false);
    const [paymentLinkError, setPaymentLinkError] = useState('');
    const [paymentCopied, setPaymentCopied] = useState(false);

    useEffect(() => {
        if (!event) return;

        setEditing(false);
        setError('');
        setPaymentLink('');
        setPaymentLinkError('');
        setPaymentCopied(false);

        setDraft({
            startDate: event.start || '',
            endDate: event.end || '',
            guestName:
                event.guestName ||
                event.blockGuestName ||
                '',
            guestEmail:
                event.guestEmail ||
                event.guest_email ||
                event.blockGuestEmail ||
                '',
            guestPhone:
                event.guestPhone ||
                event.guest_phone ||
                '',
            guestNote:
                event.guestNote ||
                event.guest_note ||
                event.note ||
                '',
            blockType:
                event.blockType ||
                event.block_type ||
                'other'
        });
    }, [event]);

    useEffect(() => {
        if (!event) return;

        const handleKeyDown = e => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener(
                'keydown',
                handleKeyDown
            );
        };
    }, [event, onClose]);

    if (!event) return null;

    const isBlock =
        event.eventType === 'calendar_block';

    const blockType =
        event.blockType ||
        event.block_type;

    const paymentStatus =
        event.paymentStatus ||
        event.payment_status ||
        'unpaid';

    const amountPaid = Number(
        event.amountPaid ??
        event.amount_paid ??
        0
    );

    const totalRevenue = Number(
        event.totalRevenue ??
        event.total_revenue ??
        0
    );

    const balance = Math.max(
        totalRevenue - amountPaid,
        0
    );

    const isDirect =
        event.source === 'direct';

    const displayTitle = isBlock
        ? (
            blockType === 'guest_hold' && event.guestName
                ? event.guestName
                : blockLabels[blockType] || 'Blocage'
        )
        : event.guestName || 'Réservation';

    const handleSave = async () => {
        try {
            setSaving(true);
            setError('');

            if (
                !draft.startDate ||
                !draft.endDate ||
                draft.endDate <= draft.startDate
            ) {
                throw new Error(
                    'Les dates sont invalides.'
                );
            }

            if (isBlock) {
                const blockId =
                    event.blockId ||
                    String(event.id).replace(
                        'block-',
                        ''
                    );

                await updateCalendarBlock(
                    blockId,
                    {
                        blockType: draft.blockType,
                        startDate: draft.startDate,
                        endDate: draft.endDate,
                        guestName:
                            draft.blockType === 'guest_hold'
                                ? draft.guestName
                                : '',
                        guestEmail:
                            draft.blockType === 'guest_hold'
                                ? draft.guestEmail
                                : '',
                        note: draft.guestNote
                    }
                );
            } else {
                if (!draft.guestName.trim()) {
                    throw new Error(
                        'Le nom du client est requis.'
                    );
                }

                await updateBooking(
                    event.id,
                    {
                        guestName: draft.guestName,
                        guestEmail: draft.guestEmail,
                        guestPhone: draft.guestPhone,
                        guestNote: draft.guestNote,
                        startDate: draft.startDate,
                        endDate: draft.endDate
                    }
                );
            }

            onClose();
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleCreatePaymentLink = async () => {
        try {
            setPaymentLinkLoading(true);
            setPaymentLinkError('');
            setPaymentCopied(false);

            const result =
                await PaymentService.createCheckoutLink(
                    event.id
                );

            setPaymentLink(result.url);
        } catch (err) {
            console.error(err);
            setPaymentLinkError(err.message);
        } finally {
            setPaymentLinkLoading(false);
        }
    };

    return createPortal(
        <>
            <div
                onClick={onClose}
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(23,32,30,0.22)',
                    backdropFilter: 'blur(2px)',
                    zIndex: 199
                }}
            />

            <aside
                role="dialog"
                aria-modal="true"
                style={{
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: 'min(460px, 92vw)',
                    background: '#FBFAF7',
                    borderLeft:
                        '1px solid var(--color-border)',
                    boxShadow:
                        '-18px 0 50px rgba(42,35,30,0.12)',
                    zIndex: 200,
                    padding: '1.6rem',
                    overflowY: 'auto'
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '1rem'
                    }}
                >
                    <div>
                        <div
                            style={{
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                color: '#A75B45',
                                marginBottom: '0.5rem'
                            }}
                        >
                            {isBlock
                                ? 'Blocage calendrier'
                                : 'Réservation'}
                        </div>

                        <h2
                            className="section-title"
                            style={{
                                fontSize: '2rem',
                                margin: 0
                            }}
                        >
                            {displayTitle}
                        </h2>

                        <div
                            style={{
                                marginTop: '0.45rem',
                                color: 'var(--color-text-muted)',
                                fontSize: '0.85rem'
                            }}
                        >
                            {sourceLabels[event.source] ||
                                event.source ||
                                'ALTARA'}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Fermer"
                        style={{
                            width: 38,
                            height: 38,
                            borderRadius: '50%',
                            border:
                                '1px solid var(--color-border)',
                            background: '#FFFFFF',
                            cursor: 'pointer'
                        }}
                    >
                        <X size={18} />
                    </button>
                </div>

                {editing ? (
                    <div
                        style={{
                            marginTop: '1.75rem',
                            display: 'grid',
                            gap: '1rem'
                        }}
                    >
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns:
                                    '1fr 1fr',
                                gap: '0.75rem'
                            }}
                        >
                            <div>
                                <label style={labelStyle}>
                                    Début
                                </label>
                                <input
                                    type="date"
                                    value={draft.startDate}
                                    onChange={e =>
                                        setDraft(prev => ({
                                            ...prev,
                                            startDate:
                                                e.target.value
                                        }))
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
                                    value={draft.endDate}
                                    onChange={e =>
                                        setDraft(prev => ({
                                            ...prev,
                                            endDate:
                                                e.target.value
                                        }))
                                    }
                                    style={fieldStyle}
                                />
                            </div>
                        </div>

                        {isBlock ? (
                            <>
                                <div>
                                    <label style={labelStyle}>
                                        Motif
                                    </label>

                                    <select
                                        value={draft.blockType}
                                        onChange={e =>
                                            setDraft(prev => ({
                                                ...prev,
                                                blockType:
                                                    e.target.value
                                            }))
                                        }
                                        style={fieldStyle}
                                    >
                                        <option value="owner">
                                            Usage personnel
                                        </option>
                                        <option value="maintenance">
                                            Maintenance
                                        </option>
                                        <option value="guest_hold">
                                            Option client
                                        </option>
                                        <option value="other">
                                            Autre
                                        </option>
                                    </select>
                                </div>

                                {draft.blockType ===
                                    'guest_hold' && (
                                    <>
                                        <div>
                                            <label style={labelStyle}>
                                                Client
                                            </label>
                                            <input
                                                value={draft.guestName}
                                                onChange={e =>
                                                    setDraft(prev => ({
                                                        ...prev,
                                                        guestName:
                                                            e.target.value
                                                    }))
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
                                                value={draft.guestEmail}
                                                onChange={e =>
                                                    setDraft(prev => ({
                                                        ...prev,
                                                        guestEmail:
                                                            e.target.value
                                                    }))
                                                }
                                                style={fieldStyle}
                                            />
                                        </div>
                                    </>
                                )}
                            </>
                        ) : (
                            <>
                                <div>
                                    <label style={labelStyle}>
                                        Client
                                    </label>
                                    <input
                                        value={draft.guestName}
                                        onChange={e =>
                                            setDraft(prev => ({
                                                ...prev,
                                                guestName:
                                                    e.target.value
                                            }))
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
                                        value={draft.guestEmail}
                                        onChange={e =>
                                            setDraft(prev => ({
                                                ...prev,
                                                guestEmail:
                                                    e.target.value
                                            }))
                                        }
                                        style={fieldStyle}
                                    />
                                </div>

                                <div>
                                    <label style={labelStyle}>
                                        Téléphone
                                    </label>
                                    <input
                                        value={draft.guestPhone}
                                        onChange={e =>
                                            setDraft(prev => ({
                                                ...prev,
                                                guestPhone:
                                                    e.target.value
                                            }))
                                        }
                                        style={fieldStyle}
                                    />
                                </div>
                            </>
                        )}

                        <div>
                            <label style={labelStyle}>
                                Note
                            </label>

                            <textarea
                                rows={4}
                                value={draft.guestNote}
                                onChange={e =>
                                    setDraft(prev => ({
                                        ...prev,
                                        guestNote:
                                            e.target.value
                                    }))
                                }
                                style={{
                                    ...fieldStyle,
                                    resize: 'vertical'
                                }}
                            />
                        </div>

                        {error && (
                            <div
                                style={{
                                    color: '#A75B45',
                                    fontSize: '0.85rem'
                                }}
                            >
                                {error}
                            </div>
                        )}

                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns:
                                    '1fr 1fr',
                                gap: '0.75rem'
                            }}
                        >
                            <button
                                type="button"
                                onClick={() =>
                                    setEditing(false)
                                }
                                style={{
                                    minHeight: 44,
                                    borderRadius:
                                        'var(--radius-md)',
                                    border:
                                        '1px solid var(--color-border)',
                                    background: '#FFFFFF',
                                    cursor: 'pointer'
                                }}
                            >
                                Annuler
                            </button>

                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={saving}
                                className="btn-primary"
                                style={{
                                    justifyContent: 'center'
                                }}
                            >
                                {saving
                                    ? 'Enregistrement…'
                                    : 'Enregistrer'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div
                            style={{
                                marginTop: '1.75rem'
                            }}
                        >
                            <InfoRow
                                icon={CalendarDays}
                                label="Arrivée / début"
                                value={formatDate(event.start)}
                            />

                            <InfoRow
                                icon={CalendarDays}
                                label="Départ / fin"
                                value={formatDate(event.end)}
                            />

                            {isBlock ? (
                                <>
                                    <InfoRow
                                        icon={
                                            blockType === 'maintenance'
                                                ? Wrench
                                                : blockType === 'owner'
                                                    ? Home
                                                    : LockKeyhole
                                        }
                                        label="Motif"
                                        value={
                                            blockLabels[blockType]
                                        }
                                    />

                                    <InfoRow
                                        icon={UserRound}
                                        label="Client"
                                        value={
                                            blockType === 'guest_hold'
                                                ? event.guestName
                                                : null
                                        }
                                    />

                                    <InfoRow
                                        icon={Mail}
                                        label="Email"
                                        value={
                                            event.guestEmail
                                        }
                                    />

                                    <InfoRow
                                        icon={Clock3}
                                        label="Expiration"
                                        value={
                                            event.expiresAt
                                                ? new Date(
                                                    event.expiresAt
                                                ).toLocaleString(
                                                    'fr-CA'
                                                )
                                                : null
                                        }
                                    />

                                    <InfoRow
                                        icon={FileText}
                                        label="Note"
                                        value={event.note}
                                    />
                                </>
                            ) : (
                                <>
                                    <InfoRow
                                        icon={UserRound}
                                        label="Client"
                                        value={event.guestName}
                                    />

                                    <InfoRow
                                        icon={Mail}
                                        label="Email"
                                        value={
                                            event.guestEmail ||
                                            event.guest_email
                                        }
                                    />

                                    <InfoRow
                                        icon={Phone}
                                        label="Téléphone"
                                        value={
                                            event.guestPhone ||
                                            event.guest_phone
                                        }
                                    />

                                    <InfoRow
                                        icon={FileText}
                                        label="Note"
                                        value={
                                            event.guestNote ||
                                            event.guest_note
                                        }
                                    />
                                </>
                            )}
                        </div>

                        {!isBlock && (
                            <div
                                style={{
                                    marginTop: '1.75rem',
                                    padding: '1.25rem',
                                    borderRadius:
                                        'var(--radius-lg)',
                                    border:
                                        '1px solid var(--color-border)',
                                    background: '#FFFFFF'
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.6rem',
                                        marginBottom: '1rem'
                                    }}
                                >
                                    <CreditCard size={18} />
                                    <strong>Paiement</strong>
                                </div>

                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent:
                                            'space-between',
                                        marginBottom: '0.7rem'
                                    }}
                                >
                                    <span>Statut</span>
                                    <strong
                                        style={{
                                            color:
                                                paymentColors[
                                                    paymentStatus
                                                ]
                                        }}
                                    >
                                        {paymentLabels[
                                            paymentStatus
                                        ]}
                                    </strong>
                                </div>

                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent:
                                            'space-between',
                                        marginBottom: '0.7rem'
                                    }}
                                >
                                    <span>Total</span>
                                    <strong>
                                        {formatPrice(totalRevenue)}
                                    </strong>
                                </div>

                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent:
                                            'space-between',
                                        paddingTop: '0.8rem',
                                        borderTop:
                                            '1px solid var(--color-border)'
                                    }}
                                >
                                    <span>Solde</span>
                                    <strong>
                                        {formatPrice(balance)}
                                    </strong>
                                </div>
                            </div>
                        )}

                        <div
                            style={{
                                marginTop: '1.5rem',
                                paddingTop: '1.25rem',
                                borderTop:
                                    '1px solid var(--color-border)'
                            }}
                        >
                            <div
                                style={{
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    letterSpacing: '0.08em',
                                    textTransform: 'uppercase',
                                    color:
                                        'var(--color-text-muted)',
                                    marginBottom: '0.9rem'
                                }}
                            >
                                Actions
                            </div>

                            {isBlock ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setEditing(true)
                                        }
                                        style={{
                                            width: '100%',
                                            minHeight: 46,
                                            borderRadius:
                                                'var(--radius-md)',
                                            border:
                                                '1px solid var(--color-border)',
                                            background: '#FFFFFF',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            marginBottom: '0.75rem'
                                        }}
                                    >
                                        Modifier le blocage
                                    </button>

                                    <button
                                        type="button"
                                        onClick={async () => {
                                            const blockId =
                                                event.blockId ||
                                                String(
                                                    event.id
                                                ).replace(
                                                    'block-',
                                                    ''
                                                );

                                            if (
                                                !window.confirm(
                                                    'Libérer cette période ?'
                                                )
                                            ) {
                                                return;
                                            }

                                            await deleteCalendarBlock(
                                                blockId
                                            );

                                            onClose();
                                        }}
                                        style={{
                                            width: '100%',
                                            minHeight: 44,
                                            border: 0,
                                            background:
                                                'transparent',
                                            color: '#A75B45',
                                            fontWeight: 600,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Libérer les dates
                                    </button>
                                </>
                            ) : isDirect ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setEditing(true)
                                        }
                                        style={{
                                            width: '100%',
                                            minHeight: 46,
                                            borderRadius:
                                                'var(--radius-md)',
                                            border:
                                                '1px solid var(--color-border)',
                                            background: '#FFFFFF',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            marginBottom: '0.75rem'
                                        }}
                                    >
                                        Modifier la réservation
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleCreatePaymentLink}
                                        disabled={
                                            paymentLinkLoading ||
                                            paymentStatus === 'paid'
                                        }
                                        style={{
                                            width: '100%',
                                            minHeight: 46,
                                            border: 0,
                                            borderRadius:
                                                'var(--radius-md)',
                                            background: '#A89A8E',
                                            color: '#FFFFFF',
                                            fontWeight: 600,
                                            cursor:
                                                paymentLinkLoading
                                                    ? 'wait'
                                                    : 'pointer',
                                            marginBottom: '0.8rem'
                                        }}
                                    >
                                        {paymentLinkLoading
                                            ? 'Création du lien…'
                                            : paymentStatus === 'paid'
                                                ? 'Paiement reçu'
                                                : 'Générer le lien de paiement'}
                                    </button>

                                    {paymentLink && (
                                        <div
                                            style={{
                                                padding: '0.9rem',
                                                marginBottom: '1rem',
                                                border:
                                                    '1px solid var(--color-border)',
                                                borderRadius:
                                                    'var(--radius-md)',
                                                background: '#F4EFE6'
                                            }}
                                        >
                                            <div
                                                style={{
                                                    fontSize: '0.75rem',
                                                    color:
                                                        'var(--color-text-muted)',
                                                    marginBottom: '0.5rem'
                                                }}
                                            >
                                                Lien sécurisé pour le client
                                            </div>

                                            <input
                                                readOnly
                                                value={paymentLink}
                                                onFocus={e =>
                                                    e.target.select()
                                                }
                                                style={{
                                                    width: '100%',
                                                    padding: '0.55rem',
                                                    border:
                                                        '1px solid var(--color-border)',
                                                    borderRadius: '6px',
                                                    background: '#FFFFFF',
                                                    fontSize: '0.72rem',
                                                    marginBottom: '0.6rem'
                                                }}
                                            />

                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    await navigator.clipboard
                                                        .writeText(
                                                            paymentLink
                                                        );

                                                    setPaymentCopied(true);
                                                }}
                                                style={{
                                                    width: '100%',
                                                    minHeight: 38,
                                                    border:
                                                        '1px solid var(--color-border)',
                                                    borderRadius:
                                                        'var(--radius-md)',
                                                    background: '#FFFFFF',
                                                    cursor: 'pointer',
                                                    fontWeight: 600
                                                }}
                                            >
                                                {paymentCopied
                                                    ? '✓ Lien copié'
                                                    : 'Copier le lien'}
                                            </button>
                                        </div>
                                    )}

                                    {paymentLinkError && (
                                        <div
                                            style={{
                                                color: '#A75B45',
                                                fontSize: '0.78rem',
                                                marginBottom: '1rem'
                                            }}
                                        >
                                            {paymentLinkError}
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={async () => {
                                            if (
                                                !window.confirm(
                                                    'Annuler cette réservation ?'
                                                )
                                            ) {
                                                return;
                                            }

                                            await cancelBooking(
                                                event.id
                                            );

                                            onClose();
                                        }}
                                        style={{
                                            width: '100%',
                                            minHeight: 44,
                                            border: 0,
                                            background:
                                                'transparent',
                                            color: '#A75B45',
                                            fontWeight: 600,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Annuler la réservation
                                    </button>
                                </>
                            ) : (
                                <div
                                    style={{
                                        padding: '1rem',
                                        borderRadius:
                                            'var(--radius-md)',
                                        background: '#F4EFE6',
                                        color:
                                            'var(--color-text-muted)',
                                        fontSize: '0.82rem',
                                        lineHeight: 1.5
                                    }}
                                >
                                    Cette réservation provient
                                    d’une plateforme externe.
                                    Elle doit être gérée sur la
                                    plateforme concernée.
                                </div>
                            )}
                        </div>
                    </>
                )}
            </aside>
        </>,
        document.body
    );
};

export default CalendarEventDrawer;
