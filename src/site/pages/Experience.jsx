import React from 'react';
import { Link } from 'react-router-dom';

const Experience = () => {
    return (
        <div style={{ paddingTop: '80px', minHeight: '100vh', backgroundColor: 'var(--color-bg-main)' }}>
            {/* Header */}
            <div style={{ padding: '6rem 2rem', textAlign: 'center', backgroundColor: 'var(--color-bg-card)', borderBottom: '1px solid var(--color-border)' }}>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '3.5rem', marginBottom: '1rem' }}>L'Expérience Ayana</h1>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
                    Rechargez vos batteries. Reposez votre esprit. Reconnectez-vous à la nature.
                </p>
            </div>

            {/* Thermal Experience */}
            <section style={{ padding: '6rem 2rem' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4rem' }}>
                    <div style={{ flex: '1 1 400px' }}>
                        <img src="/ayana/photos/spa.jpg" alt="Spa et Hammam" style={{ width: '100%', borderRadius: '12px', boxShadow: 'var(--shadow-lg)' }} />
                    </div>
                    <div style={{ flex: '1 1 400px' }}>
                        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', marginBottom: '1.5rem' }}>Parcours Thermal Privé</h2>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <li style={listItemStyle}><strong>Sauna Sec :</strong> Chaleur enveloppante pour détoxifier le corps.</li>
                            <li style={listItemStyle}><strong>Hammam :</strong> Vapeur douce à l'eucalyptus pour les voies respiratoires.</li>
                            <li style={listItemStyle}><strong>Bain Froid :</strong> Immersion vivifiante (Cold Plunge) pour relancer la circulation.</li>
                            <li style={listItemStyle}><strong>Jacuzzi :</strong> Détente ultime sous les étoiles.</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Living Experience */}
            <section style={{ padding: '6rem 2rem', backgroundColor: 'var(--color-bg-card)' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap-reverse', alignItems: 'center', gap: '4rem' }}>
                    <div style={{ flex: '1 1 400px' }}>
                        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', marginBottom: '1.5rem' }}>Vivre au Chalet</h2>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', marginBottom: '1.5rem', lineHeight: 1.8 }}>
                            Le Chalet Ayana dispose d'une cuisine entièrement équipée haut de gamme, pensée pour les moments de convivialité. Le grand salon baigné de lumière naturelle est axé autour d'un foyer central qui réchauffe les soirées d'hiver.
                        </p>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', lineHeight: 1.8 }}>
                            Nos chambres offrent une literie premium pour des nuits réparatrices. Chaque espace de nuit est conçu comme un cocon privé, isolé et apaisant.
                        </p>
                    </div>
                    <div style={{ flex: '1 1 400px' }}>
                        <img src="/ayana/photos/living.jpg" alt="Salon" style={{ width: '100%', borderRadius: '12px', boxShadow: 'var(--shadow-lg)' }} />
                    </div>
                </div>
            </section>

            <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
                <Link to="/gallery" className="btn-primary" style={{ textDecoration: 'none', background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-main)' }}>
                    Voir la Galerie
                </Link>
                <Link to="/book" className="btn-primary" style={{ textDecoration: 'none', marginLeft: '1rem' }}>
                    Réserver
                </Link>
            </div>
        </div>
    );
};

const listItemStyle = {
    padding: '1rem',
    backgroundColor: 'var(--color-bg-main)',
    border: '1px solid var(--color-border)',
    borderRadius: '8px',
    color: 'var(--color-text-muted)',
    fontSize: '1.1rem'
};

export default Experience;
