import React, { useState } from 'react';
import Book from './Book';

const Home = () => {
    return (
        <div style={{ backgroundColor: 'var(--ayana-bg)' }}>
            {/* 1. HERO SECTION */}
            <section id="hero" style={{ height: '100vh', position: 'relative', overflow: 'hidden' }}>
                <img src="/ayana/photos/v2/hero.jpg" alt="AYANA Extérieur" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, rgba(31,35,40,0.2), rgba(31,35,40,0.5))' }}></div>

                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 2rem' }}>
                    <div className="ayana-animate" style={{ maxWidth: '800px' }}>
                        <h1 style={{ fontFamily: 'var(--ayana-font-heading)', fontSize: 'clamp(3rem, 7vw, 6rem)', color: '#fff', marginBottom: '1.5rem', fontWeight: 300, lineHeight: 1.1, letterSpacing: '2px', textTransform: 'uppercase' }}>
                            AYANA
                        </h1>
                        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 'clamp(1rem, 2vw, 1.2rem)', marginBottom: '3rem', fontWeight: 300, letterSpacing: '4px', textTransform: 'uppercase' }}>
                            Sanctuaire Thermal • Laurentides
                        </p>
                        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <a href="#lieux" className="ayana-btn-outline" style={{ padding: '1.2rem 3rem', color: '#fff', border: '1px solid rgba(255,255,255,0.5)', textDecoration: 'none', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.85rem' }}>Découvrir</a>
                            <a href="#reserver" className="ayana-btn" style={{ padding: '1.2rem 3rem', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.85rem' }}>Réserver</a>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. LE LIEU (LOCATION / CONCEPT) */}
            <section id="lieux" style={{ padding: '10rem 2rem', backgroundColor: 'var(--ayana-surface)' }}>
                <div className="ayana-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '8rem', alignItems: 'center' }}>
                    <div className="ayana-animate">
                        <SectionSubtitle>L'Essence</SectionSubtitle>
                        <SectionTitle>Retrait en Haute Altitude</SectionTitle>
                        <p style={{ color: 'var(--ayana-muted)', fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '2rem' }}>
                            Niché au sommet, Ayana est un refuge pensé pour l'introspection et la contemplation. L'architecture minimaliste s'efface devant l'immensité de la nature, créant un espace où le temps suspend son vol.
                        </p>
                        <p style={{ color: 'var(--ayana-muted)', fontSize: '1.1rem', lineHeight: 1.8 }}>
                            Le design épuré libère l'esprit. Les matériaux bruts ancrent le corps. Un équilibre parfait entre l'esthétique scandinave et la philosophie japonaise du Wabi-Sabi.
                        </p>
                    </div>
                    <div className="ayana-animate ayana-delay-1" style={{ position: 'relative', overflow: 'hidden', aspectRatio: '4/5' }}>
                        <img src="/ayana/photos/v2/hero.jpg" alt="Extérieur Chalet" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                </div>
            </section>

            {/* 3. L'ESPACE DE VIE & CHAMBRES */}
            <section id="chambres" style={{ padding: '10rem 0', backgroundColor: 'var(--ayana-bg)' }}>
                <div className="ayana-container">
                    <div style={{ textAlign: 'center', marginBottom: '6rem' }} className="ayana-animate">
                        <SectionSubtitle>L'Écrin Intérieur</SectionSubtitle>
                        <SectionTitle>Minimalisme et Chaleur</SectionTitle>
                        <p style={{ color: 'var(--ayana-muted)', maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem', lineHeight: 1.8 }}>
                            Chaque pièce est une composition de lumière et d'ombres, conçue pour inviter au repos profond. Les nuances subtiles et le mobilier sur mesure créent une atmosphère d'élégance silencieuse.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        <MomentCard
                            img="/ayana/photos/v2/chambre-beige.jpg"
                            title="Chambre Beige"
                            desc="Tons sable et textures naturelles pour un réveil en douceur."
                        />
                        <MomentCard
                            img="/ayana/photos/v2/chambre-verte.jpg"
                            title="Chambre Verte"
                            desc="Une immersion visuelle dans le feuillage environnant."
                        />
                        <MomentCard
                            img="/ayana/photos/v2/salle-de-bain.jpg"
                            title="Salle de Bain"
                            desc="Lignes pures et matières nobles pour le rituel de purification."
                        />
                    </div>
                </div>
            </section>

            {/* 4. SPA THERMAL */}
            <section id="spa" style={{ padding: '10rem 2rem', backgroundColor: 'var(--ayana-surface)' }}>
                <div className="ayana-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '8rem', alignItems: 'center' }}>
                    <div className="ayana-animate" style={{ position: 'relative', overflow: 'hidden', aspectRatio: '3/4', order: -1 }}>
                        <img src="/ayana/photos/v2/spa-1.jpg" alt="Spa Thermal" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div className="ayana-animate ayana-delay-1">
                        <SectionSubtitle>Le Rituel</SectionSubtitle>
                        <SectionTitle>Sanctuaire de l'Eau</SectionTitle>
                        <p style={{ color: 'var(--ayana-muted)', fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '2rem' }}>
                            Le parcours thermal privé est élevé au rang de cérémonie. La chaleur sèche du sauna, la pureté de l'eau froide, l'apaisement du hammam. Laissez l'hydrothérapie redessiner votre équilibre intérieur.
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '4rem' }}>
                            <img src="/ayana/photos/v2/spa-2.jpg" alt="Détail Spa" loading="lazy" style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover' }} />
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    <li style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--ayana-border)' }}>
                                        <span style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--ayana-accent)', marginBottom: '0.5rem' }}>Étape 01</span>
                                        <span style={{ color: 'var(--ayana-text)', fontSize: '1.1rem' }}>Chaleur (Sauna & Hammam)</span>
                                    </li>
                                    <li style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--ayana-border)' }}>
                                        <span style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--ayana-accent)', marginBottom: '0.5rem' }}>Étape 02</span>
                                        <span style={{ color: 'var(--ayana-text)', fontSize: '1.1rem' }}>Contraste (Bain Froid)</span>
                                    </li>
                                    <li>
                                        <span style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--ayana-accent)', marginBottom: '0.5rem' }}>Étape 03</span>
                                        <span style={{ color: 'var(--ayana-text)', fontSize: '1.1rem' }}>Repos (Introspection)</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. RESERVATION (Embedded Book.jsx) */}
            <section id="reserver" style={{ padding: '8rem 0 4rem', backgroundColor: 'var(--ayana-bg)' }}>
                {/* The Book component defines its own layout, so we just mount it here. */}
                <div className="ayana-animate">
                    <Book />
                </div>
            </section>
        </div>
    );
};

/* REUSABLE UI COMPONENTS FOR THIS PAGE */

const SectionTitle = ({ children }) => (
    <h2 style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', fontFamily: 'var(--ayana-font-heading)', marginBottom: '1.5rem', fontWeight: 300, color: 'var(--ayana-text)', lineHeight: 1.2 }}>
        {children}
    </h2>
);

const SectionSubtitle = ({ children }) => (
    <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '4px', color: 'var(--ayana-accent)', marginBottom: '1.5rem', fontWeight: 500 }}>
        {children}
    </h3>
);

const MomentCard = ({ img, title, desc }) => (
    <div className="ayana-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', borderRadius: '0' }}>
        <div style={{ aspectRatio: '3/4', overflow: 'hidden' }}>
            <img src={img} alt={title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.8s ease' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.03)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'} />
        </div>
        <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
            <h4 style={{ fontFamily: 'var(--ayana-font-heading)', fontSize: '1.6rem', marginBottom: '1rem', color: 'var(--ayana-text)', fontWeight: 300 }}>{title}</h4>
            <p style={{ color: 'var(--ayana-muted)', lineHeight: 1.6, fontSize: '0.95rem' }}>{desc}</p>
        </div>
    </div>
);

export default Home;
