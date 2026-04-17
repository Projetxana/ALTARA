import React from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';

const Location = () => {
    const navigate = useNavigate();

    return (
        <div style={{ backgroundColor: 'var(--ayana-bg)', minHeight: '100vh', paddingTop: '120px' }}>
            <SEO 
                title="Chalet Laurentides Saint-Adèle | Nature & Activités — AYANA"
                description="Situé à Saint-Adèle, au cœur des Laurentides, AYANA offre un accès privilégié à une nature riche et apaisante."
                urlExt="/localisation"
            />
            
            <div className="ayana-container">
                <div className="ayana-animate" style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 8rem' }}>
                    <h1 style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', fontFamily: 'var(--ayana-font-heading)', marginBottom: '3rem', fontWeight: 300, color: 'var(--ayana-text)', lineHeight: 1.1, textTransform: 'uppercase', letterSpacing: '2px' }}>
                        La nature comme seul horizon
                    </h1>
                    <p style={{ color: 'var(--ayana-muted)', fontSize: '1.4rem', lineHeight: 1.8, fontWeight: 300 }}>
                        Situé à Saint-Adèle, au cœur des Laurentides, AYANA offre un accès privilégié à une nature riche et apaisante. Été comme hiver, la région invite à ralentir et à explorer.
                    </p>
                </div>

                <section style={{ margin: '8rem 0' }}>
                    <div className="ayana-animate" style={{ aspectRatio: '21/9', overflow: 'hidden', borderRadius: '4px' }}>
                        <img src="/ayana/photos/v2/ayana-chalet-spa-laurentides.jpg" alt="La beauté sauvage des Laurentides" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                </section>

                <section style={{ margin: '12rem 0', backgroundColor: 'var(--ayana-surface)', padding: '8rem 2rem', textAlign: 'center' }}>
                    <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontFamily: 'var(--ayana-font-heading)', marginBottom: '5rem', fontWeight: 300 }}>Découvrez la région</h2>
                    
                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '3rem', maxWidth: '1000px', margin: '0 auto', fontSize: '1.2rem', color: 'var(--ayana-text)', fontWeight: 300 }}>
                        <li style={{ padding: '1rem 3rem', border: '1px solid var(--ayana-border)', borderRadius: '100px' }}>Ski</li>
                        <li style={{ padding: '1rem 3rem', border: '1px solid var(--ayana-border)', borderRadius: '100px' }}>Randonnée</li>
                        <li style={{ padding: '1rem 3rem', border: '1px solid var(--ayana-border)', borderRadius: '100px' }}>Gastronomie</li>
                        <li style={{ padding: '1rem 3rem', border: '1px solid var(--ayana-border)', borderRadius: '100px' }}>Spas</li>
                        <li style={{ padding: '1rem 3rem', border: '1px solid var(--ayana-border)', borderRadius: '100px' }}>Lacs</li>
                    </ul>
                </section>

                <section style={{ margin: '10rem 0' }}>
                    <div style={{ width: '100%', height: '600px', borderRadius: '4px', overflow: 'hidden' }}>
                        <iframe
                            title="Localisation Chalet Ayana"
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d177309.7319985223!2d-74.34148419614441!3d46.035417435850935!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4ccf7cb9344c2115%3A0xe5fcff2ce9c09930!2sLaurentides%2C%20QC!5e0!3m2!1sfr!2sca!4v1700000000000!5m2!1sfr!2sca"
                            width="100%" height="100%" style={{ border: 0, filter: 'grayscale(100%) opacity(0.8)' }} allowFullScreen="" loading="lazy">
                        </iframe>
                    </div>
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

export default Location;
