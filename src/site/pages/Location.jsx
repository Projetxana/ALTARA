import React from 'react';
import { Link } from 'react-router-dom';

const Location = () => {
    return (
        <div style={{ paddingTop: '80px', minHeight: '100vh', backgroundColor: 'var(--color-bg-main)' }}>
            <div style={{ padding: '6rem 2rem', textAlign: 'center' }}>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '3.5rem', marginBottom: '1rem' }}>Localisation</h1>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
                    Situé au cœur du domaine forestier, à seulement 1h30 de Montréal.
                </p>
            </div>

            <section style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 2rem 6rem' }}>
                <div className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                    {/* Placeholder for Map - Since we don't have an API key right now, use an image if available or generic iframe */}
                    <div style={{ height: '400px', width: '100%', backgroundColor: '#eee' }}>
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1m2!1s0x4ccf2ba2b05b637f%3A0x6bba59c03db60d95!2sLes%20Laurentides%2C%20QC!5e0!3m2!1sen!2sca!4v1700000000000!5m2!1sen!2sca"
                            width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Carte Localisation">
                        </iframe>
                    </div>

                    <div style={{ padding: '3rem 2rem', display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 2fr', gap: '2rem' }}>
                        <div>
                            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '1rem' }}>Accès</h3>
                            <p style={{ color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Domaine des Légendes</p>
                            <p style={{ color: 'var(--color-text-muted)' }}>Mont-Tremblant, Qc</p>
                        </div>
                        <div>
                            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '1rem' }}>À Proximité</h3>
                            <ul style={{ color: 'var(--color-text-muted)', paddingLeft: '1.5rem', lineHeight: 1.8 }}>
                                <li>Station de Ski Tremblant (15 min)</li>
                                <li>Parc National du Mont-Tremblant (10 min)</li>
                                <li>Pistes de vélo de montagne (sur place)</li>
                                <li>Accès Rivière (5 min à pied)</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                    <Link to="/book" className="btn-primary" style={{ textDecoration: 'none', padding: '1rem 3rem', fontSize: '1.1rem' }}>
                        Voir les Dates Disponibles
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Location;
