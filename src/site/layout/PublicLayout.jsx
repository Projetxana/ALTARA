import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

const PublicLayout = () => {
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Scroll to top on route change
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    return (
        <div className="ayana-wrap" style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <header style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
                padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                transition: 'all 0.4s ease',
                backgroundColor: scrolled ? 'rgba(246, 242, 234, 0.9)' : 'transparent',
                backdropFilter: scrolled ? 'blur(12px)' : 'none',
                WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
                borderBottom: scrolled ? '1px solid var(--ayana-border)' : '1px solid transparent'
            }}>
                <Link to="/ayana" style={{ textDecoration: 'none', color: scrolled ? 'var(--ayana-text)' : '#fff', transition: 'color 0.4s', fontFamily: 'var(--ayana-font-heading)', fontSize: '1.8rem', fontWeight: '400', letterSpacing: '4px', textTransform: 'uppercase' }}>
                    AYANA
                </Link>

                <nav style={{ display: 'flex', gap: '3rem' }} className="desktop-nav">
                    <Link to="/ayana/gallery" style={{ ...navLinkStyle, color: scrolled ? 'var(--ayana-muted)' : 'rgba(255,255,255,0.8)' }}>Galerie</Link>
                    <Link to="/ayana/experience" style={{ ...navLinkStyle, color: scrolled ? 'var(--ayana-muted)' : 'rgba(255,255,255,0.8)' }}>Expérience</Link>
                    <Link to="/ayana/location" style={{ ...navLinkStyle, color: scrolled ? 'var(--ayana-muted)' : 'rgba(255,255,255,0.8)' }}>Accès</Link>
                </nav>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <Link to="/ayana/book" className="ayana-btn" style={{ padding: '0.75rem 2rem', fontSize: '0.9rem' }}>Réserver</Link>
                </div>
            </header>

            {/* Main Content */}
            <main style={{ flex: 1 }}>
                <Outlet />
            </main>

            {/* Premium Footer */}
            <footer style={{ padding: '6rem 2rem 2rem', backgroundColor: 'var(--ayana-bg)', borderTop: '1px solid var(--ayana-border)' }}>
                <div className="ayana-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '4rem', marginBottom: '4rem' }}>
                    <div>
                        <h3 style={{ fontFamily: 'var(--ayana-font-heading)', fontSize: '2rem', marginBottom: '1.5rem', letterSpacing: '2px', textTransform: 'uppercase' }}>AYANA</h3>
                        <p style={{ color: 'var(--ayana-muted)', lineHeight: 1.8, fontSize: '0.95rem' }}>
                            Un sanctuaire minimaliste entre forêt et rivière.<br />
                            L'élégance naturelle à l'état pur dans les Laurentides.
                        </p>
                    </div>
                    <div>
                        <h4 style={{ marginBottom: '1.5rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--ayana-muted)' }}>Découvrir</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <Link to="/ayana" style={footerLinkStyle}>Accueil</Link>
                            <Link to="/ayana/experience" style={footerLinkStyle}>Circuit Thermal</Link>
                            <Link to="/ayana/gallery" style={footerLinkStyle}>Galerie</Link>
                        </div>
                    </div>
                    <div>
                        <h4 style={{ marginBottom: '1.5rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--ayana-muted)' }}>Contact</h4>
                        <a href="mailto:contact@ayana-chalet.com" style={footerLinkStyle}>contact@ayana-chalet.com</a>
                        <p style={{ color: 'var(--ayana-text)', marginTop: '0.5rem', fontSize: '0.95rem' }}>+1 (555) 123-4567</p>
                        <p style={{ color: 'var(--ayana-text)', marginTop: '1.5rem', fontSize: '0.95rem' }}>
                            Chemin de la Rivière<br />
                            Laurentides, QC
                        </p>
                    </div>
                </div>
                <div style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '2rem', borderTop: '1px solid var(--ayana-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--ayana-muted)', fontSize: '0.85rem' }}>
                    <p>© {new Date().getFullYear()} Ayana Chalet. Tous droits réservés.</p>
                    <div style={{ display: 'flex', gap: '2rem' }}>
                        <Link to="/ayana" style={footerLinkStyle}>Mentions légales</Link>
                        <Link to="/ayana" style={footerLinkStyle}>Politique de confidentialité</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

const navLinkStyle = {
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: '400',
    letterSpacing: '0.5px',
    transition: 'color 0.3s ease',
    textTransform: 'uppercase'
};

const footerLinkStyle = {
    textDecoration: 'none',
    color: 'var(--ayana-text)',
    fontSize: '0.95rem',
    transition: 'color 0.3s ease'
};

export default PublicLayout;
