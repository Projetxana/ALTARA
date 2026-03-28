import React from 'react';
import './wellness-sanctuary.css';

const WellnessSanctuarySection = () => {
    const images = [
        "/ayana/photos/v2/spa-nouveau-2.jpg",
        "/ayana/photos/v2/japandi-towels.png",
        "/ayana/photos/v2/spa-nouveau-3.jpg",
        "/ayana/photos/v2/japandi-sauna.png",
        "/ayana/photos/v2/spa-nouveau-1.jpg",
        "/ayana/photos/v2/spa-nouveau-4.jpg"
    ];

    return (
        <section id="spa" style={{ padding: '8rem 2rem', backgroundColor: '#f5f0e6' }}>
            <div className="ayana-container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div className="ayana-animate" style={{ maxWidth: '800px', marginBottom: '4rem' }}>
                    <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '4px', color: 'var(--ayana-accent)', marginBottom: '1.5rem', fontWeight: 600 }}>
                        Le cœur du concept
                    </h3>
                    <h2 style={{ fontFamily: 'var(--ayana-font-heading)', fontSize: 'clamp(3rem, 5vw, 4.5rem)', color: 'var(--ayana-text)', marginBottom: '2.5rem', fontWeight: 300, lineHeight: 1.1 }}>
                        Sanctuaire de Bien-être
                    </h2>
                    <p style={{ color: 'var(--ayana-muted)', fontSize: '1.3rem', lineHeight: 1.6, marginBottom: '3rem', maxWidth: '700px', fontWeight: 300 }}>
                        Cœur battant de l'expérience AYANA, nos installations privées sont conçues comme un voyage sensoriel vers la détente absolue pour redessiner votre équilibre intérieur.
                    </p>
                    <hr style={{ border: 'none', borderBottom: '1px solid rgba(0,0,0,0.1)' }} />
                </div>

                {/* Pictures Grid */}
                <div className="ayana-animate" style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                    gap: '2rem' 
                }}>
                    {images.map((img, idx) => (
                        <div key={idx} style={{ aspectRatio: '3/2', overflow: 'hidden', borderRadius: '16px' }}>
                            <img src={img} alt={`Spa Ayana ${idx + 1}`} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default WellnessSanctuarySection;
