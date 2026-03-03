import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div style={{ backgroundColor: 'var(--ayana-bg)' }}>
            {/* A) HERO SECTION */}
            <section style={{ height: '100vh', position: 'relative', overflow: 'hidden' }}>
                <img src="/ayana/photos/hero.jpg" alt="AYANA Extérieur" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, rgba(31,35,40,0.3), rgba(31,35,40,0.6))' }}></div>

                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 2rem' }}>
                    <div className="ayana-animate" style={{ maxWidth: '800px' }}>
                        <h1 style={{ fontFamily: 'var(--ayana-font-heading)', fontSize: 'clamp(2.5rem, 6vw, 5rem)', color: '#fff', marginBottom: '1.5rem', fontWeight: 300, lineHeight: 1.1, letterSpacing: '1px' }}>
                            AYANA — Retraite bien-être<br />dans les Laurentides
                        </h1>
                        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 'clamp(1rem, 2vw, 1.2rem)', marginBottom: '3rem', fontWeight: 300, letterSpacing: '2px', textTransform: 'uppercase' }}>
                            Circuit thermal privé • Sauna • Hammam • Bain froid • Jacuzzi
                        </p>
                        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link to="/ayana/book" className="ayana-btn" style={{ padding: '1rem 3rem' }}>Vérifier les disponibilités</Link>
                            <Link to="/ayana/experience" className="ayana-btn-outline" style={{ padding: '1rem 3rem', color: '#fff', border: '1px solid rgba(255,255,255,0.5)', textDecoration: 'none', borderRadius: 'var(--ayana-radius)' }}>Découvrir l'expérience</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* B) TRUST BAR */}
            <section style={{ padding: '3rem 2rem', backgroundColor: 'var(--ayana-surface)', borderBottom: '1px solid var(--ayana-border)' }}>
                <div className="ayana-container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem', textAlign: 'center' }}>
                        {[
                            { title: 'Check-in autonome', icon: '🔑' },
                            { title: 'Circuit thermal privé', icon: '🧖‍♀️' },
                            { title: '45 min de Montréal', icon: '🌲' },
                            { title: 'Design Japandi', icon: '✨' }
                        ].map((item, i) => (
                            <div key={i} style={{ flex: '1 1 200px' }}>
                                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{item.icon}</div>
                                <h3 style={{ fontSize: '1rem', color: 'var(--ayana-text)', fontWeight: 500, fontFamily: 'var(--ayana-font-body)' }}>{item.title}</h3>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* C) EXPERIENCE TEASER */}
            <section style={{ padding: '8rem 2rem' }}>
                <div className="ayana-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '6rem', alignItems: 'center' }}>
                    <div>
                        <SectionSubtitle>Ressourcement absolu</SectionSubtitle>
                        <SectionTitle>Une pause hors du temps</SectionTitle>
                        <p style={{ color: 'var(--ayana-muted)', fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '2rem' }}>
                            Conçu selon les principes du design Japandi, l'esthétique minimaliste s'efface pour laisser place à la nature. Profitez de nos installations thermales privées en liberté totale, à votre rythme.
                        </p>
                        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 3rem 0', color: 'var(--ayana-text)', display: 'grid', gap: '1rem' }}>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}><span style={{ color: 'var(--ayana-accent)' }}>✓</span> Spa nordique extérieur</li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}><span style={{ color: 'var(--ayana-accent)' }}>✓</span> Sauna sec vitré sur la forêt</li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}><span style={{ color: 'var(--ayana-accent)' }}>✓</span> Hammam à l'eucalyptus</li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}><span style={{ color: 'var(--ayana-accent)' }}>✓</span> Bassin de plongée froid</li>
                        </ul>
                        <Link to="/ayana/experience" className="ayana-btn-outline" style={{ padding: '1rem 2.5rem', border: '1px solid var(--ayana-text)', display: 'inline-block' }}>Explorer les installations</Link>
                    </div>
                    <div style={{ position: 'relative', borderRadius: 'var(--ayana-radius-lg)', overflow: 'hidden', aspectRatio: '4/5' }}>
                        <img src="/ayana/photos/spa.jpg" alt="Spa" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                </div>
            </section>

            {/* D) GALLERY PREVIEW */}
            <section style={{ padding: '8rem 0', backgroundColor: 'var(--ayana-surface)' }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <SectionSubtitle>Immersion visuelle</SectionSubtitle>
                    <SectionTitle>La pureté des espaces</SectionTitle>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem', padding: '0 1rem' }}>
                    {['living.jpg', 'kitchen.jpg', 'bedroom-01.jpg', 'exterior.jpg', 'sauna.jpg', 'hammam.jpg'].map((img, i) => (
                        <div key={i} style={{ aspectRatio: '1/1', overflow: 'hidden', borderRadius: '8px' }}>
                            <img src={`/ayana/photos/${img}`} alt={`Galerie ${i}`} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'} />
                        </div>
                    ))}
                </div>

                <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                    <Link to="/ayana/gallery" className="ayana-btn-outline" style={{ padding: '1rem 3rem', border: '1px solid var(--ayana-text)', display: 'inline-block' }}>Voir la galerie complète</Link>
                </div>
            </section>

            {/* E) SIGNATURE MOMENTS */}
            <section style={{ padding: '8rem 2rem' }}>
                <div className="ayana-container">
                    <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                        <SectionSubtitle>Art de vivre</SectionSubtitle>
                        <SectionTitle>Moments signatures</SectionTitle>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        <MomentCard img="/ayana/photos/sauna.jpg" title="Rituel sauna + bain froid" desc="Éliminez les tensions et ravivez votre énergie vitale grâce à la thérapie par le contraste thermique." />
                        <MomentCard img="/ayana/photos/jacuzzi.jpg" title="Soirée spa sous les étoiles" desc="Plongez dans les bulles chaudes du spa extérieur pendant que la nuit tombe sur la majestueuse forêt." />
                        <MomentCard img="/ayana/photos/living.jpg" title="Matin calme, café & forêt" desc="Réveillez-vous avec la lumière douce traversant les immenses baies vitrées." />
                    </div>
                </div>
            </section>

            {/* F) LOCATION TEASER */}
            <section style={{ padding: '8rem 2rem', backgroundColor: 'var(--ayana-surface)' }}>
                <div className="ayana-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '6rem', alignItems: 'center' }}>
                    <div style={{ aspectRatio: '1/1', backgroundColor: '#e5e7eb', borderRadius: 'var(--ayana-radius-lg)', overflow: 'hidden' }}>
                        <iframe
                            title="Localisation Chalet Ayana"
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d177309.7319985223!2d-74.34148419614441!3d46.035417435850935!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4ccf7cb9344c2115%3A0xe5fcff2ce9c09930!2sLaurentides%2C%20QC!5e0!3m2!1sfr!2sca!4v1700000000000!5m2!1sfr!2sca"
                            width="100%" height="100%" style={{ border: 0, filter: 'grayscale(100%) opacity(0.8)' }} allowFullScreen="" loading="lazy">
                        </iframe>
                    </div>
                    <div>
                        <SectionSubtitle>Situation idéale</SectionSubtitle>
                        <SectionTitle>Un accès privilégié</SectionTitle>
                        <p style={{ color: 'var(--ayana-muted)', fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '2rem' }}>
                            Retiré mais accessible, le chalet est votre point de départ pour l'aventure ou la contemplation.
                        </p>

                        <div style={{ display: 'grid', gap: '1.5rem', marginBottom: '3rem' }}>
                            <div style={{ borderBottom: '1px solid var(--ayana-border)', paddingBottom: '1rem' }}>
                                <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Mont-Tremblant</h4>
                                <p style={{ color: 'var(--ayana-muted)' }}>25 minutes de route</p>
                            </div>
                            <div style={{ borderBottom: '1px solid var(--ayana-border)', paddingBottom: '1rem' }}>
                                <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Saint-Sauveur</h4>
                                <p style={{ color: 'var(--ayana-muted)' }}>20 minutes de route</p>
                            </div>
                            <div style={{ borderBottom: '1px solid var(--ayana-border)', paddingBottom: '1rem' }}>
                                <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Accès sentiers et lacs</h4>
                                <p style={{ color: 'var(--ayana-muted)' }}>À distance de marche</p>
                            </div>
                        </div>

                        <Link to="/ayana/location" className="ayana-btn-outline" style={{ padding: '1rem 2.5rem', border: '1px solid var(--ayana-text)', display: 'inline-block' }}>Voir les détails d'accès</Link>
                    </div>
                </div>
            </section>

            {/* G) FAQ */}
            <section style={{ padding: '8rem 2rem' }}>
                <div className="ayana-container" style={{ maxWidth: '800px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <SectionTitle>Questions Fréquentes</SectionTitle>
                    </div>

                    <div style={{ display: 'grid', gap: '2rem' }}>
                        <Accordion title="Check-in et Check-out" content="L'arrivée se fait de manière autonome à partir de 16h00 grâce à une serrure intelligente. Le départ est prévu pour 11h00 au plus tard afin de permettre à notre équipe de préparer le chalet pour les prochains invités." />
                        <Accordion title="Politique d'annulation" content="Remboursement intégral en cas d'annulation jusqu'à 30 jours avant l'arrivée. Aucun remboursement en cas d'annulation moins de 30 jours avant la date de début du séjour." />
                        <Accordion title="Les animaux sont-ils acceptés ?" content="Afin de maintenir le niveau de propreté et pour le confort des clients allergiques, les animaux de compagnie ne sont pas autorisés." />
                        <Accordion title="Politique de bruit et voisinage" content="Ayana est un lieu de retraite paisible. Les fêtes sont strictement interdites et nous demandons de minimiser le bruit à l'extérieur après 22h00 par respect pour la quiétude de la forêt et du voisinage." />
                        <Accordion title="Stationnement" content="Une allée privée pouvant accueillir jusqu'à 4 véhicules est à votre disposition gratuitement sur la propriété." />
                    </div>
                </div>
            </section>

            {/* H) FINAL CTA */}
            <section style={{ padding: '10rem 2rem', textAlign: 'center', backgroundColor: 'var(--ayana-text)', color: 'var(--ayana-bg)' }}>
                <div className="ayana-container">
                    <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontFamily: 'var(--ayana-font-heading)', marginBottom: '1.5rem', fontWeight: 300 }}>Prêt pour l'évasion ?</h2>
                    <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.7)', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
                        Réservez vos dates dès maintenant et préparez-vous à vivre une expérience de détente inoubliable.
                    </p>
                    <Link to="/ayana/book" className="ayana-btn" style={{ background: 'var(--ayana-bg)', color: 'var(--ayana-text)', padding: '1.2rem 3.5rem', fontSize: '1.1rem' }}>
                        Réserver votre retraite
                    </Link>
                </div>
            </section>
        </div>
    );
};

