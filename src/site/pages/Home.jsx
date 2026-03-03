import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div>
            {/* Hero Section */}
            <section style={{ height: '100vh', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                    <img src="/ayana/photos/hero.jpg" alt="Chalet Ayana Extérieur" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6))' }}></div>
                </div>
                <div style={{ position: 'relative', zIndex: 10, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 2rem' }}>
                    <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(3rem, 8vw, 6rem)', color: '#fff', marginBottom: '1rem', textShadow: '0 4px 20px rgba(0,0,0,0.3)', fontWeight: 400 }}>
                        L'Évasion Absolue
                    </h1>
                    <p style={{ color: '#f8fafc', fontSize: 'clamp(1rem, 2vw, 1.25rem)', maxWidth: '600px', marginBottom: '2.5rem', textShadow: '0 2px 10px rgba(0,0,0,0.5)', opacity: 0.9 }}>
                        Découvrez le Chalet Ayana. Une architecture minimaliste, un confort sans compromis, une immersion totale dans la nature.
                    </p>
                    <Link to="/ayana/book" className="btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', textDecoration: 'none' }}>
                        Réserver votre séjour
                    </Link>
                </div>
            </section>

            {/* Intro Section */}
            <section style={{ padding: '8rem 2rem', backgroundColor: 'var(--color-bg-main)' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '2rem', fontFamily: 'var(--font-heading)' }}>Un Refuge d'Exception</h2>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '1.2rem', lineHeight: 1.8 }}>
                        Ayana n'est pas qu'un chalet, c'est une expérience. Conçu pour ceux qui cherchent à se reconnecter avec l'essentiel, chaque détail a été pensé pour offrir luxe, calme et volupté. Profitez de nos installations thermales privées comprenant spa, sauna et bain froid, face à une nature préservée.
                    </p>
                </div>
            </section>

            {/* Highlights Grid */}
            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                <div style={{ position: 'relative', height: '500px' }}>
                    <img src="/ayana/photos/spa.jpg" alt="Spa" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '3rem 2rem', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
                        <h3 style={{ color: '#fff', fontSize: '2rem', fontFamily: 'var(--font-heading)', marginBottom: '0.5rem' }}>Espace Thermal</h3>
                        <p style={{ color: 'rgba(255,255,255,0.8)' }}>Sauna, Hammam & Spa privé</p>
                    </div>
                </div>
                <div style={{ position: 'relative', height: '500px' }}>
                    <img src="/ayana/photos/living.jpg" alt="Salon" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '3rem 2rem', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
                        <h3 style={{ color: '#fff', fontSize: '2rem', fontFamily: 'var(--font-heading)', marginBottom: '0.5rem' }}>Design Épuré</h3>
                        <p style={{ color: 'rgba(255,255,255,0.8)' }}>Des espaces de vie pensés pour la sérénité</p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section style={{ padding: '8rem 2rem', textAlign: 'center', backgroundColor: 'var(--color-bg-card)' }}>
                <h2 style={{ fontSize: '3rem', fontFamily: 'var(--font-heading)', marginBottom: '1.5rem' }}>Prêt pour l'expérience ?</h2>
                <Link to="/ayana/book" className="btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.1rem', display: 'inline-block', textDecoration: 'none' }}>Vérifier les disponibilités</Link>
            </section>
        </div>
    );
};

export default Home;
