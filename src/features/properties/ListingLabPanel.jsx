import React, { useState } from 'react';
import { ListingLabService } from '../../services/ListingLabService';
import { useLanguage } from '../../context/LanguageContext';
import { BarChart2, PenTool, Sparkles, Copy, RefreshCw, TrendingUp, MapPin, Camera, Star } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

const ListingLabPanel = ({ chalet }) => {
    const { addNotification } = useNotification();
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState('market'); // market | content | offers
    const [generatedContent, setGeneratedContent] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [offers, setOffers] = useState(null);
    const [loading, setLoading] = useState(false);

    // ACTION HANDLERS
    const handleAnalyze = async () => {
        setLoading(true);
        const airbnbUrl = chalet.connections && chalet.connections.airbnb;

        try {
            const result = await ListingLabService.analyzeMarket(chalet, airbnbUrl);
            setAnalysis(result);
        } catch (error) {
            console.error("Analysis Failed:", error);
            if (error.message === 'MISSING_API_KEY') {
                addNotification('error', 'Configuration Error', 'Market Data API key missing. Please check .env settings.');
            } else {
                addNotification('error', 'Scan Failed', 'Could not connect to market data provider.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async (angle) => {
        setLoading(true);
        // Pass real data if analysis has been run
        try {
            const content = await ListingLabService.generateListing(chalet, analysis?.competitors, angle);
            setGeneratedContent(content);
        } catch {
            addNotification('error', 'Error', 'Failed to generate content');
        } finally {
            setLoading(false);
        }
    };

    const handleArchitect = () => {
        setLoading(true);
        setTimeout(() => {
            const gap = analysis ? analysis.gapAnalysis.priceGap : 0;
            setOffers(ListingLabService.architectOffers(gap));
            setLoading(false);
        }, 1000);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        addNotification('success', t('lab_copy'), 'Content copied to clipboard.');
    };

    return (
        <div className="glass-panel" style={{ padding: '0', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            {/* HEADER */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <div style={{ background: 'linear-gradient(135deg, #d4af37 0%, #fcd34d 100%)', borderRadius: '4px', padding: '0.25rem 0.5rem', color: '#000', fontSize: '0.7rem', fontWeight: 700 }}>PRO INTELLIGENCE</div>
                    <h3 style={{ fontSize: '1.25rem' }}>ALTARA {t('lab_title')}</h3>
                </div>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                    {t('lab_subtitle')}
                </p>
            </div>

            {/* TABS */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)' }}>
                {['market', 'content', 'offers'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            flex: 1,
                            padding: '1rem',
                            background: activeTab === tab ? 'rgba(255,255,255,0.05)' : 'transparent',
                            borderBottom: activeTab === tab ? '2px solid var(--color-primary)' : 'none',
                            color: activeTab === tab ? '#fff' : 'var(--color-text-muted)',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '0.5rem',
                            textTransform: 'capitalize'
                        }}
                    >
                        {tab === 'market' && <BarChart2 size={16} />}
                        {tab === 'content' && <PenTool size={16} />}
                        {tab === 'offers' && <Sparkles size={16} />}
                        {tab}
                    </button>
                ))}
            </div>

            {/* BODY */}
            <div style={{ padding: '2rem' }}>

                {/* 1. MARKET ANALYSIS */}
                {activeTab === 'market' && (
                    <div>
                        {!analysis ? (
                            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                                <BarChart2 size={48} color="var(--color-text-muted)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-muted)' }}>Scan 10km radius for real-time competitive intelligence.</p>
                                <button className="btn-primary" onClick={handleAnalyze} disabled={loading}>
                                    {loading ? t('lab_scanning') : t('lab_scan_btn')}
                                </button>
                            </div>
                        ) : (
                            <div style={{ animation: 'fadeIn 0.5s' }}>
                                <div style={{ display: 'flex', gap: '2rem', marginBottom: '3rem' }}>
                                    <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Market Average</div>
                                        <div style={{ fontSize: '2rem', fontWeight: 600 }}>€{analysis.marketStats.average.toFixed(0)}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Based on {analysis.marketStats.count} listings</div>
                                    </div>
                                    <div style={{ flex: 1, background: 'rgba(212, 175, 55, 0.1)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-primary)' }}>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--color-primary)' }}>{t('lab_your_price')}</div>
                                        <div style={{ fontSize: '2rem', fontWeight: 600 }}>€{analysis.yourPrice}</div>
                                        <div style={{ fontSize: '0.8rem', color: analysis.gapAnalysis.priceGap > 0 ? '#10b981' : '#f43f5e', marginTop: '0.25rem' }}>
                                            {analysis.gapAnalysis.priceGap > 0 ? '+' : ''}{analysis.gapAnalysis.priceGap.toFixed(0)} Gap
                                        </div>
                                    </div>
                                </div>

                                {analysis.competitors && analysis.competitors.length > 0 && (
                                    <div style={{ marginBottom: '2rem' }}>
                                        <h4 style={{ marginBottom: '1rem' }}>Nearby Competitors</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                                            {analysis.competitors.slice(0, 4).map((comp, idx) => (
                                                <div key={idx} style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                                                    <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{comp.title}</div>

                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} /> {comp.distance_km || '?'}km</span>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Camera size={12} /> {comp.photo_count || 0}</span>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Star size={12} /> {comp.rating}</span>
                                                    </div>

                                                    <div style={{ marginTop: '0.5rem', fontWeight: 700, textAlign: 'right', fontSize: '1.1rem' }}>
                                                        €{comp.price_per_night}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <h4 style={{ marginBottom: '1rem' }}><TrendingUp size={16} style={{ display: 'inline', marginRight: '0.5rem' }} /> {t('lab_opps')}</h4>
                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    {analysis.opportunities.map((opp, idx) => (
                                        <li key={idx} style={{ marginBottom: '0.75rem', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}>
                                            • {opp}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {/* 2. LISTING GENERATOR */}
                {activeTab === 'content' && (
                    <div>
                        {!generatedContent ? (
                            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                                <PenTool size={48} color="var(--color-text-muted)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-muted)' }}>Generate premium titles & emotional descriptions based on competitor gaps.</p>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                                    <button className="btn-primary" onClick={() => handleGenerate('romantic')} disabled={loading}>Romantic</button>
                                    <button className="btn-primary" onClick={() => handleGenerate('adventure')} disabled={loading}>Adventure</button>
                                    <button className="btn-primary" onClick={() => handleGenerate('wellness')} disabled={loading}>Wellness</button>
                                </div>
                                {loading && <p style={{ marginTop: '1rem', fontStyle: 'italic', opacity: 0.7 }}>AI is optimizing content...</p>}
                            </div>
                        ) : (
                            <div style={{ animation: 'fadeIn 0.5s' }}>
                                <div style={{ marginBottom: '2rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Optimized Title</label>
                                        <button onClick={() => copyToClipboard(generatedContent.title)} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer' }}><Copy size={14} /></button>
                                    </div>
                                    <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)', fontSize: '1.1rem', fontWeight: 600 }}>{generatedContent.title}</div>
                                </div>

                                <div style={{ marginBottom: '2rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Hero Description</label>
                                        <button onClick={() => copyToClipboard(generatedContent.description)} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer' }}><Copy size={14} /></button>
                                    </div>
                                    <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)', lineHeight: '1.6', fontSize: '0.95rem' }}>{generatedContent.description}</div>
                                </div>

                                {generatedContent.improvements && (
                                    <div style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-md)' }}>
                                        <h5 style={{ color: '#10b981', marginBottom: '0.5rem' }}>Applied Improvements</h5>
                                        <ul style={{ fontSize: '0.85rem', paddingLeft: '1rem', color: 'var(--color-text-muted)' }}>
                                            {generatedContent.improvements.map((imp, i) => <li key={i}>{imp}</li>)}
                                        </ul>
                                    </div>
                                )}

                                <button onClick={() => setGeneratedContent(null)} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <RefreshCw size={14} /> {t('lab_gen_reset')}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* 3. OFFER ARCHITECT */}
                {activeTab === 'offers' && (
                    <div>
                        {!offers ? (
                            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                                <Sparkles size={48} color="var(--color-text-muted)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-muted)' }}>Design high-value offer packages.</p>
                                <button className="btn-primary" onClick={handleArchitect} disabled={loading}>
                                    {loading ? 'Architecting Offers...' : t('lab_offer_btn')}
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gap: '1.5rem', animation: 'fadeIn 0.5s' }}>
                                {offers.map(offer => (
                                    <div key={offer.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                            <h4 style={{ fontSize: '1.1rem' }}>{offer.name}</h4>
                                            <span style={{ background: '#10b981', color: '#fff', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>{offer.uplift} Revenue</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            {offer.includes.map((item, i) => (
                                                <span key={i} style={{ background: 'rgba(255,255,255,0.1)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem' }}>{item}</span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
};

export default ListingLabPanel;
