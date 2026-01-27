import React, { useState } from 'react';
import { useSanctuum } from '../../context/SanctuumContext';
import { useLanguage } from '../../context/LanguageContext';
import { Settings, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import { scanMarket } from './ListingLabService';

const PricingPage = () => {
    const { currentChalet, formatPrice } = useSanctuum(); // ADDED formatPrice
    const { t } = useLanguage();

    const [baseRate, setBaseRate] = useState(currentChalet?.baseNightPrice || 850);
    const [weekendMult, setWeekendMult] = useState(currentChalet?.weekendMultiplier || 1.2);

    const [labData, setLabData] = useState(null);
    const [labLoading, setLabLoading] = useState(false);

    if (!currentChalet) return <div>{t('loading')}</div>;

    const runListingLab = async () => {
        setLabLoading(true);
        try {
            // Fallback URL for demo if chalet has none
            const url = currentChalet.airbnbUrl || "https://www.airbnb.com/rooms/plus/22674258";
            const data = await scanMarket(url);
            console.log('Listing Lab Data:', data);
            setLabData(data);
        } catch (error) {
            console.error(error);
            alert("Scan failed: " + error.message);
        } finally {
            setLabLoading(false);
        }
    };

    return (
        <div>
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', marginBottom: '2rem', border: '1px solid var(--color-primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Listing Lab Intelligence</h3>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                            Analyzes your Airbnb listing against live competitors using Supabase Edge Functions.
                        </p>
                    </div>
                    <button
                        onClick={runListingLab}
                        className="btn-primary"
                        disabled={labLoading}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        {labLoading ? 'Scanning...' : 'Scan Market'}
                        {!labLoading && <TrendingUp size={16} />}
                    </button>
                </div>

                {labData && (
                    <div style={{ marginTop: '1.5rem', animation: 'fadeIn 0.5s' }}>
                        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                            <h4 style={{ marginBottom: '0.5rem', color: '#10b981' }}>Analysis Complete</h4>
                            <pre style={{ fontSize: '0.75rem', overflowX: 'auto', color: 'var(--color-text-muted)' }}>
                                {JSON.stringify(labData, null, 2)}
                            </pre>
                        </div>
                    </div>
                )}
            </div>
            <div style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{t('nav_pricing')}</h2>
                <p style={{ color: 'var(--color-text-muted)' }}>{t('pricing_smart_adjust')}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>

                {/* BASE RATE CARD */}
                <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                                <Settings size={20} />
                            </div>
                            <h3 style={{ fontSize: '1.1rem' }}>{t('pricing_base_rate')}</h3>
                        </div>
                        <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>{formatPrice(baseRate)}</span>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <input
                            type="range"
                            min="500" max="2500" step="50"
                            value={baseRate}
                            onChange={(e) => setBaseRate(Number(e.target.value))}
                            style={{ width: '100%', accentColor: 'var(--color-primary)' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                            <span>{formatPrice(500)}</span>
                            <span>{formatPrice(2500)}</span>
                        </div>
                    </div>
                </div>

                {/* MULTIPLIERS CARD */}
                <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                                <TrendingUp size={20} />
                            </div>
                            <h3 style={{ fontSize: '1.1rem' }}>{t('pricing_weekend_mult')}</h3>
                        </div>
                        <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>x{weekendMult}</span>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <input
                            type="range"
                            min="1.0" max="2.0" step="0.1"
                            value={weekendMult}
                            onChange={(e) => setWeekendMult(Number(e.target.value))}
                            style={{ width: '100%', accentColor: 'var(--color-primary)' }}
                        />
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                        <b style={{ color: '#fff' }}>Impact:</b> Weekend nights calculated at {formatPrice(baseRate * weekendMult)}.
                    </div>
                </div>

                {/* ACTIVE STRATEGY */}
                <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', gridColumn: '1 / -1' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>{t('pricing_active_strategy')}</h3>

                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', borderRadius: 'var(--radius-md)' }}>
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }}></div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600 }}>Dynamic Yield V2</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Adjusts based on local occupancy velocity.</div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default PricingPage;
