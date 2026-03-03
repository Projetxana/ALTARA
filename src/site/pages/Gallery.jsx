import React from 'react';

const Gallery = () => {
    // Generate array for all gallery images available
    const images = Array.from({ length: 21 }, (_, i) => `/ayana/photos/gallery-${String(i + 1).padStart(2, '0')}.jpg`);

    // Add specific highlight images
    const allImages = [
        '/ayana/photos/hero.jpg',
        '/ayana/photos/living.jpg',
        '/ayana/photos/kitchen.jpg',
        '/ayana/photos/bedroom-01.jpg',
        '/ayana/photos/spa.jpg',
        '/ayana/photos/sauna.jpg',
        '/ayana/photos/hammam.jpg',
        '/ayana/photos/exterior.jpg',
        ...images
    ];

    return (
        <div style={{ backgroundColor: 'var(--ayana-bg)' }}>
            <div style={{ padding: '10rem 2rem 6rem', textAlign: 'center', backgroundColor: 'var(--ayana-surface)', borderBottom: '1px solid var(--ayana-border)' }}>
                <h1 className="ayana-animate" style={{ fontFamily: 'var(--ayana-font-heading)', fontSize: 'clamp(3rem, 5vw, 4.5rem)', marginBottom: '1.5rem', fontWeight: 300, color: 'var(--ayana-text)' }}>Galerie</h1>
                <p className="ayana-animate ayana-delay-1" style={{ color: 'var(--ayana-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.8 }}>
                    Explorez la pureté de nos espaces et l'intégration harmonieuse dans la nature environnante.
                </p>
            </div>

            <div className="ayana-container" style={{ padding: '6rem 2rem 8rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
                {allImages.map((src, index) => (
                    <div key={index} style={{ position: 'relative', paddingTop: '100%', overflow: 'hidden', borderRadius: 'var(--ayana-radius)' }} className="gallery-item">
                        <img
                            src={src}
                            alt={`Galerie ${index + 1}`}
                            loading="lazy"
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}
                            onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                        />
                    </div>
                ))}
            </div>

            {/* Hover effect style injected */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .gallery-item:hover img {
                    transform: scale(1.05);
                }
            `}} />
        </div>
    );
};

export default Gallery;
