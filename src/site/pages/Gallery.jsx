import React from 'react';

const Gallery = () => {
    // Generate array for all gallery images available
    const images = Array.from({ length: 19 }, (_, i) => `/ayana/photos/gallery-${String(i + 1).padStart(2, '0')}.jpg`);

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
        <div style={{ paddingTop: '80px', minHeight: '100vh', backgroundColor: 'var(--color-bg-main)' }}>
            <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '3.5rem', marginBottom: '1rem' }}>Galerie</h1>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
                    Explorez l'architecture et les espaces du Chalet Ayana en images.
                </p>
            </div>

            <div style={{ padding: '0 2rem 4rem', maxWidth: '1600px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                {allImages.map((src, index) => (
                    <div key={index} style={{ position: 'relative', paddingTop: '100%', overflow: 'hidden', borderRadius: '8px' }} className="gallery-item">
                        <img
                            src={src}
                            alt={`Galerie ${index + 1}`}
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                    </div>
                ))}
            </div>

            {/* Inject simple CSS for hover effect */}
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
