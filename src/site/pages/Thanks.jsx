import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const Thanks = () => {
    const [searchParams] = useSearchParams();
    const id = searchParams.get('bookingId');

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--ayana-bg)', padding: '6rem 2rem' }}>
            <div className="ayana-card ayana-animate" style={{ textAlign: 'center', maxWidth: '600px', width: '100%', padding: '5rem 4rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1.5rem', opacity: 0.8 }}>🌿</div>
                <h1 style={{ fontFamily: 'var(--ayana-font-heading)', fontSize: '2.5rem', marginBottom: '1.5rem', color: 'var(--ayana-text)', fontWeight: 400 }}>Demande Envoyée</h1>
                <p style={{ color: 'var(--ayana-muted)', fontSize: '1.1rem', marginBottom: '2.5rem', lineHeight: 1.8 }}>
                    Merci pour votre intérêt envers le Chalet Ayana. Notre équipe vient de recevoir votre demande et traitera votre dossier dans les plus brefs délais pour confirmer vos dates.
                </p>
                {id && (
                    <div style={{ backgroundColor: 'var(--ayana-bg)', border: '1px solid var(--ayana-border)', padding: '1.5rem', borderRadius: '8px', marginBottom: '3rem' }}>
                        <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--ayana-muted)', display: 'block', marginBottom: '0.5rem' }}>Identifiant de suivi</span>
                        <span style={{ fontFamily: 'var(--ayana-font-body)', fontWeight: 600, color: 'var(--ayana-text)', letterSpacing: '2px', fontSize: '1.2rem' }}>{id.split('-')[0].toUpperCase()}</span>
                    </div>
                )}

                <Link to="/ayana" className="ayana-btn" style={{ padding: '1rem 3rem' }}>
                    Retourner à l'accueil
                </Link>
            </div>
        </div>
    );
};

export default Thanks;
