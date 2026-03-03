import React from 'react';
import { Link } from 'react-router-dom';

const Experience = () => {
    return (
        <div style={{ backgroundColor: 'var(--ayana-bg)' }}>
            {/* Header */}
            <div style={{ padding: '10rem 2rem 6rem', textAlign: 'center', backgroundColor: 'var(--ayana-surface)', borderBottom: '1px solid var(--ayana-border)' }}>
                <h1 className="ayana-animate" style={{ fontFamily: 'var(--ayana-font-heading)', fontSize: 'clamp(3rem, 5vw, 4.5rem)', marginBottom: '1.5rem', fontWeight: 300, color: 'var(--ayana-text)' }}>L'Expérience Thermale</h1>
                <p className="ayana-animate ayana-delay-1" style={{ color: 'var(--ayana-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.8 }}>
                    Rechargez vos batteries. Reposez votre esprit. Reconnectez-vous à la nature au travers de nos installations privées.
                </p>
            </div>

            {/* Thermal Experience */}
            <section style={{ padding: '8rem 2rem' }}>
                <div className="ayana-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', alignItems: 'center', gap: '6rem' }}>
                    <div className="ayana-animate ayana-delay-2" style={{ position: 'relative', borderRadius: 'var(--ayana-radius-lg)', overflow: 'hidden', aspectRatio: '4/5' }}>
                        <img src="/ayana/photos/hammam.jpg" alt="Hammam et Spa" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div className="ayana-animate ayana-delay-3">
                        <h2 style={{ fontFamily: 'var(--ayana-font-heading)', fontSize: '2.5rem', marginBottom: '2rem', color: 'var(--ayana-text)', fontWeight: 400 }}>Le Cycle du Chaud et du Froid</h2>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <li style={listItemStyle}>
                                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🔥</div>
                                <strong style={{ display: 'block', fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--ayana-text)' }}>Chaleur Enveloppante</strong>
                                Alterner entre la chaleur sèche du sauna vitré face à la forêt et la vapeur purifiante à l'eucalyptus du hammam.
                            </li>
                            <li style={listItemStyle}>
                                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>❄️</div>
                                <strong style={{ display: 'block', fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--ayana-text)' }}>Choc Thermique</strong>
                                L'immersion rapide dans le bassin d'eau froide resserre les pores et relance activement la circulation sanguine.
                            </li>
                            <li style={listItemStyle}>
                                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🌿</div>
                                <strong style={{ display: 'block', fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--ayana-text)' }}>Relaxation Ultime</strong>
                                Terminer le cycle dans le jacuzzi chauffé sous les étoiles, pour un profond relâchement musculaire et nerveux.
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Living Experience */}
            <section style={{ padding: '8rem 2rem', backgroundColor: 'var(--ayana-surface)' }}>
                <div className="ayana-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', alignItems: 'center', gap: '6rem' }}>
                    <div>
                        <h2 style={{ fontFamily: 'var(--ayana-font-heading)', fontSize: '2.5rem', marginBottom: '2rem', color: 'var(--ayana-text)', fontWeight: 400 }}>L'Art de Vivre au Chalet</h2>
                        <p style={{ color: 'var(--ayana-muted)', fontSize: '1.1rem', marginBottom: '1.5rem', lineHeight: 1.8 }}>
                            Au-delà du spa, Ayana propose une cuisine de chef entièrement équipée, pensée pour que la préparation des repas devienne un moment de pleine conscience et de convivialité.
                        </p>
                        <p style={{ color: 'var(--ayana-muted)', fontSize: '1.1rem', lineHeight: 1.8 }}>
                            Le grand salon lumineux, tourné vers le foyer central et les immenses baies vitrées, vous invite à la lecture et à la déconnexion totale. Nos chambres sont des cocons isolés, dotés de literie premium.
                        </p>
                    </div>
                    <div style={{ position: 'relative', borderRadius: 'var(--ayana-radius-lg)', overflow: 'hidden', aspectRatio: '4/5' }}>
                        <img src="/ayana/photos/living.jpg" alt="Salon" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                </div>
            </section>

            <div style={{ textAlign: 'center', padding: '8rem 2rem' }}>
                <Link to="/ayana/gallery" className="ayana-btn-outline" style={{ display: 'inline-block', marginRight: '1rem', padding: '1rem 3rem' }}>
                    Découvrir les lieux
                </Link>
                <Link to="/ayana/book" className="ayana-btn" style={{ display: 'inline-block', padding: '1rem 3rem' }}>
                    Vérifier les disponibilités
                </Link>
            </div>
        </div>
    );
};

const listItemStyle = {
    color: 'var(--ayana-muted)',
    fontSize: '1.05rem',
    lineHeight: 1.6,
    borderLeft: '2px solid var(--ayana-border)',
    paddingLeft: '1.5rem'
};

export default Experience;