/* REUSABLE UI COMPONENTS FOR THIS PAGE */

const SectionTitle = ({ children }) => (
    <h2 style={{ fontSize: '3rem', fontFamily: 'var(--ayana-font-heading)', marginBottom: '1.5rem', fontWeight: 400, color: 'var(--ayana-text)' }}>
        {children}
    </h2>
);

const SectionSubtitle = ({ children }) => (
    <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--ayana-accent)', marginBottom: '1rem', fontWeight: 600 }}>
        {children}
    </h3>
);

const MomentCard = ({ img, title, desc }) => (
    <div className="ayana-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: '300px', overflow: 'hidden' }}>
            <img src={img} alt={title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'} />
        </div>
        <div style={{ padding: '2rem' }}>
            <h4 style={{ fontFamily: 'var(--ayana-font-heading)', fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--ayana-text)' }}>{title}</h4>
            <p style={{ color: 'var(--ayana-muted)', lineHeight: 1.6 }}>{desc}</p>
        </div>
    </div>
);

const Accordion = ({ title, content }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div style={{ borderBottom: '1px solid var(--ayana-border)', paddingBottom: '1.5rem' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', padding: 0 }}
            >
                <h4 style={{ fontSize: '1.2rem', fontFamily: 'var(--ayana-font-heading)', color: 'var(--ayana-text)' }}>{title}</h4>
                <span style={{ fontSize: '1.5rem', color: 'var(--ayana-accent)', transition: 'transform 0.3s ease', transform: isOpen ? 'rotate(45deg)' : 'rotate(0)' }}>+</span>
            </button>
            <div style={{ marginTop: isOpen ? '1rem' : '0', maxHeight: isOpen ? '200px' : '0', overflow: 'hidden', transition: 'all 0.3s ease', opacity: isOpen ? 1 : 0 }}>
                <p style={{ color: 'var(--ayana-muted)', lineHeight: 1.6 }}>{content}</p>
            </div>
        </div>
    );
};

export default Home;
