import React from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';

const Wellness = () => {
    const navigate = useNavigate();

    return (
        <div style={{ backgroundColor: 'var(--ayana-bg)', minHeight: '100vh', paddingTop: '120px' }}>
            <SEO 
                title="Spa Privé Laurentides | Sauna, Hammam, Jacuzzi — AYANA"
                description="Le parcours bien-être AYANA s’inspire des rituels nordiques et japonais. Une alternance de chaleur, de froid et de repos pour relâcher les tensions en profondeur."
                urlExt="/bien-etre"
            />
            
            <div className="ayana-container">
                <div className="ayana-animate" style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 8rem' }}>
                    <h1 style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', fontFamily: 'var(--ayana-font-heading)', marginBottom: '3rem', fontWeight: 300, color: 'var(--ayana-text)', lineHeight: 1.1, textTransform: 'uppercase', letterSpacing: '2px' }}>
                        Un rituel de reconnexion profonde
                    </h1>
                    <p style={{ color: 'var(--ayana-muted)', fontSize: '1.4rem', lineHeight: 1.8, fontWeight: 300 }}>
                        Le parcours bien-être AYANA s’inspire des rituels nordiques et japonais.<br/>Une alternance de chaleur, de froid et de repos pour relâcher les tensions en profondeur.
                    </p>
                </div>

                {/* Section 1 */}
                <section style={{ margin: '10rem 0' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '6rem', alignItems: 'center' }}>
                        <div className="ayana-animate" style={{ aspectRatio: '4/3', overflow: 'hidden', borderRadius: '4px' }}>
                            <img src="/ayana/photos/v2/sauna-hammam-chalet-luxe.jpg" alt="Chalet spa AYANA dans les Laurentides avec jacuzzi extérieur" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div className="ayana-animate ayana-delay-1" style={{ padding: '2rem' }}>
                            <h2 style={{ fontSize: '2.5rem', fontFamily: 'var(--ayana-font-heading)', marginBottom: '2rem', fontWeight: 300, color: 'var(--ayana-text)' }}>Chaleur Enveloppante</h2>
                            <p style={{ fontSize: '1.2rem', lineHeight: 1.8, color: 'var(--ayana-muted)', fontWeight: 300 }}>
                                Sauna sec et hammam diffusent une chaleur douce et profonde, favorisant la détente musculaire et mentale.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Section 2 */}
                <section style={{ margin: '10rem 0' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '6rem', alignItems: 'center', flexDirection: 'row-reverse' }}>
                         <div className="ayana-animate" style={{ padding: '2rem', order: 1 }}>
                            <h2 style={{ fontSize: '2.5rem', fontFamily: 'var(--ayana-font-heading)', marginBottom: '2rem', fontWeight: 300, color: 'var(--ayana-text)' }}>Nature Sauvage</h2>
                            <p style={{ fontSize: '1.2rem', lineHeight: 1.8, color: 'var(--ayana-muted)', fontWeight: 300 }}>
                                Le jacuzzi extérieur, entouré de nature, prolonge la sensation de lâcher-prise.
                            </p>
                        </div>
                        <div className="ayana-animate ayana-delay-1" style={{ aspectRatio: '4/3', overflow: 'hidden', borderRadius: '4px', order: 2 }}>
                            <img src="/ayana/photos/v2/spa-prive-jacuzzi-laurentides.jpg" alt="Chalet spa AYANA dans les Laurentides avec jacuzzi extérieur" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                    </div>
                </section>

                {/* Section 3 */}
                <section style={{ margin: '10rem 0' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '6rem', alignItems: 'center' }}>
                        <div className="ayana-animate" style={{ aspectRatio: '4/3', overflow: 'hidden', borderRadius: '4px' }}>
                            <img src="/ayana/photos/v2/japandi-salon.jpg" alt="Salle de repos lumineuse" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div className="ayana-animate ayana-delay-1" style={{ padding: '2rem' }}>
                            <h2 style={{ fontSize: '2.5rem', fontFamily: 'var(--ayana-font-heading)', marginBottom: '2rem', fontWeight: 300, color: 'var(--ayana-text)' }}>Introspection</h2>
                            <p style={{ fontSize: '1.2rem', lineHeight: 1.8, color: 'var(--ayana-muted)', fontWeight: 300 }}>
                                Une salle de repos baignée de lumière naturelle pour prolonger l’expérience.
                            </p>
                        </div>
                    </div>
                </section>

                <div style={{ textAlign: 'center', margin: '10rem 0' }}>
                    <button onClick={() => navigate('/reservation')} className="ayana-btn" style={{ padding: '1.2rem 4rem', fontSize: '1.1rem' }}>
                        Réserver l’expérience
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Wellness;
