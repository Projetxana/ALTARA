import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const Thanks = () => {
    const [searchParams] = useSearchParams();
    const id = searchParams.get('bookingId');

    return (
        <div style={{ paddingTop: '80px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg-main)', padding: '2rem' }}>
            <div className="glass-panel" style={{ padding: '4rem 3rem', borderRadius: '24px', textAlign: 'center', maxWidth: '600px', width: '100%' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🌿</div>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '3rem', marginBottom: '1rem', color: '#10b981' }}>Demande Envoyée</h1>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '1.2rem', marginBottom: '2rem', lineHeight: 1.8 }}>
                    Merci pour votre demande de réservation. Nous traiterons votre dossier dans les plus brefs délais et vous enverrons un e-mail de confirmation.
                </p>
                {id && (
                    <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', marginBottom: '3rem', fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>
                        Réf : {id.split('-')[0].toUpperCase()}
                    </div>
                )}

                <Link to="/ayana" className="btn-primary" style={{ textDecoration: 'none', padding: '1rem 3rem' }}>
                    Retour à l'accueil
                </Link>
            </div>
        </div>
    );
};

export default Thanks;
