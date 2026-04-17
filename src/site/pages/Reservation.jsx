import React from 'react';
import SEO from '../components/SEO';
import Book from './Book';

const Reservation = () => {
    return (
        <div style={{ backgroundColor: 'var(--ayana-bg)', minHeight: '100vh', paddingTop: '120px' }}>
            <SEO 
                title="Réservation Chalet Spa Laurentides | Disponibilités AYANA"
                description="Consultez les disponibilités en temps réel et réservez votre chalet spa dans les Laurentides. Une expérience haut de gamme accessible en quelques clics."
                urlExt="/reservation"
            />
            
            <div className="ayana-container">
                <div className="ayana-animate" style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 6rem' }}>
                    <h1 style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', fontFamily: 'var(--ayana-font-heading)', marginBottom: '3rem', fontWeight: 300, color: 'var(--ayana-text)', lineHeight: 1.1, textTransform: 'uppercase', letterSpacing: '2px' }}>
                        Réservez votre séjour
                    </h1>
                    <p style={{ color: 'var(--ayana-muted)', fontSize: '1.4rem', lineHeight: 1.8, fontWeight: 300 }}>
                        Consultez les disponibilités en temps réel et choisissez vos dates en toute simplicité.<br/>Chaque réservation est préparée avec soin pour garantir une expérience sans compromis.
                    </p>
                </div>

                <section style={{ margin: '4rem 0' }}>
                    <div style={{ backgroundColor: 'var(--ayana-surface)', borderRadius: '8px', padding: '1rem', boxShadow: '0 20px 40px rgba(0,0,0,0.03)' }}>
                        <Book />
                    </div>
                </section>

                <section style={{ margin: '10rem 0' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem', textAlign: 'center' }}>
                        <div style={{ padding: '3rem', border: '1px solid var(--ayana-border)', borderRadius: '4px', backgroundColor: 'var(--ayana-surface)' }}>
                            <div style={{ color: 'var(--ayana-accent)', marginBottom: '1.5rem' }}>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                            </div>
                            <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--ayana-font-heading)', marginBottom: '1rem', fontWeight: 300 }}>Paiement sécurisé</h3>
                        </div>
                        <div style={{ padding: '3rem', border: '1px solid var(--ayana-border)', borderRadius: '4px', backgroundColor: 'var(--ayana-surface)' }}>
                            <div style={{ color: 'var(--ayana-accent)', marginBottom: '1.5rem' }}>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            </div>
                            <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--ayana-font-heading)', marginBottom: '1rem', fontWeight: 300 }}>Disponibilités en temps réel</h3>
                        </div>
                        <div style={{ padding: '3rem', border: '1px solid var(--ayana-border)', borderRadius: '4px', backgroundColor: 'var(--ayana-surface)' }}>
                            <div style={{ color: 'var(--ayana-accent)', marginBottom: '1.5rem' }}>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                            </div>
                            <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--ayana-font-heading)', marginBottom: '1rem', fontWeight: 300 }}>Assistance dédiée si besoin</h3>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Reservation;
