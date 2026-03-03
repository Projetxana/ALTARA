import React from 'react';
import { Link } from 'react-router-dom';

const Location = () => {
    return (
        <div style={{ backgroundColor: 'var(--ayana-bg)' }}>
            <div style={{ padding: '10rem 2rem 6rem', textAlign: 'center', backgroundColor: 'var(--ayana-surface)', borderBottom: '1px solid var(--ayana-border)' }}>
                <h1 className="ayana-animate" style={{ fontFamily: 'var(--ayana-font-heading)', fontSize: 'clamp(3rem, 5vw, 4.5rem)', marginBottom: '1.5rem', fontWeight: 300, color: 'var(--ayana-text)' }}>Localisation & Accès</h1>
                <p className="ayana-animate ayana-delay-1" style={{ color: 'var(--ayana-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.8 }}>
                    Immergez-vous au cœur du domaine forestier, à seulement 1h30 de l'effervescence montréalaise.
                </p>
            </div>

            <section style={{ padding: '8rem 2rem' }}>
                <div className="ayana-container">
                    <div className="ayana-card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ height: '450px', width: '100%', backgroundColor: '#eee' }}>
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1m2!1s0x4ccf2ba2b05b637f%3A0x6bba59c03db60d95!2sLes%20Laurentides%2C%20QC!5e0!3m2!1sen!2sca!4v1700000000000!5m2!1sen!2sca"
                                width="100%" height="100%" loading="lazy" style={{ border: 0, filter: 'grayscale(100%) opacity(0.8)' }} allowFullScreen="" referrerPolicy="no-referrer-when-downgrade" title="Carte Localisation">
                            </iframe>
                        </div>

                        <div style={{ padding: '4rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '4rem', backgroundColor: 'var(--ayana-surface)' }}>
                            <div>
                                <h3 style={{ fontFamily: 'var(--ayana-font-heading)', fontSize: '1.8rem', marginBottom: '1.5rem', fontWeight: 400, color: 'var(--ayana-text)' }}>L'Adresse</h3>
                                <div style={{ borderBottom: '1px solid var(--ayana-border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                                    <p style={{ color: 'var(--ayana-text)', fontWeight: 500 }}>Chemin de la Rivière</p>
                                    <p style={{ color: 'var(--ayana-muted)' }}>Mont-Tremblant, QC</p>
                                    <p style={{ color: 'var(--ayana-muted)' }}>Canada</p>
                                </div>
                                <p style={{ color: 'var(--ayana-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>*L'adresse exacte et le code d'accès vous seront communiqués 48h avant votre arrivée.</p>
                            </div>

                            <div>
                                <h3 style={{ fontFamily: 'var(--ayana-font-heading)', fontSize: '1.8rem', marginBottom: '1.5rem', fontWeight: 400, color: 'var(--ayana-text)' }}>Points d'intérêts proches</h3>
                                <ul style={{ listStyle: 'none', padding: 0, color: 'var(--ayana-muted)', lineHeight: 2 }}>
                                    <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--ayana-border)' }}><span>Station de Ski Tremblant</span> <span>15 min</span></li>
                                    <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--ayana-border)' }}><span>Parc National (Oka/Tremblant)</span> <span>10 min</span></li>
                                    <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--ayana-border)' }}><span>Pistes de vélo de montagne</span> <span>Sur place</span></li>
                                    <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--ayana-border)' }}><span>Accès Rivière & Lac</span> <span>5 min</span></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '6rem' }}>
                        <Link to="/ayana/book" className="ayana-btn" style={{ padding: '1rem 3rem' }}>
                            Consulter le calendrier de réservation
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Location;
