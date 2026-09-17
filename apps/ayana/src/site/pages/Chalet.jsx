import React from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';

const Chalet = () => {
    const navigate = useNavigate();

    return (
        <div style={{ backgroundColor: 'var(--ayana-bg)', minHeight: '100vh', paddingTop: '120px' }}>
            <SEO 
                title="Chalet de Luxe Laurentides | AYANA — Location Haut de Gamme"
                description="Bois naturel, lignes épurées, lumière maîtrisée. Chaque espace a été pensé pour créer une sensation immédiate d’apaisement."
                urlExt="/chalet"
            />
            
            <div className="ayana-container">
                <div className="ayana-animate" style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 8rem' }}>
                    <h1 style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', fontFamily: 'var(--ayana-font-heading)', marginBottom: '3rem', fontWeight: 300, color: 'var(--ayana-text)', lineHeight: 1.1, textTransform: 'uppercase', letterSpacing: '2px' }}>
                        Un refuge conçu pour ralentir
                    </h1>
                    <p style={{ color: 'var(--ayana-muted)', fontSize: '1.4rem', lineHeight: 1.8, fontWeight: 300 }}>
                        Bois naturel, lignes épurées, lumière maîtrisée. Chaque espace a été pensé pour créer une sensation immédiate d’apaisement.
                    </p>
                </div>

                <section style={{ margin: '8rem 0' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '6rem' }}>
                        <div className="ayana-animate ayana-delay-1" style={{ aspectRatio: '4/5', overflow: 'hidden', borderRadius: '4px' }}>
                            <img src="/ayana/photos/v2/japandi-salon.jpg" alt="Salon au design minimaliste" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div className="ayana-animate ayana-delay-2" style={{ aspectRatio: '4/5', overflow: 'hidden', borderRadius: '4px', transform: 'translateY(4rem)' }}>
                            <img src="/ayana/photos/v2/japandi-chambre.jpg" alt="Chambre confortable et lumineuse" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                    </div>
                </section>

                <section style={{ margin: '12rem 0', backgroundColor: 'var(--ayana-surface)', padding: '8rem 2rem', textAlign: 'center' }}>
                    <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontFamily: 'var(--ayana-font-heading)', marginBottom: '5rem', fontWeight: 300 }}>L'approche de l'espace</h2>
                    
                    <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '4rem', maxWidth: '1000px', margin: '0 auto', fontSize: '1.2rem', color: 'var(--ayana-text)', fontWeight: 300 }}>
                        <li style={{ padding: '2rem', borderBottom: '1px solid var(--ayana-border)' }}>
                            <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--ayana-accent)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1rem' }}>01.</span>
                            Cuisine entièrement équipée
                        </li>
                        <li style={{ padding: '2rem', borderBottom: '1px solid var(--ayana-border)' }}>
                            <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--ayana-accent)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1rem' }}>02.</span>
                            Literie haut de gamme
                        </li>
                        <li style={{ padding: '2rem', borderBottom: '1px solid var(--ayana-border)' }}>
                            <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--ayana-accent)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1rem' }}>03.</span>
                            Espaces de détente intérieurs et extérieurs
                        </li>
                        <li style={{ padding: '2rem', borderBottom: '1px solid var(--ayana-border)' }}>
                            <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--ayana-accent)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1rem' }}>04.</span>
                            Environnement privé en pleine nature
                        </li>
                    </ul>
                </section>

                <div style={{ textAlign: 'center', margin: '10rem 0' }}>
                    <button onClick={() => navigate('/reservation')} className="ayana-btn" style={{ padding: '1.2rem 4rem', fontSize: '1.1rem' }}>
                        Voir les disponibilités
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chalet;
