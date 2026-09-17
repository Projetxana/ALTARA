import { altaraApi } from '../../config/appRuntime.js';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Check,
    CalendarDays,
    Mail,
    ReceiptText
} from 'lucide-react';

import './PaymentSuccessPage.css';

const formatDate = (value) => {
    if (!value) return '—';

    return new Date(`${value}T00:00:00Z`)
        .toLocaleDateString('fr-CA', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            timeZone: 'UTC'
        });
};

const formatMoney = (value, currency = 'CAD') =>
    new Intl.NumberFormat('fr-CA', {
        style: 'currency',
        currency
    }).format(Number(value || 0));

export default function PaymentSuccessPage() {
    const [searchParams] = useSearchParams();

    const sessionId =
        searchParams.get('session_id');

    const [summary, setSummary] =
        useState(null);

    const [status, setStatus] =
        useState('loading');

    const [error, setError] =
        useState('');

    useEffect(() => {
        if (!sessionId) {
            setStatus('error');
            setError(
                'La référence du paiement est manquante.'
            );
            return;
        }

        let cancelled = false;

        const loadSummary = async () => {
            try {
                const response = await fetch(
                    altaraApi(
                        `/api/payments/create-checkout-session?session_id=${encodeURIComponent(sessionId)}`
                    )
                );

                const data = await response.json();

                if (cancelled) return;

                if (
                    response.status === 202 &&
                    data.status === 'processing'
                ) {
                    setStatus('processing');

                    setTimeout(() => {
                        if (!cancelled) {
                            loadSummary();
                        }
                    }, 1500);

                    return;
                }

                if (!response.ok || !data.success) {
                    throw new Error(
                        data.error ||
                        'Impossible de confirmer le paiement.'
                    );
                }

                setSummary(data);
                setStatus('success');
            } catch (err) {
                if (cancelled) return;

                setError(err.message);
                setStatus('error');
            }
        };

        loadSummary();

        return () => {
            cancelled = true;
        };
    }, [sessionId]);

    if (
        status === 'loading' ||
        status === 'processing'
    ) {
        return (
            <main className="payment-confirmation-page">
                <div className="payment-confirmation-loading">
                    <div className="payment-confirmation-spinner" />

                    <p>
                        {status === 'processing'
                            ? 'Nous finalisons la confirmation de votre paiement…'
                            : 'Nous préparons votre confirmation…'}
                    </p>
                </div>
            </main>
        );
    }

    if (status === 'error') {
        return (
            <main className="payment-confirmation-page">
                <section className="payment-confirmation-shell">
                    <div className="payment-confirmation-error">
                        <h1>
                            Confirmation indisponible
                        </h1>

                        <p>{error}</p>

                        <p>
                            Si votre paiement a été accepté,
                            votre réservation reste enregistrée.
                        </p>
                    </div>
                </section>
            </main>
        );
    }

    const {
        property,
        booking,
        arrivalInfoLeadDays
    } = summary;

    return (
        <main className="payment-confirmation-page">
            <section className="payment-confirmation-shell">

                <header className="payment-confirmation-hero">
                    <div className="payment-confirmation-check">
                        <Check size={32} strokeWidth={2.2} />
                    </div>

                    <div className="payment-confirmation-eyebrow">
                        Paiement confirmé
                    </div>

                    <h1>
                        Merci, votre séjour est réservé.
                    </h1>

                    <p>
                        Votre réservation pour{' '}
                        <strong>{property.name}</strong>{' '}
                        est maintenant confirmée.
                    </p>
                </header>

                <section className="payment-summary-card">

                    <div className="payment-summary-property">
                        <span>
                            Votre réservation
                        </span>

                        <h2>
                            {property.name}
                        </h2>
                    </div>

                    <div className="payment-summary-dates">
                        <div>
                            <span>Arrivée</span>
                            <strong>
                                {formatDate(
                                    booking.checkIn
                                )}
                            </strong>
                        </div>

                        <div>
                            <span>Départ</span>
                            <strong>
                                {formatDate(
                                    booking.checkOut
                                )}
                            </strong>
                        </div>

                        <div>
                            <span>Durée</span>
                            <strong>
                                {booking.nights}{' '}
                                {booking.nights > 1
                                    ? 'nuits'
                                    : 'nuit'}
                            </strong>
                        </div>
                    </div>

                    <div className="payment-summary-guest">
                        <span>Voyageur</span>
                        <strong>
                            {booking.guestName || '—'}
                        </strong>
                    </div>

                    <div className="payment-summary-financial">
                        <div>
                            <span>Montant payé</span>
                            <strong>
                                {formatMoney(
                                    booking.amountPaid,
                                    booking.currency
                                )}
                            </strong>
                        </div>

                        <div>
                            <span>Solde</span>
                            <strong>
                                {formatMoney(
                                    booking.balance,
                                    booking.currency
                                )}
                            </strong>
                        </div>
                    </div>

                    <div className="payment-paid-pill">
                        <Check size={16} />
                        Paiement reçu
                    </div>

                </section>

                <section className="payment-next-section">
                    <div className="payment-section-heading">
                        <span>Et maintenant ?</span>
                        <h2>
                            Nous nous occupons de la suite.
                        </h2>
                    </div>

                    <div className="payment-timeline">

                        <div className="payment-timeline-item completed">
                            <div className="payment-timeline-icon">
                                <Check size={17} />
                            </div>

                            <div>
                                <strong>
                                    Réservation confirmée
                                </strong>
                                <p>
                                    Votre séjour est maintenant
                                    enregistré.
                                </p>
                            </div>
                        </div>

                        <div className="payment-timeline-item completed">
                            <div className="payment-timeline-icon">
                                <Check size={17} />
                            </div>

                            <div>
                                <strong>
                                    Paiement reçu
                                </strong>
                                <p>
                                    Votre paiement a été
                                    confirmé avec succès.
                                </p>
                            </div>
                        </div>

                        <div className="payment-timeline-item">
                            <div className="payment-timeline-icon">
                                <Mail size={17} />
                            </div>

                            <div>
                                <strong>
                                    Confirmation et facture
                                </strong>

                                <p>
                                    Vous recevrez votre
                                    récapitulatif et votre facture
                                    par courriel
                                    {booking.guestEmail
                                        ? ` à ${booking.guestEmail}`
                                        : ''}.
                                </p>
                            </div>
                        </div>

                        <div className="payment-timeline-item">
                            <div className="payment-timeline-icon">
                                <CalendarDays size={17} />
                            </div>

                            <div>
                                <strong>
                                    Préparez votre arrivée
                                </strong>

                                <p>
                                    Environ{' '}
                                    {arrivalInfoLeadDays} jours
                                    avant votre séjour, vous
                                    recevrez les informations
                                    nécessaires à votre arrivée et
                                    les détails pratiques de votre
                                    réservation.
                                </p>
                            </div>
                        </div>

                    </div>
                </section>

                <section className="payment-invoice-note">
                    <ReceiptText size={22} />

                    <div>
                        <strong>
                            Votre facture
                        </strong>

                        <p>
                            Elle vous sera transmise par courriel.
                            Vous pourrez ainsi la conserver avec
                            votre confirmation de réservation.
                        </p>
                    </div>
                </section>

                <footer className="payment-confirmation-footer">
                    <p>
                        Merci d’avoir choisi{' '}
                        <strong>{property.name}</strong>.
                    </p>

                    <span>
                        Nous avons hâte de vous accueillir et
                        vous souhaitons déjà un excellent séjour.
                    </span>
                </footer>

            </section>
        </main>
    );
}
