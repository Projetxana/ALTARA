import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSanctuum } from '../../context/SanctuumContext';
import { useLanguage } from '../../context/LanguageContext';
import { ArrowLeft, Settings, BarChart2, Calendar, DollarSign } from 'lucide-react';
import PlatformConnectionPanel from '../sync/PlatformConnectionPanel';
import ListingLabPanel from './ListingLabPanel';

const PropertyDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { chalets, formatPrice } = useSanctuum();
    const { t } = useLanguage();

    const chalet = chalets.find(c => c.id === id);

    if (!chalet) return <div>Chalet not found</div>;

    return (
        <div>
            {/* Nav Back */}
            <button
                onClick={() => navigate('/properties')}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '2rem' }}
            >
                <ArrowLeft size={18} /> {t('nav_properties')}
            </button>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem' }}>{chalet.name}</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div className="glass-panel" style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }}></span>
                        <span style={{ fontSize: '0.9rem' }}>{t('soul_active')}</span>
                    </div>
                </div>
            </div>

            {/* Manual Edit & Airbnb Sync */}
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', marginBottom: '3rem', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem' }}>Property Configuration</h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

                    {/* Manual Price Edit */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Base Night Price (€)</label>
                        <input
                            type="number"
                            defaultValue={chalet.baseNightPrice}
                            style={{
                                width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)',
                                background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', color: 'white', fontSize: '1.2rem'
                            }}
                        />
                    </div>

                    {/* Airbnb Sync */}
                    <div style={{ paddingLeft: '2rem', borderLeft: '1px solid var(--color-border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <img src="https://upload.wikimedia.org/wikipedia/commons/6/69/Airbnb_Logo_B%C3%A9lo.svg" width="24" alt="Airbnb" />
                            <h4 style={{ margin: 0 }}>Import from Airbnb</h4>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                            Auto-fill price and details from your live listing.
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                placeholder="Paste Airbnb URL here..."
                                id="airbnb-import-url"
                                style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', color: 'white' }}
                            />
                            <button
                                className="btn-primary"
                                onClick={async () => {
                                    const urlInput = document.getElementById('airbnb-import-url').value;
                                    if (!urlInput) return alert("Please enter a URL first");

                                    try {
                                        const { MarketDataService } = await import('../../services/MarketDataService');
                                        const details = await MarketDataService.fetchListingDetails(urlInput);

                                        if (details) {
                                            alert(`Imported! Found Price: ${details.price_per_night}`);
                                            // TODO: Update state/context with details.price_per_night
                                            // This requires adding an updateChalet action to SanctuumContext
                                        }
                                    } catch (e) {
                                        console.error("Import Error Details:", e);
                                        alert(`Import Failed: ${e.message}\n\nTroubleshooting:\n1. Check your RapidAPI Key in Vercel Settings.\n2. Ensure you are subscribed to 'Airbnb (3B Data)' API.\n3. Verify VITE_RAPIDAPI_HOST is 'airbnb13.p.rapidapi.com'.`);
                                    }
                                }}
                            >
                                Import
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Existing Stats Display (Read Only) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '3rem', opacity: 0.7 }}>
                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>
                        <DollarSign size={18} />
                        <span style={{ fontSize: '0.9rem' }}>{t('prop_base_price')}</span>
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 600 }}>{formatPrice(chalet.baseNightPrice)}</div>
                </div>
                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>
                        <Calendar size={18} />
                        <span style={{ fontSize: '0.9rem' }}>{t('prop_min_stay')}</span>
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 600 }}>{chalet.minStay} {t('nights')}</div>
                </div>
                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>
                        <BarChart2 size={18} />
                        <span style={{ fontSize: '0.9rem' }}>{t('analytics_occupancy')}</span>
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 600 }}>85%</div>
                </div>
            </div>

            {/* Platform Connections */}
            <div style={{ marginBottom: '3rem' }}>
                <PlatformConnectionPanel chalet={chalet} />
            </div>

            {/* LISTING LAB MODULE */}
            <div style={{ marginBottom: '3rem' }}>
                <ListingLabPanel chalet={chalet} />
            </div>
        </div>
    );
};

export default PropertyDetail;
