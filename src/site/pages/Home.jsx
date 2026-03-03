import React, { useState } from 'react';
import { Bath, TreePine, Utensils, Wifi, Mountain, Leaf } from 'lucide-react';
import Book from './Book';

const Home = () => {
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

            {/* 4. SPA THERMAL */}
            <section id="spa" style={{ padding: '10rem 2rem', backgroundColor: 'var(--ayana-surface)' }}>
                <div className="ayana-container">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '6rem', alignItems: 'center' }}>
                        <div className="ayana-animate">
                            <SectionSubtitle>Le Cœur du Concept</SectionSubtitle>
                            <SectionTitle>Sanctuaire de Bien-être</SectionTitle>
                            <p style={{ color: 'var(--ayana-muted)', fontSize: '1.2rem', lineHeight: 1.8, marginBottom: '3rem' }}>
                                Cœur battant de l'expérience AYANA, nos installations privées sont conçues comme un voyage sensoriel vers la détente absolue pour redessiner votre équilibre intérieur.
                            </p>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                <li style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid var(--ayana-border)' }}>
                                    <span style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--ayana-accent)', marginBottom: '0.5rem' }}>Étape 01</span>
                                    <span style={{ color: 'var(--ayana-text)', fontSize: '1.2rem', display: 'block', marginBottom: '0.5rem' }}>Chaleur Enveloppante</span>
                                    <span style={{ color: 'var(--ayana-muted)', fontSize: '1rem', lineHeight: 1.6 }}>Purifiez votre corps dans la douceur de notre hammam ou la chaleur réconfortante de notre sauna sec profond.</span>
                                </li>
                                <li style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid var(--ayana-border)' }}>
                                    <span style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--ayana-accent)', marginBottom: '0.5rem' }}>Étape 02</span>
                                    <span style={{ color: 'var(--ayana-text)', fontSize: '1.2rem', display: 'block', marginBottom: '0.5rem' }}>Détente au Cœur de la Nature</span>
                                    <span style={{ color: 'var(--ayana-muted)', fontSize: '1rem', lineHeight: 1.6 }}>Laissez l'hydrothérapie de notre grand jacuzzi extérieur relâcher chaque tension pendant que vous admirez le paysage sauvage.</span>
                                </li>
                                <li>
                                    <span style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--ayana-accent)', marginBottom: '0.5rem' }}>Étape 03</span>
                                    <span style={{ color: 'var(--ayana-text)', fontSize: '1.2rem', display: 'block', marginBottom: '0.5rem' }}>Luminosité et Introspection</span>
                                    <span style={{ color: 'var(--ayana-muted)', fontSize: '1rem', lineHeight: 1.6 }}>Terminez votre rituel dans notre salle de repos, offrant une luminosité magnifique au coucher du soleil.</span>
                                </li>
                            </ul>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="ayana-animate" style={{ overflow: 'hidden', borderRadius: '4px' }}>
                                <img src="/ayana/photos/v2/spa-nouveau-2.jpg" alt="Hammam" loading="lazy" style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover' }} />
                            </div>
                            <div className="ayana-animate ayana-delay-1" style={{ overflow: 'hidden', borderRadius: '4px', marginTop: '3rem' }}>
                                <img src="/ayana/photos/v2/spa-nouveau-1.jpg" alt="Salle de repos sauna sec" loading="lazy" style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover' }} />
                            </div>
                            <div className="ayana-animate ayana-delay-1" style={{ overflow: 'hidden', borderRadius: '4px' }}>
                                <img src="/ayana/photos/v2/spa-nouveau-4.jpg" alt="Jacuzzi hiver" loading="lazy" style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover' }} />
                            </div>
                            <div className="ayana-animate ayana-delay-2" style={{ overflow: 'hidden', borderRadius: '4px', marginTop: '3rem' }}>
                                <img src="/ayana/photos/v2/spa-nouveau-3.jpg" alt="Jacuzzi coucher de soleil" loading="lazy" style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover' }} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4.5 AVIS (REVIEWS) */}
            <section id="avis" style={{ padding: '8rem 2rem', backgroundColor: 'var(--ayana-surface)', borderTop: '1px solid var(--ayana-border)' }}>
                <div className="ayana-container">
                    <div style={{ textAlign: 'center', marginBottom: '5rem' }} className="ayana-animate">
                        <SectionSubtitle>Témoignages</SectionSubtitle>
                        <SectionTitle>L'Expérience de nos Invités</SectionTitle>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
                        <ReviewCard
                            name="Derek"
                            rating={5}
                            date="Hiver 2024"
                            text="Réservez-le immédiatement! Dès le moment où j'ai réservé jusqu'au moment où je suis parti, c'était tout ce que j'espérais. Le logement est absolument magnifique avec un décor bien pensé, de belles vues et toutes les commodités dont vous avez besoin pour le bien-être mental et physique. Je reviendrai !"
                        />
                        <ReviewCard
                            name="Céline"
                            rating={5}
                            date="Hiver 2024"
                            text="L'appartement de Nadia était impeccable et l'endroit idéal pour une escapade de fin de semaine et se détendre. Elle était communicative et tout était très fluide. Je recommanderais définitivement cet endroit à tout le monde."
                        />
                        <ReviewCard
                            name="Cindy N."
                            rating={10}
                            date="Février 2026"
                            text="Nous avons passé un excellent séjour au chalet! Nous avons été formidablement bien accueilli avec un petit mot de Nadia et Jérôme ainsi que de petites attentions. [...] Le chalet est propre, très confortable avec des installations de grande qualité. La vue est magnifique ! Tous les ingrédients étaient réunis pour décrocher le temps d'une fin de semaine ! Nous y reviendrons avec plaisir !"
                            maxRating={10}
                        />
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

            {/* 6. CONTACT & ACCÈS */}
            <section id="contact" style={{ padding: '8rem 0 0 0', backgroundColor: 'var(--ayana-surface)', borderTop: '1px solid var(--ayana-border)' }}>
                <div className="ayana-container" style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <SectionTitle>Contact</SectionTitle>

                    {/* Contact Info Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginTop: '3rem', color: 'var(--ayana-muted)', fontStyle: 'italic', fontSize: '1.05rem' }}>
                        <div>ayana@ayana.com</div>
                        <div style={{ borderLeft: '1px solid var(--ayana-border)', borderRight: '1px solid var(--ayana-border)' }}>
                            5135 rue de la Tortille, Sainte-Adèle
                        </div>
                        <div>Tél : +1 (514) 776-7361</div>
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
        "/ayana/photos/gallery-01.jpg",
        "/ayana/photos/gallery-06.jpg",
        "/ayana/photos/gallery-07.jpg",
        "/ayana/photos/gallery-13.jpg",
        "/ayana/photos/gallery-16.jpg",
        "/ayana/photos/gallery-10.jpg"
    ];

    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % images.length);
    const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

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
                            transition: 'opacity 0.8s ease-in-out',
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

const ReviewCard = ({ name, rating, maxRating = 5, date, text }) => {
    // Generate star or rating string
    const ratingDisplay = maxRating === 5
        ? '★'.repeat(rating) + '☆'.repeat(maxRating - rating)
        : `${rating}/${maxRating}`;

    return (
        <div className="ayana-animate" style={{ backgroundColor: 'var(--ayana-bg)', padding: '3rem 2rem', border: '1px solid var(--ayana-border)', display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h4 style={{ fontFamily: 'var(--ayana-font-heading)', fontSize: '1.4rem', color: 'var(--ayana-text)', marginBottom: '0.2rem' }}>{name}</h4>
                    <span style={{ fontSize: '0.9rem', color: 'var(--ayana-muted)' }}>{date}</span>
                </div>
                <div style={{ color: 'var(--ayana-accent)', fontSize: '1.2rem', letterSpacing: '2px' }}>
                    {ratingDisplay}
                </div>
            </div>
            <p style={{ color: 'var(--ayana-text)', lineHeight: 1.8, fontSize: '1.05rem', fontStyle: 'italic', opacity: 0.9 }}>
                "{text}"
            </p>
        </div>
    );
};

export default Home;
