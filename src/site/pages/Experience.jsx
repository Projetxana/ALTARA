import React from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';

const Experience = () => {
    const navigate = useNavigate();

    const articles = [
        {
            id: 1,
            title: "Weekend Spa dans les Laurentides : Guide Complet",
            excerpt: "Découvrez notre itinéraire idéal pour un weekend de déconnexion totale dans les Laurentides, alliant thermothérapie, nature et gastronomie locale.",
            image: "/ayana/photos/v2/spa-nouveau-2.jpg",
            date: "15 Octobre 2026"
        },
        {
            id: 2,
            title: "Les Meilleurs Chalets de Luxe dans les Laurentides",
            excerpt: "Ce qui définit un véritable chalet de luxe aujourd'hui : au-delà des équipements, la quête du silence, de l'intimité et d'une architecture intégrée à la nature.",
            image: "/ayana/photos/v2/japandi-salon.jpg",
            date: "28 Septembre 2026"
        },
        {
            id: 3,
            title: "Retraite Bien-être au Québec : Où aller ?",
            excerpt: "Pourquoi les Laurentides sont devenues la destination phare pour les retraites bien-être privées et comment organiser la vôtre.",
            image: "/ayana/photos/v2/hero-main.jpg",
            date: "10 Septembre 2026"
        }
    ];

    return (
        <div style={{ backgroundColor: 'var(--ayana-bg)', minHeight: '100vh', paddingTop: '100px' }}>
            <SEO 
                title="Blog et Expériences | Chalet AYANA Laurentides"
                description="Découvrez nos guides et articles : Weekend Spa dans les Laurentides, Chalets de luxe et retraites bien-être au Québec."
                urlExt="/experience"
            />
            
            <div className="ayana-container">
                <div className="ayana-animate" style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 4rem' }}>
                    <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontFamily: 'var(--ayana-font-heading)', marginBottom: '2rem', fontWeight: 300, color: 'var(--ayana-text)', lineHeight: 1.1, textTransform: 'uppercase', letterSpacing: '2px' }}>
                        Le Journal AYANA
                    </h1>
                    <p style={{ color: 'var(--ayana-muted)', fontSize: '1.2rem', lineHeight: 1.8 }}>
                        Inspirations, guides et découvertes pour préparer votre séjour bien-être et explorer la région des Laurentides.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '4rem', margin: '6rem 0' }}>
                    {articles.map((article) => (
                        <article key={article.id} className="ayana-card ayana-animate" style={{ padding: 0, borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--ayana-border)', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ aspectRatio: '16/9', overflow: 'hidden' }}>
                                <img src={article.image} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'} />
                            </div>
                            <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                                <div style={{ fontSize: '0.85rem', color: 'var(--ayana-accent)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1rem' }}>{article.date}</div>
                                <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--ayana-font-heading)', marginBottom: '1rem', fontWeight: 300, lineHeight: 1.4 }}>{article.title}</h2>
                                <p style={{ color: 'var(--ayana-muted)', lineHeight: 1.6, marginBottom: '2rem', flexGrow: 1 }}>{article.excerpt}</p>
                                <button style={{ background: 'none', border: 'none', color: 'var(--ayana-text)', textAlign: 'left', padding: 0, fontSize: '0.95rem', letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    Lire l'article <span style={{ fontSize: '1.2rem' }}>→</span>
                                </button>
                            </div>
                        </article>
                    ))}
                </div>

                <div style={{ textAlign: 'center', marginBottom: '8rem', padding: '4rem 2rem', backgroundColor: 'var(--ayana-surface)', borderRadius: '8px' }}>
                    <h3 style={{ fontSize: '2rem', fontFamily: 'var(--ayana-font-heading)', marginBottom: '1.5rem', fontWeight: 300 }}>Prêt à vivre l'expérience ?</h3>
                    <p style={{ color: 'var(--ayana-muted)', marginBottom: '3rem', fontSize: '1.1rem' }}>Transformez l'inspiration en réalité.</p>
                    <button onClick={() => navigate('/reservation')} className="ayana-btn" style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}>
                        Réserver un séjour
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Experience;
