import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

const UserManualPage = () => {
    // This page is designed to be printed (Cmd+P)
    const date = new Date().toLocaleDateString();

    return (
        <div className="print-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem', background: 'white', color: 'black', minHeight: '100vh' }}>
            {/* Header for Print */}
            <div style={{ textAlign: 'center', marginBottom: '4rem', borderBottom: '2px solid #000', paddingBottom: '2rem' }}>
                <h1 style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.05em', marginBottom: '0.5rem' }}>ALTARA</h1>
                <p style={{ fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.2em', opacity: 0.7 }}>Operating System V1</p>
                <div style={{ marginTop: '2rem', fontSize: '0.9rem', fontStyle: 'italic' }}>
                    Generated on {date} • Client Configuration Guide
                </div>
            </div>

            <section style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '1.8rem', borderLeft: '4px solid #d4af37', paddingLeft: '1rem', marginBottom: '1.5rem' }}>1. Démarrage Rapide</h2>
                <p style={{ lineHeight: '1.6', marginBottom: '1rem' }}>
                    Bienvenue sur <strong>ALTARA</strong>. Ce document sert de référence pour la configuration initiale de votre environnement immobilier.
                </p>
                <ul style={{ listStyle: 'circle', paddingLeft: '1.5rem', lineHeight: '1.8' }}>
                    <li>Accédez à l'application via votre navigateur (Chrome recommandé).</li>
                    <li>Cliquez sur l'icône <strong>Paramètres (⚙️)</strong> en bas du menu.</li>
                    <li>Vérifiez vos informations dans l'onglet <strong>Profil</strong>.</li>
                </ul>
            </section>

            <section style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '1.8rem', borderLeft: '4px solid #d4af37', paddingLeft: '1rem', marginBottom: '1.5rem' }}>2. Ajouter un Bien</h2>
                <p style={{ lineHeight: '1.6', marginBottom: '1rem' }}>
                    Pour intégrer un nouveau chalet ou appartement :
                </p>
                <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <ol style={{ marginLeft: '1.5rem', lineHeight: '1.8' }}>
                        <li>Allez dans l'onglet <strong>Propriétés (Maison)</strong>.</li>
                        <li>Cliquez sur le bouton <strong>+ Property</strong>.</li>
                        <li>Remplissez la fiche (Nom, Lieu, Prix de base).</li>
                        <li>Validez. Le bien est immédiatement disponible pour la location.</li>
                    </ol>
                </div>
            </section>

            <section style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '1.8rem', borderLeft: '4px solid #d4af37', paddingLeft: '1rem', marginBottom: '1.5rem' }}>3. Listing Lab™ (IA)</h2>
                <p style={{ lineHeight: '1.6', marginBottom: '1rem' }}>
                    Notre moteur d'intelligence artificielle optimise vos annonces.
                </p>
                <p style={{ lineHeight: '1.6' }}>
                    Dans la fiche détail de chaque propriété, utilisez le panneau <strong>Listing Lab</strong> pour :
                </p>
                <ul style={{ listStyle: 'square', paddingLeft: '1.5rem', lineHeight: '1.8', marginTop: '1rem' }}>
                    <li><strong>Scanner le marché</strong> : Comparez vos prix aux voisins.</li>
                    <li><strong>Générer du contenu</strong> : Créez des descriptions émotionnelles en un clic (Romantique, Aventure, etc.).</li>
                </ul>
            </section>

            <section style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '1.8rem', borderLeft: '4px solid #d4af37', paddingLeft: '1rem', marginBottom: '1.5rem' }}>4. Synchronisation</h2>
                <p style={{ lineHeight: '1.6', marginBottom: '1rem' }}>
                    Connectez vos calendriers Airbnb/Booking pour éviter les doublons.
                </p>
                <p style={{ fontStyle: 'italic', background: '#eee', padding: '1rem' }}>
                    ⚠️ Nécessite les liens iCal (format .ics) de vos plateformes externes.
                </p>
            </section>

            <div style={{ marginTop: '5rem', textAlign: 'center', fontSize: '0.8rem', opacity: 0.5 }}>
                ALTARA REAL ESTATE SYSTEMS © 2026<br />
                Confidential Document
            </div>

            {/* Print Styles Override */}
            <style>{`
                @media print {
                    .layout-grid { display: none !important; } /* Hide sidebar if rendered inside layout */
                    body, #root { background: white !important; color: black !important; }
                    .glass-panel { box-shadow: none !important; border: 1px solid #ccc !important; }
                    button { display: none !important; }
                }
            `}</style>
        </div>
    );
};

export default UserManualPage;
