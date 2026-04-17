import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BookingCalendar from '../components/BookingCalendar';
import SEO from '../components/SEO';

const Home = () => {
    const navigate = useNavigate();
    const [showHeroCalendar, setShowHeroCalendar] = useState(false);
    const [heroCheckIn, setHeroCheckIn] = useState('');
    const [heroCheckOut, setHeroCheckOut] = useState('');
    const [heroGuests, setHeroGuests] = useState(2);
    const [blockedDates, setBlockedDates] = useState([]);

    useEffect(() => {
        const fetchAvailability = async () => {
            try {
                const res = await fetch(`/api/public/availability`);
                const availData = await res.json();
                if (availData.success && availData.blocked) {
                    setBlockedDates(availData.blocked);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchAvailability();
    }, []);

    const handleHeroReserve = (e) => {
        e.preventDefault();
        navigate(`/reservation?in=${heroCheckIn}&out=${heroCheckOut}&guests=${heroGuests}`);
    };

    const formatDisplayDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return new Date(d.getTime() + d.getTimezoneOffset() * 60000).toLocaleDateString('fr-CA', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <div style={{ backgroundColor: 'var(--ayana-bg)' }}>
            <SEO 
                title="Chalet Spa Laurentides | AYANA — Séjour Bien-être Haut de Gamme"
                description="Découvrez AYANA, un chalet spa privé dans les Laurentides avec sauna, hammam et jacuzzi. Réservez une expérience bien-être unique à 1h de Montréal."
            />

            {/* 1. HERO SECTION */}
            <section id="hero" style={{ height: '100vh', position: 'relative', overflow: 'hidden' }}>
                <img src="/ayana/photos/v2/ayana-chalet-spa-laurentides.jpg" alt="Chalet spa AYANA dans les Laurentides avec jacuzzi extérieur" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, rgba(26,26,26,0.2), rgba(26,26,26,0.6))' }}></div>

                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 2rem' }}>
                    <div className="ayana-animate" style={{ maxWidth: '900px' }}>
                        <h1 style={{ fontFamily: 'var(--ayana-font-heading)', fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', color: '#fff', marginBottom: '1.5rem', fontWeight: 300, lineHeight: 1.1, letterSpacing: '2px', textTransform: 'uppercase' }}>
                            AYANA — Sanctuaire Thermal privé au cœur des Laurentides
                        </h1>
                        <p style={{ color: 'rgba(255,255,255,0.95)', fontSize: 'clamp(1rem, 2vw, 1.2rem)', marginBottom: '4rem', fontWeight: 300, lineHeight: 1.6, letterSpacing: '1px' }}>
                            Une expérience rare, entre silence, nature et bien-être absolu.
                        </p>
                        
                        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                             <button onClick={() => navigate('/reservation')} className="ayana-btn" style={{ padding: '1rem 3rem', fontSize: '1.1rem', backgroundColor: 'var(--ayana-surface)', color: 'var(--ayana-text)', border: 'none' }}>
                                 Réserver votre séjour
                             </button>
                             <button onClick={() => document.getElementById('intro').scrollIntoView({behavior: 'smooth'})} className="ayana-btn-outline" style={{ padding: '1rem 3rem', fontSize: '1.1rem', borderColor: 'rgba(255,255,255,0.5)', color: '#fff' }}>
                                 Découvrir l’expérience
                             </button>
                        </div>
                    </div>
                </div>

                {/* Hero Quick Booking Bar */}
                <div style={{ position: 'absolute', bottom: '3rem', left: '0', right: '0', display: 'flex', justifyContent: 'center', padding: '0 2rem', zIndex: 20 }}>
                     {/* The booking bar logic remains for when the user wants to use it */}
                    <div className="ayana-animate ayana-delay-3" style={{ display: 'flex', background: 'var(--ayana-surface)', borderRadius: '4px', overflow: 'hidden', boxShadow: '0 15px 40px rgba(0,0,0,0.1)', color: 'var(--ayana-text)' }}>
                        <button type="button" onClick={() => setShowHeroCalendar(true)} style={{ display: 'flex', flex: 1, padding: '1.2rem 2rem', alignItems: 'center', background: 'none', border: 'none', borderRight: '1px solid var(--ayana-border)', cursor: 'pointer' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--ayana-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '1rem' }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                            <div style={{ display: 'flex', alignItems: 'center', color: (heroCheckIn || heroCheckOut) ? 'var(--ayana-text)' : 'var(--ayana-muted)', fontSize: '1rem', fontStyle: (heroCheckIn || heroCheckOut) ? 'normal' : 'italic', fontWeight: 300 }}>
                                <span>{heroCheckIn ? formatDisplayDate(heroCheckIn) : 'arrivée'}</span>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 1rem', opacity: 0.5 }}><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 19"></polyline></svg>
                                <span>{heroCheckOut ? formatDisplayDate(heroCheckOut) : 'départ'}</span>
                            </div>
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', padding: '1.2rem 2rem', borderRight: '1px solid var(--ayana-border)' }}>
                            <select value={heroGuests} onChange={(e) => setHeroGuests(Number(e.target.value))} style={{ border: 'none', background: 'transparent', color: 'var(--ayana-text)', fontSize: '1rem', outline: 'none', cursor: 'pointer', appearance: 'none', paddingRight: '1.5rem' }}>
                                {[...Array(6)].map((_, i) => (
                                    <option key={i+1} value={i+1}>{i+1} {i === 0 ? 'convive' : 'convives'}</option>
                                ))}
                            </select>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '-1rem', pointerEvents: 'none' }}><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </div>
                        <a href="/reservation" onClick={handleHeroReserve} style={{ display: 'flex', alignItems: 'center', padding: '1.2rem 3rem', backgroundColor: 'var(--ayana-accent)', color: '#fff', textDecoration: 'none', fontSize: '1rem', transition: 'background 0.3s ease' }}>
                            Voir les disponibilités
                        </a>
                    </div>
                </div>

                {showHeroCalendar && (
                    <BookingCalendar chalet={{ base_night_price: 405 }} blockedDates={blockedDates} onDatesSelected={(inDate, outDate) => { setHeroCheckIn(inDate); setHeroCheckOut(outDate); }} onClose={() => setShowHeroCalendar(false)} />
                )}
            </section>

            {/* 2. INTRO */}
            <section id="intro" style={{ padding: '12rem 2rem', backgroundColor: 'var(--ayana-bg)', textAlign: 'center' }}>
                <div className="ayana-container ayana-animate">
                    <p style={{ fontFamily: 'var(--ayana-font-heading)', fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', lineHeight: 1.6, color: 'var(--ayana-text)', maxWidth: '900px', margin: '0 auto', fontWeight: 300 }}>
                        "À une heure de Montréal, AYANA a été imaginé comme un refuge.<br />Un lieu où le temps ralentit, où chaque détail invite à relâcher la pression et à retrouver l’essentiel."
                    </p>
                </div>
            </section>

            {/* 3. EXPERIENCE SECTION */}
            <section style={{ padding: '8rem 0', backgroundColor: 'var(--ayana-surface)' }}>
                <div className="ayana-container">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem' }}>
                        <div className="ayana-animate" style={{ textAlign: 'center', padding: '2rem' }}>
                            <div style={{ width: '60px', height: '1px', backgroundColor: 'var(--ayana-accent)', margin: '0 auto 2rem' }}></div>
                            <h3 style={{ fontFamily: 'var(--ayana-font-heading)', fontSize: '2rem', marginBottom: '1.5rem', fontWeight: 300 }}>Bien-être</h3>
                            <p style={{ color: 'var(--ayana-muted)', lineHeight: 1.8, fontSize: '1.1rem' }}>
                                Un rituel complet entre chaleur, eau et repos.
                            </p>
                        </div>
                        <div className="ayana-animate ayana-delay-1" style={{ textAlign: 'center', padding: '2rem' }}>
                            <div style={{ width: '60px', height: '1px', backgroundColor: 'var(--ayana-accent)', margin: '0 auto 2rem' }}></div>
                            <h3 style={{ fontFamily: 'var(--ayana-font-heading)', fontSize: '2rem', marginBottom: '1.5rem', fontWeight: 300 }}>Nature</h3>
                            <p style={{ color: 'var(--ayana-muted)', lineHeight: 1.8, fontSize: '1.1rem' }}>
                                Une immersion totale dans un environnement préservé.
                            </p>
                        </div>
                        <div className="ayana-animate ayana-delay-2" style={{ textAlign: 'center', padding: '2rem' }}>
                            <div style={{ width: '60px', height: '1px', backgroundColor: 'var(--ayana-accent)', margin: '0 auto 2rem' }}></div>
                            <h3 style={{ fontFamily: 'var(--ayana-font-heading)', fontSize: '2rem', marginBottom: '1.5rem', fontWeight: 300 }}>Intimité</h3>
                            <p style={{ color: 'var(--ayana-muted)', lineHeight: 1.8, fontSize: '1.1rem' }}>
                                Aucun compromis. Juste vous.
                            </p>
                        </div>
                    </div>
                    
                    <div style={{ textAlign: 'center', marginTop: '6rem' }}>
                         <button onClick={() => navigate('/chalet')} className="ayana-btn-outline" style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}>Découvrir le chalet</button>
                    </div>
                </div>
            </section>

             {/* 5. LOCALISATION -> Removed redundant structure to prioritize the user's explicit sections, but keep a visual break */}
             <section style={{ padding: '12rem 2rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
                    <img src="/ayana/photos/v2/sauna-hammam-chalet-luxe.jpg" alt="Chalet spa AYANA dans les Laurentides" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                </div>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(26,26,26,0.3)', zIndex: 1 }}></div>

                <div className="ayana-container" style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
                    <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontFamily: 'var(--ayana-font-heading)', marginBottom: '3rem', fontWeight: 300, color: '#fff', lineHeight: 1.2 }}>
                        "L'élégance naturelle à l'état pur."
                    </h2>
                    <button onClick={() => navigate('/bien-etre')} className="ayana-btn" style={{ padding: '1rem 3rem', fontSize: '1.1rem', backgroundColor: 'var(--ayana-surface)', color: 'var(--ayana-text)' }}>
                        Explorer l’expérience
                    </button>
                </div>
            </section>

            {/* 6. AVIS (REVIEWS) */}
            <ReviewsSection />

            {/* 7. CTA FINAL SECTION */}
            <section style={{ padding: '10rem 0', backgroundColor: 'var(--ayana-surface)', textAlign: 'center' }}>
                <div className="ayana-animate">
                    <h2 style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', fontFamily: 'var(--ayana-font-heading)', marginBottom: '1.5rem', fontWeight: 300, color: 'var(--ayana-text)', lineHeight: 1.2 }}>
                        Offrez-vous une parenthèse hors du temps
                    </h2>
                    <div style={{ marginTop: '4rem' }}>
                         <button onClick={() => navigate('/reservation')} className="ayana-btn" style={{ padding: '1.2rem 4rem', fontSize: '1.2rem' }}>
                             Voir les disponibilités
                         </button>
                    </div>
                </div>
            </section>

        </div>
    );
};

const REVIEWS_DATA = [
    { name: "Sarah", location: "Toronto, Canada", date: "Il y a 1 semaine", text: "La maison de Nadia et Jerome était incroyable. Le meilleur Airbnb dans lequel nous ayons séjourné. Propre, moderne et bien équipé." },
    { name: "Tim", location: "Montréal, Canada", date: "Il y a 4 jours", text: "Vues exceptionnelles et le spa est incroyable ! Sauna sec, hammam, une expérience de spa à domicile inégalée." },
    { name: "Gen", location: "Canada", date: "Il y a 1 semaine", text: "L’expérience SPA est unique et vraiment bien pensé. Nous avons adoré la déco, le calme, la belle lumière le matin." }
];

const ReviewsSection = () => {
    return (
        <section id="avis" style={{ padding: '8rem 2rem', backgroundColor: 'var(--ayana-bg)', borderTop: '1px solid var(--ayana-border)', borderBottom: '1px solid var(--ayana-border)' }}>
            <div className="ayana-container">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem' }}>
                    {REVIEWS_DATA.map((rev, idx) => (
                        <div key={idx} className="ayana-animate" style={{ padding: '2.5rem 2rem', border: '1px solid var(--ayana-border)', backgroundColor: 'var(--ayana-surface)', borderRadius: '4px' }}>
                            <h4 style={{ fontFamily: 'var(--ayana-font-heading)', fontSize: '1.3rem', marginBottom: '0.3rem' }}>{rev.name}</h4>
                            <div style={{ color: 'var(--ayana-text)', fontSize: '1rem', letterSpacing: '2px', marginBottom: '1.5rem' }}>★★★★★</div>
                            <p style={{ color: 'var(--ayana-muted)', lineHeight: 1.7, fontSize: '0.95rem' }}>"{rev.text}"</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Home;
