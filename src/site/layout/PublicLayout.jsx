import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import CurrencySelector from '../components/CurrencySelector';

const PublicLayout = () => {
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Scroll to top on route change
    useEffect(() => {
        if (!location.hash) {
            window.scrollTo(0, 0);
        }
    }, [location.pathname]);

    const homeUrl = window.location.hostname.includes('chaletayana.ca') ? '/' : '/ayana';

    return (
        <div className="ayana-wrap" style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <header style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
                padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                transition: 'all 0.4s ease',
                backgroundColor: scrolled ? 'rgba(246, 242, 234, 0.98)' : 'transparent',
                backdropFilter: scrolled ? 'blur(12px)' : 'none',
                WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
                borderBottom: scrolled ? '1px solid var(--ayana-border)' : '1px solid transparent'
            }}>
                <Link to={homeUrl} style={{ textDecoration: 'none', color: scrolled ? 'var(--ayana-text)' : '#fff', transition: 'color 0.4s', fontFamily: 'var(--ayana-font-heading)', fontSize: '1.8rem', fontWeight: '400', letterSpacing: '4px', textTransform: 'uppercase' }}>
                    AYANA
                </Link>

                <nav style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
                    <Link to={homeUrl} style={{ color: scrolled || location.pathname !== homeUrl ? 'var(--ayana-text)' : '#fff', textDecoration: 'none', fontSize: '0.9rem', letterSpacing: '2px', textTransform: 'uppercase', transition: 'color 0.4s' }}>Accueil</Link>
                    <Link to="/chalet" style={{ color: scrolled || location.pathname !== homeUrl ? 'var(--ayana-text)' : '#fff', textDecoration: 'none', fontSize: '0.9rem', letterSpacing: '2px', textTransform: 'uppercase', transition: 'color 0.4s' }}>Chalet</Link>
                    <Link to="/bien-etre" style={{ color: scrolled || location.pathname !== homeUrl ? 'var(--ayana-text)' : '#fff', textDecoration: 'none', fontSize: '0.9rem', letterSpacing: '2px', textTransform: 'uppercase', transition: 'color 0.4s' }}>Bien-être</Link>
                    <Link to="/localisation" style={{ color: scrolled || location.pathname !== homeUrl ? 'var(--ayana-text)' : '#fff', textDecoration: 'none', fontSize: '0.9rem', letterSpacing: '2px', textTransform: 'uppercase', transition: 'color 0.4s' }}>Localisation</Link>
                </nav>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button onClick={() => navigate('/reservation')} className="ayana-btn" style={{ padding: '0.75rem 2rem', fontSize: '0.95rem', textDecoration: 'none', cursor: 'pointer', backgroundColor: scrolled ? 'var(--ayana-cta)' : 'rgba(255,255,255,0.1)', color: '#fff', border: scrolled ? '1px solid var(--ayana-cta)' : '1px solid rgba(255,255,255,0.5)', transition: 'all 0.3s ease' }} onMouseOver={(e) => { e.target.style.backgroundColor = scrolled ? 'var(--ayana-cta-hover)' : 'rgba(255,255,255,0.2)' }} onMouseOut={(e) => { e.target.style.backgroundColor = scrolled ? 'var(--ayana-cta)' : 'rgba(255,255,255,0.1)' }}>
                        Réserver
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main style={{ flex: 1, paddingBottom: scrolled ? '80px' : '0', transition: 'padding-bottom 0.5s ease', minHeight: '100vh' }}>
                <Outlet />
            </main>

            {/* Premium Footer */}
            <footer style={{ padding: '4rem 2rem 2rem', backgroundColor: 'var(--ayana-bg)', borderTop: '1px solid var(--ayana-border)' }}>
                <div className="ayana-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '4rem', marginBottom: '4rem' }}>
                    <div>
                        <h3 style={{ fontFamily: 'var(--ayana-font-heading)', fontSize: '2rem', marginBottom: '1.5rem', letterSpacing: '2px', textTransform: 'uppercase' }}>AYANA</h3>
                        <p style={{ color: 'var(--ayana-muted)', lineHeight: 1.8, fontSize: '0.95rem' }}>
                            Un sanctuaire minimaliste entre forêt et rivière.<br />
                            L'élégance naturelle à l'état pur dans les Laurentides.
                        </p>
                    </div>
                    <div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--ayana-text)', marginBottom: '1rem' }}>Découvrir</h4>
                            <Link to="/chalet" style={{ color: 'var(--ayana-muted)', textDecoration: 'none', transition: 'color 0.3s ease' }}>Le Chalet</Link>
                            <Link to="/bien-etre" style={{ color: 'var(--ayana-muted)', textDecoration: 'none', transition: 'color 0.3s ease' }}>Le Spa Thermal</Link>
                            <Link to="/localisation" style={{ color: 'var(--ayana-muted)', textDecoration: 'none', transition: 'color 0.3s ease' }}>Localisation</Link>
                            <Link to="/experience" style={{ color: 'var(--ayana-muted)', textDecoration: 'none', transition: 'color 0.3s ease' }}>Le Journal</Link>
                            <Link to="/regles" style={{ color: 'var(--ayana-muted)', textDecoration: 'none', transition: 'color 0.3s ease', marginTop: '0.5rem' }}>Règlement & Sécurité</Link>
                        </div>
                    </div>
                    <div>
                        <h4 style={{ marginBottom: '1.5rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--ayana-muted)' }}>Contact</h4>
                        <a href="mailto:chalet.ayana@gmail.com" style={{ textDecoration: 'none', color: 'var(--ayana-text)', fontSize: '0.95rem', transition: 'color 0.3s ease' }}>chalet.ayana@gmail.com</a>
                        <p style={{ color: 'var(--ayana-text)', marginTop: '0.5rem', fontSize: '0.95rem' }}>514-979-3103</p>
                        <p style={{ color: 'var(--ayana-text)', marginTop: '1.5rem', fontSize: '0.95rem' }}>
                            Chemin de la Rivière<br />
                            Laurentides, QC
                        </p>
                    </div>
                </div>
                <div style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '2rem', borderTop: '1px solid var(--ayana-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--ayana-muted)', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        <p>© {new Date().getFullYear()} Ayana Chalet. Tous droits réservés.</p>
                    </div>
                    <div>
                        <CurrencySelector />
                    </div>
                </div>
            </footer>

            {/* Sticky/Fixed Newsletter Bar */}
            <div style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: 'var(--ayana-bg)',
                borderTop: '1px solid var(--ayana-border)',
                padding: '1rem 2rem',
                transform: scrolled ? 'translateY(0)' : 'translateY(100%)',
                opacity: scrolled ? 1 : 0,
                transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease',
                zIndex: 90,
                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '3rem',
                boxShadow: '0 -4px 20px rgba(0,0,0,0.05)',
                flexWrap: 'wrap'
            }}>
                <h4 style={{ fontFamily: 'var(--ayana-font-heading)', fontSize: '1.2rem', color: 'var(--ayana-text)', margin: 0, fontWeight: 500 }}>
                    S'inscrire aux offres et promotions
                </h4>
                <form style={{ display: 'flex', gap: '1rem', alignItems: 'center' }} onSubmit={(e) => { e.preventDefault(); alert("Merci d'avoir rejoint le Journal AYANA."); }}>
                    <input 
                        type="email" 
                        placeholder="votre adresse e-mail" 
                        style={{ padding: '0.8rem 1.2rem', width: '280px', border: 'none', backgroundColor: 'rgba(0,0,0,0.03)', color: 'var(--ayana-text)', fontFamily: 'var(--ayana-font-body)', fontSize: '0.95rem', borderRadius: '2px' }} 
                        required 
                    />
                    <button 
                        type="submit" 
                        style={{ padding: '0.8rem 2.5rem', border: 'none', backgroundColor: '#A1ABA1', color: '#fff', fontSize: '0.95rem', letterSpacing: '1px', cursor: 'pointer', transition: 'background 0.3s ease', borderRadius: '2px', textTransform: 'lowercase' }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#899389'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#A1ABA1'}
                    >
                        s'inscrire
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PublicLayout;
