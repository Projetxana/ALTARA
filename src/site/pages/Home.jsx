import React, { useState, useEffect } from 'react';
import { Bath, TreePine, Utensils, Wifi, Mountain, Leaf } from 'lucide-react';
import Book from './Book';
import WellnessSanctuarySection from '../components/WellnessSanctuarySection';
import BookingCalendar from '../components/BookingCalendar';
const Home = () => {
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
        // Naturel scroll down using href="#reserver" avoids routing issues
    };

    const formatDisplayDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        // Force l'utilisation du timezone UTC pour éviter un décalage d'un jour lié au fuseau local
        return new Date(d.getTime() + d.getTimezoneOffset() * 60000).toLocaleDateString('fr-CA', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <div style={{ backgroundColor: 'var(--ayana-bg)' }}>
            {/* 1. HERO SECTION */}
            <section id="hero" style={{ height: '100vh', position: 'relative', overflow: 'hidden' }}>
                <img src="/ayana/photos/v2/hero-main.jpg" alt="AYANA Extérieur" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, rgba(31,35,40,0.2), rgba(31,35,40,0.5))' }}></div>

                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 2rem' }}>
                    <div className="ayana-animate" style={{ maxWidth: '800px' }}>
                        <h1 style={{ fontFamily: 'var(--ayana-font-heading)', fontSize: 'clamp(3rem, 7vw, 6rem)', color: '#fff', marginBottom: '1.5rem', fontWeight: 300, lineHeight: 1.1, letterSpacing: '2px', textTransform: 'uppercase' }}>
                            AYANA
                        </h1>
                        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 'clamp(1rem, 2vw, 1.2rem)', marginBottom: '3rem', fontWeight: 300, letterSpacing: '4px', textTransform: 'uppercase' }}>
                            Sanctuaire Thermal • Laurentides
                        </p>
                    </div>
                </div>

                {/* Hero Quick Booking Bar - Lowered to bottom */}
                <div style={{ 
                    position: 'absolute',
                    bottom: '3rem',
                    left: '0', right: '0',
                    display: 'flex', 
                    justifyContent: 'center',
                    padding: '0 2rem',
                    zIndex: 20
                }}>
                    <div style={{
                        display: 'flex', 
                        background: '#fff', 
                        borderRadius: '4px',
                        overflow: 'hidden',
                        boxShadow: '0 15px 40px rgba(0,0,0,0.2)',
                        color: 'var(--ayana-text)'
                    }}>
                        {/* Dates */}
                        <button type="button" onClick={() => setShowHeroCalendar(true)} style={{ display: 'flex', flex: 1, padding: '1.2rem 1.5rem', alignItems: 'center', background: 'none', border: 'none', borderRight: '1px solid var(--ayana-border)', cursor: 'pointer' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--ayana-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '1rem' }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                            <div style={{ display: 'flex', alignItems: 'center', color: (heroCheckIn || heroCheckOut) ? 'var(--ayana-text)' : 'var(--ayana-muted)', fontSize: '1rem', fontStyle: (heroCheckIn || heroCheckOut) ? 'normal' : 'italic', fontWeight: 300 }}>
                                <span>{heroCheckIn ? formatDisplayDate(heroCheckIn) : 'arrivée'}</span>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 1rem', opacity: 0.5 }}><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                                <span>{heroCheckOut ? formatDisplayDate(heroCheckOut) : 'départ'}</span>
                            </div>
                        </button>

                        {/* Guests */}
                        <div style={{ display: 'flex', alignItems: 'center', padding: '1.2rem 1.5rem', borderRight: '1px solid var(--ayana-border)' }}>
                            <select value={heroGuests} onChange={(e) => setHeroGuests(Number(e.target.value))} style={{ border: 'none', background: 'transparent', color: 'var(--ayana-text)', fontSize: '1rem', outline: 'none', cursor: 'pointer', appearance: 'none', paddingRight: '1.5rem', WebkitAppearance: 'none' }}>
                                {[...Array(6)].map((_, i) => (
                                    <option key={i+1} value={i+1}>{i+1} {i === 0 ? 'convive' : 'convives'}</option>
                                ))}
                            </select>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '-1rem', pointerEvents: 'none' }}><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </div>

                        {/* Submit Button */}
                        <a href="#reserver" onClick={handleHeroReserve} style={{ display: 'flex', alignItems: 'center', padding: '1.2rem 3rem', backgroundColor: '#A1ABA1', color: '#fff', textDecoration: 'none', fontSize: '1rem', transition: 'background 0.3s ease' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor='#8A9B86'} onMouseOut={(e) => e.currentTarget.style.backgroundColor='#A1ABA1'}>
                            réserver
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '1rem' }}><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </a>
                    </div>
                </div>

                {showHeroCalendar && (
                    <BookingCalendar
                        chalet={{ base_night_price: 405 }}
                        blockedDates={blockedDates}
                        onDatesSelected={(inDate, outDate) => {
                            setHeroCheckIn(inDate);
                            setHeroCheckOut(outDate);
                        }}
                        onClose={() => setShowHeroCalendar(false)}
                    />
                )}
            </section>

            {/* 2. LE LIEU (LOCATION / CONCEPT) */}
            <section id="lieux" style={{ padding: '10rem 2rem', backgroundColor: 'var(--ayana-surface)' }}>
                <div className="ayana-container">
                    <div className="ayana-animate" style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 6rem' }}>
                        <SectionSubtitle>L'Essence</SectionSubtitle>
                        <SectionTitle>Retrait en Haute Altitude</SectionTitle>
                        <p style={{ color: 'var(--ayana-muted)', fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '2rem' }}>
                            Niché au sommet, Ayana est un refuge pensé pour l'introspection et la contemplation. L'architecture minimaliste s'efface devant l'immensité de la nature, créant un espace où le temps suspend son vol.
                        </p>
                        <p style={{ color: 'var(--ayana-muted)', fontSize: '1.1rem', lineHeight: 1.8 }}>
                            S'inspirant silencieusement de l'esprit <strong>Japandi</strong>, l’intérieur fusionne la chaleur scandinave et la grâce minimaliste japonaise. L'harmonie entre les matériaux bruts, la lumière naturelle et la douceur des textures claires invite à un retour à l'essentiel. Chaque détail est pensé pour éveiller un profond sentiment de sérénité et réconforter l'âme au cœur de la montagne.
                        </p>
                    </div>

                    {/* Galerie Minimaliste à 2 photos */}
                    <div className="ayana-animate ayana-delay-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: '4/3', borderRadius: '4px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                            <img src="/ayana/photos/v2/japandi-salon.jpg" alt="Salon Japandi avec foyer" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.8s ease' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.03)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'} />
                        </div>
                        <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: '4/3', borderRadius: '4px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                            <img src="/ayana/photos/v2/japandi-chambre.jpg" alt="Chambre Japandi enneigée" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.8s ease' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.03)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'} />
                        </div>
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

            {/* 3.5 SERVICES (SUR PLACE) */}
            <section id="services" style={{ padding: '8rem 2rem', backgroundColor: 'var(--ayana-surface)' }}>
                <div className="ayana-container">
                    <div style={{ textAlign: 'center', marginBottom: '5rem' }} className="ayana-animate">
                        <SectionSubtitle>Sur Place</SectionSubtitle>
                        <SectionTitle style={{ fontSize: 'clamp(2rem, 3vw, 2.5rem)', marginBottom: '4rem' }}>L'Art de Recevoir</SectionTitle>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '4rem 2rem', textAlign: 'center' }}>
                        <ServiceItem
                            icon={<Bath strokeWidth={1} size={40} />}
                            text="Circuit thermal complet privé"
                        />
                        <ServiceItem
                            icon={<TreePine strokeWidth={1} size={40} />}
                            text="Profitez de notre espace extérieur avec un jardin paisible."
                        />
                        <ServiceItem
                            icon={<Utensils strokeWidth={1} size={40} />}
                            text="Profitez des restaurants gastronomiques à proximité"
                        />
                        <ServiceItem
                            icon={<Wifi strokeWidth={1} size={40} />}
                            text="Restez connecté avec un accès wifi gratuit."
                        />
                        <ServiceItem
                            icon={<Mountain strokeWidth={1} size={40} />}
                            text="Profitez des nombreuses activités/expériences nature"
                        />
                        <ServiceItem
                            icon={<Leaf strokeWidth={1} size={40} />}
                            text="Une invitation à ralentir et à reconnecter avec vos sens."
                        />
                    </div>
                </div>
            </section>

            {/* 3.6 GALERIE (CAROUSEL) */}
            <section id="galerie" style={{ padding: '8rem 0', backgroundColor: 'var(--ayana-bg)', overflow: 'hidden' }}>
                <div className="ayana-container" style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <SectionSubtitle>Immersion visuelle</SectionSubtitle>
                    <SectionTitle>La Magie des Lieux</SectionTitle>
                </div>
                <GalleryCarousel />
            </section>

            {/* 4. SPA THERMAL (WELLNESS SANCTUARY) */}
            <WellnessSanctuarySection />

            {/* 4.5 AVIS (REVIEWS) */}
            <ReviewsSection />

            {/* 5. RESERVATION (Embedded Book.jsx) */}
            <section id="reserver" style={{ padding: '8rem 0 4rem', backgroundColor: 'var(--ayana-bg)' }}>
                {/* The Book component defines its own layout, so we just mount it here. */}
                <div className="ayana-animate">
                    <Book initialCheckIn={heroCheckIn} initialCheckOut={heroCheckOut} initialGuests={heroGuests} />
                </div>
            </section>

            {/* 6. CONTACT & ACCÈS */}
            <section id="contact" style={{ padding: '8rem 0 0 0', backgroundColor: 'var(--ayana-surface)', borderTop: '1px solid var(--ayana-border)' }}>
                <div className="ayana-container" style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <SectionTitle>Contact</SectionTitle>

                    {/* Contact Info Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginTop: '3rem', color: 'var(--ayana-muted)', fontStyle: 'italic', fontSize: '1.05rem' }}>
                        <div>chalet.ayana@gmail.com</div>
                        <div style={{ borderLeft: '1px solid var(--ayana-border)', borderRight: '1px solid var(--ayana-border)' }}>
                            5135 rue de la Tortille, Sainte-Adèle
                        </div>
                        <div>Tél : 514-979-3103</div>
                    </div>

                    {/* Minimalist Contact Form */}
                    <form style={{ maxWidth: '800px', margin: '4rem auto 0' }} onSubmit={(e) => e.preventDefault()}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <input type="text" placeholder="Prénom" style={{ width: '100%', padding: '1rem', border: '1px solid var(--ayana-border)', backgroundColor: 'transparent', color: 'var(--ayana-text)', fontFamily: 'var(--ayana-font-body)', fontSize: '1rem' }} />
                            <input type="tel" placeholder="Téléphone" style={{ width: '100%', padding: '1rem', border: '1px solid var(--ayana-border)', backgroundColor: 'transparent', color: 'var(--ayana-text)', fontFamily: 'var(--ayana-font-body)', fontSize: '1rem' }} />
                        </div>
                        <input type="email" placeholder="E-mail" style={{ width: '100%', padding: '1rem', border: '1px solid var(--ayana-border)', backgroundColor: 'transparent', color: 'var(--ayana-text)', fontFamily: 'var(--ayana-font-body)', fontSize: '1rem', marginBottom: '1rem' }} />
                        <textarea placeholder="Rédigez votre message ici..." rows={6} style={{ width: '100%', padding: '1rem', border: '1px solid var(--ayana-border)', backgroundColor: 'transparent', color: 'var(--ayana-text)', fontFamily: 'var(--ayana-font-body)', fontSize: '1rem', resize: 'vertical', marginBottom: '2rem' }}></textarea>

                        <button type="submit" style={{ background: 'none', border: 'none', color: 'var(--ayana-text)', fontStyle: 'italic', fontSize: '1.2rem', cursor: 'pointer', fontFamily: 'var(--ayana-font-heading)' }}>
                            Envoyer
                        </button>
                    </form>
                </div>

                {/* Google Maps Embed (Grayscale) */}
                <div style={{ width: '100%', height: '500px', marginTop: '6rem' }}>
                    <iframe
                        title="Localisation Chalet Ayana"
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d177309.7319985223!2d-74.34148419614441!3d46.035417435850935!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4ccf7cb9344c2115%3A0xe5fcff2ce9c09930!2sLaurentides%2C%20QC!5e0!3m2!1sfr!2sca!4v1700000000000!5m2!1sfr!2sca"
                        width="100%" height="100%" style={{ border: 0, filter: 'grayscale(100%) opacity(0.8)' }} allowFullScreen="" loading="lazy">
                    </iframe>
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

