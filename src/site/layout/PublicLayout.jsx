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
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg-main)', color: 'var(--color-text-main)' }}>
            {/* Header */}
            <header style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
                padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                transition: 'all 0.3s ease',
                backgroundColor: scrolled ? 'var(--color-bg-glass)' : 'transparent',
                backdropFilter: scrolled ? 'blur(12px)' : 'none',
                WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
                borderBottom: scrolled ? '1px solid var(--color-border)' : '1px solid transparent'
            }}>
                <Link to="/" style={{ textDecoration: 'none', color: 'inherit', fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: '600', letterSpacing: '2px' }}>
                    AYANA
                </Link>

                <nav style={{ display: 'none', gap: '2rem' }} className="desktop-nav">
                    <Link to="/gallery" style={navLinkStyle}>Galerie</Link>
                    <Link to="/experience" style={navLinkStyle}>Expérience</Link>
                    <Link to="/location" style={navLinkStyle}>Localisation</Link>
                </nav>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <Link to="/book" className="btn-primary" style={{ textDecoration: 'none' }}>Réserver</Link>
                </div>
            </header>

            {/* Main Content */}
            <main style={{ flex: 1 }}>
                <Outlet />
            </main>

            {/* Footer */}
            <footer style={{ padding: '4rem 2rem', backgroundColor: 'var(--color-bg-card)', borderTop: '1px solid var(--color-border)' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
                    <div>
                        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '1rem' }}>AYANA</h3>
                        <p style={{ color: 'var(--color-text-muted)' }}>Un sanctuaire entre forêt et rivière. L'élégance naturelle à l'état pur.</p>
                    </div>
                    <div>
                        <h4 style={{ marginBottom: '1rem' }}>Menu</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <Link to="/" style={footerLinkStyle}>Accueil</Link>
                            <Link to="/gallery" style={footerLinkStyle}>Galerie</Link>
                            <Link to="/experience" style={footerLinkStyle}>Expérience</Link>
                        </div>
                    </div>
                    <div>
                        <h4 style={{ marginBottom: '1rem' }}>Contact</h4>
                        <p style={{ color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>contact@ayana-chalet.com</p>
                        <p style={{ color: 'var(--color-text-muted)' }}>+1 (555) 123-4567</p>
                    </div>
                </div>
                <div style={{ maxWidth: '1200px', margin: '2rem auto 0', paddingTop: '2rem', borderTop: '1px solid var(--color-border)', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                    © {new Date().getFullYear()} Ayana Chalet. Tous droits réservés.
                </div>
            </footer>
        </div>
    );
};

const navLinkStyle = {
    textDecoration: 'none',
    color: 'inherit',
    fontSize: '0.95rem',
    fontWeight: '500',
    transition: 'color 0.2s ease',
    opacity: 0.9
};

const footerLinkStyle = {
    textDecoration: 'none',
    color: 'var(--color-text-muted)',
    transition: 'color 0.2s ease'
};

export default PublicLayout;