const ServiceItem = ({ icon, text }) => (
    <div className="ayana-animate" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ color: 'var(--ayana-text)', opacity: 0.8 }}>
            {icon}
        </div>
        <p style={{ color: 'var(--ayana-text)', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '280px' }}>
            {text}
        </p>
    </div>
);

const GalleryCarousel = () => {
    const images = [
        "/ayana/photos/v2/carousel-new-1.jpg",
        "/ayana/photos/v2/carousel-new-2.jpg",
        "/ayana/photos/v2/carousel-new-4.jpg",
        "/ayana/photos/v2/carousel-new-5.jpg",
        "/ayana/photos/v2/carousel-new-3.jpg",
        "/ayana/photos/gallery-01.jpg",
        "/ayana/photos/gallery-06.jpg"
    ];

    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % images.length);
    const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

    React.useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [images.length]);

    return (
        <div style={{ position: 'relative', width: '100%', maxWidth: '1200px', margin: '0 auto', px: '1rem' }}>
            <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden', borderRadius: '4px' }}>
                {images.map((img, idx) => (
                    <img
                        key={idx}
                        src={img}
                        alt={`Galerie ${idx + 1}`}
                        loading="lazy"
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            opacity: idx === currentIndex ? 1 : 0,
                            transform: idx === currentIndex ? 'scale(1.04)' : 'scale(1)',
                            transition: 'opacity 1s ease-in-out, transform 6s ease-out',
                            zIndex: idx === currentIndex ? 1 : 0
                        }}
                    />
                ))}
            </div>

            <button
                onClick={prevSlide}
                style={{ position: 'absolute', top: '50%', left: '2rem', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', width: '3rem', height: '3rem', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            >
                ←
            </button>
            <button
                onClick={nextSlide}
                style={{ position: 'absolute', top: '50%', right: '2rem', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', width: '3rem', height: '3rem', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            >
                →
            </button>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
                {images.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        style={{
                            width: '40px',
                            height: '2px',
                            padding: 0,
                            border: 'none',
                            background: idx === currentIndex ? 'var(--ayana-text)' : 'rgba(31,35,40,0.2)',
                            cursor: 'pointer',
                            transition: 'background 0.3s ease'
                        }}
                        aria-label={`Aller à l'image ${idx + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

/* REVIEWS DATA AND COMPONENTS */
const REVIEWS_DATA = [
    {
        name: "Sarah",
        location: "Toronto, Canada",
        date: "Il y a 1 semaine • Séjour avec enfants",
        text: "La maison de Nadia et Jerome était incroyable. Le meilleur Airbnb dans lequel nous ayons séjourné. Commodités fantastiques. Propre, moderne et bien équipé. Nous avons passé une semaine merveilleuse."
    },
    {
        name: "Tim",
        location: "Montréal, Canada",
        date: "Il y a 4 jours • Séjour de quelques nuits",
        text: "Vous devez séjourner chez Nadia! Les vues sont exceptionnelles de partout dans le chalet, et il est équipé de tout ce dont vous avez besoin, mais ce qui fait vraiment la différence, c’est l’espace spa ! Le spa, le sauna sec et le hammam sont incroyables et offrent une expérience de spa à domicile inégalée. En plus de tout ça, Nadia a été très serviable et réactive. Je recommande à tout le monde de séjourner au chalet de Nadia!"
    },
    {
        name: "Gen",
        location: "Saint-Jean-de-l'Île-d'Orléans, Canada",
        date: "Il y a 1 semaine • Séjour avec un animal",
        text: "Nous avons eu un séjour merveilleux. L’expérience SPA est unique et vraiment bien pensé. Nous avons adoré la déco, le calme, la belle lumière le matin et la tranquillité de l’espace. Les hôtes sont attentifs à nos besoins et répondent très rapidement. Nous allons fort probablement y retourner!"
    },
    {
        name: "Shilan",
        location: "Ottawa, Canada",
        date: "Il y a 2 semaines • Séjour de quelques nuits",
        text: "Magnifique et très bien décoré - je ne pense pas que les photos lui rendent justice. C'est très pratique et un endroit idéal pour s'évader et se reposer. La cuisine est bien approvisionnée, vous pouvez donc facilement préparer des repas pendant votre séjour. Sa proximité avec Sainte-Adèle et Saint-Sauveur est un énorme avantage pour profiter des différents magasins, boulangeries et restaurants."
    },
    {
        name: "Christine",
        location: "L'Ange-Gardien, Canada",
        date: "Il y a 3 semaines • Séjour avec un animal",
        text: "Nous avons passé un excellent séjour. L’endroit est très tranquille, sur le toit de la montagne et avec le vent dans les arbres en fond sonore qui crée une ambiance presque musicale et extrêmement relaxante. Tout était parfait pour se reposer et décrocher. De plus, la propreté des lieux était tout simplement immaculée."
    },
    {
        name: "Cindy N.",
        location: "Canada",
        date: "Février 2026",
        text: "Nous avons passé un excellent séjour au chalet! Nous avons été formidablement bien accueilli avec un petit mot de Nadia et Jérôme ainsi que de petites attentions. [...] Le chalet est propre, très confortable avec des installations de grande qualité. La vue est magnifique ! Tous les ingrédients étaient réunis pour décrocher le temps d'une fin de semaine ! Nous y reviendrons avec plaisir !"
    },
    {
        name: "Derek",
        location: "Canada",
        date: "Hiver 2024",
        text: "Réservez-le immédiatement! Dès le moment où j'ai réservé jusqu'au moment où je suis parti, c'était tout ce que j'espérais. Le logement est absolument magnifique avec un décor bien pensé, de belles vues et toutes les commodités dont vous avez besoin pour le bien-être mental et physique. Je reviendrai !"
    },
    {
        name: "Céline",
        location: "Canada",
        date: "Hiver 2024",
        text: "L'appartement de Nadia était impeccable et l'endroit idéal pour une escapade de fin de semaine et se détendre. Elle était communicative et tout était très fluide. Je recommanderais définitivement cet endroit à tout le monde."
    }
];

const ReviewsSection = () => {
    const [showAll, setShowAll] = useState(false);
    const visibleReviews = showAll ? REVIEWS_DATA : REVIEWS_DATA.slice(0, 3);

    return (
        <section id="avis" style={{ padding: '8rem 2rem', backgroundColor: 'var(--ayana-surface)', borderTop: '1px solid var(--ayana-border)' }}>
            <div className="ayana-container">
                {/* Badge Coup de cœur voyageurs */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '5rem' }} className="ayana-animate">
                    <div style={{ textAlign: 'center', maxWidth: '350px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            {/* Branche Laurier Gauche (Approximation CSS vectorielle simple) */}
                            <svg width="40" height="50" viewBox="0 0 32 40" fill="none" stroke="var(--ayana-text)" strokeWidth="1.2">
                                <path d="M26 38 C 10 32, 2 18, 14 4 C 14 4, 10 10, 10 16 C 10 22, 16 26, 26 38" />
                                <path d="M20 30 C 14 28, 10 24, 8 20" />
                                <path d="M16 22 C 10 18, 8 12, 12 8" />
                            </svg>
                            <div>
                                <div style={{ fontFamily: 'var(--ayana-font-heading)', fontSize: '2rem', lineHeight: 1.1, letterSpacing: '1px' }}>Coup de cœur</div>
                                <div style={{ fontSize: '0.9rem', letterSpacing: '4px', textTransform: 'uppercase', marginTop: '0.6rem' }}>voyageurs</div>
                            </div>
                            {/* Branche Laurier Droite */}
                            <svg width="40" height="50" viewBox="0 0 32 40" fill="none" stroke="var(--ayana-text)" strokeWidth="1.2" style={{ transform: 'scaleX(-1)' }}>
                                <path d="M26 38 C 10 32, 2 18, 14 4 C 14 4, 10 10, 10 16 C 10 22, 16 26, 26 38" />
                                <path d="M20 30 C 14 28, 10 24, 8 20" />
                                <path d="M16 22 C 10 18, 8 12, 12 8" />
                            </svg>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', fontSize: '1.3rem', fontWeight: 500, borderTop: '1px solid var(--ayana-border)', paddingTop: '1.5rem', borderBottom: '1px solid var(--ayana-border)', paddingBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                5,0 <span style={{ fontSize: '0.9rem', color: 'var(--ayana-text)' }}>★</span>
                            </div>
                            <div style={{ color: 'var(--ayana-border)', fontSize: '1.5rem' }}>|</div>
                            <div style={{ fontSize: '1.1rem' }}>Sublime</div>
                        </div>
                    </div>
                </div>

                {/* Titre standard optionnel */}
                <div style={{ textAlign: 'center', marginBottom: '4rem' }} className="ayana-animate">
                    <SectionSubtitle>Témoignages</SectionSubtitle>
                    <SectionTitle>L'Expérience de nos Invités</SectionTitle>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', marginBottom: '4rem' }}>
                    {visibleReviews.map((rev, idx) => (
                        <ReviewCard key={idx} {...rev} />
                    ))}
                </div>

                <div style={{ textAlign: 'center' }} className="ayana-animate">
                    <button 
                        onClick={() => setShowAll(!showAll)}
                        className="ayana-btn-outline" 
                        style={{ padding: '1rem 3rem', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.95rem', background: 'transparent', transition: 'all 0.3s ease' }}
                    >
                        {showAll ? "Réduire les commentaires" : "Voir plus de commentaires"}
                    </button>
                </div>
            </div>
        </section>
    );
};

const ReviewCard = ({ name, location, date, text }) => {
    return (
        <div className="ayana-animate" style={{ backgroundColor: 'var(--ayana-bg)', padding: '2.5rem 2rem', border: '1px solid var(--ayana-border)', display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h4 style={{ fontFamily: 'var(--ayana-font-heading)', fontSize: '1.3rem', color: 'var(--ayana-text)', marginBottom: '0.3rem' }}>{name}</h4>
                    {location && <div style={{ fontSize: '0.9rem', color: 'var(--ayana-muted)' }}>{location}</div>}
                </div>
                <div style={{ color: 'var(--ayana-text)', fontSize: '1rem', letterSpacing: '2px' }}>
                    ★★★★★
                </div>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--ayana-muted)' }}>
                {date}
            </div>
            <p style={{ color: 'var(--ayana-text)', lineHeight: 1.7, fontSize: '0.95rem', opacity: 0.9 }}>
                "{text}"
            </p>
        </div>
    );
};

export default Home;
