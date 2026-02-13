import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSanctuum } from '../../context/SanctuumContext';
import { useLanguage } from '../../context/LanguageContext';
import { ArrowLeft, Settings, BarChart2, Calendar, DollarSign, Trash2 } from 'lucide-react';
import PlatformConnectionPanel from '../sync/PlatformConnectionPanel';
import ListingLabPanel from './ListingLabPanel';

const PropertyDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { chalets, formatPrice, updateChalet, deleteChalet } = useSanctuum();
    const { t } = useLanguage();
    const [isEditing, setIsEditing] = React.useState(false);

    const chalet = chalets.find(c => c.id === id);

    if (!chalet) return <div>Chalet not found</div>;

    const [editForm, setEditForm] = React.useState({
        name: chalet.name,
        location: chalet.location || '',
        description: chalet.description || '',
        minStay: chalet.minStay || 2
    });

    const handleSaveDetails = () => {
        updateChalet(chalet.id, editForm);
        setIsEditing(false);
    };

    const handleDelete = async () => {
        await deleteChalet(chalet.id);
        navigate('/properties');
    };

    return (
        <div>
            {/* Nav Back */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <button
                    onClick={() => navigate('/properties')}
                    style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                >
                    <ArrowLeft size={18} /> {t('nav_properties')}
                </button>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    {isEditing ? (
                        <>
                            <button
                                onClick={() => setIsEditing(false)}
                                style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveDetails}
                                className="btn-primary"
                            >
                                Save Changes
                            </button>
                        </>
                    ) : (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                onClick={() => setIsEditing(true)}
                                style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', background: 'transparent', border: '1px solid var(--color-border)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                <Settings size={16} /> Edit Property
                            </button>
                            <button
                                onClick={handleDelete}
                                style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                <Trash2 size={16} /> Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Header / Edit Form */}
            <div style={{ marginBottom: '3rem' }}>
                {isEditing ? (
                    <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Property Name</label>
                            <input
                                type="text"
                                value={editForm.name}
                                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', color: 'white', fontSize: '1.2rem' }}
                            />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Location</label>
                            <input
                                type="text"
                                value={editForm.location}
                                onChange={e => setEditForm({ ...editForm, location: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', color: 'white' }}
                            />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Description</label>
                            <textarea
                                value={editForm.description}
                                rows={3}
                                onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', color: 'white' }}
                            />
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{chalet.name}</h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--color-text-muted)' }}>
                                <span>{chalet.location}</span>
                                <div className="glass-panel" style={{ padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', border: 'none' }}>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }}></span>
                                    <span style={{ fontSize: '0.8rem', color: '#10b981' }}>{t('soul_active')}</span>
                                </div>
                            </div>
                            {chalet.description && <p style={{ marginTop: '1rem', maxWidth: '600px', lineHeight: 1.6 }}>{chalet.description}</p>}
                        </div>
                    </div>
                )}
            </div>

            {/* Manual Edit & Airbnb Sync */}
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', marginBottom: '3rem', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem' }}>Property Configuration</h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

                    {/* Manual Price Edit */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Base Night Price ({formatPrice(0).replace(/\d|\s/g, '')})</label>
                        <input
                            type="number"
                            defaultValue={chalet.baseNightPrice || 0}
                            onChange={(e) => updateChalet(chalet.id, { baseNightPrice: parseFloat(e.target.value) })}
                            style={{
                                width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)',
                                background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', color: 'white', fontSize: '1.2rem'
                            }}
                        />
                    </div>

                    {/* Photo URL Edit */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Photo URL</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                placeholder="https://..."
                                defaultValue={chalet.image_url || ''}
                                id="photo-url-input"
                                style={{
                                    flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)',
                                    background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', color: 'white', fontSize: '1rem'
                                }}
                            />
                            <button
                                className="btn-primary"
                                onClick={() => {
                                    const url = document.getElementById('photo-url-input').value;
                                    updateChalet(chalet.id, { image_url: url });
                                    alert('Photo URL saved!');
                                }}
                            >
                                Save
                            </button>
                        </div>
                        {chalet.image_url && (
                            <div style={{ marginTop: '1rem', borderRadius: 'var(--radius-md)', overflow: 'hidden', height: '150px', border: '1px solid var(--color-border)' }}>
                                <img src={chalet.image_url} alt="Chalet" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                        )}
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
                    <div style={{ fontSize: '1.75rem', fontWeight: 600 }}>{formatPrice(chalet.baseNightPrice || 0)}</div>
                </div>
                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>
                        <Calendar size={18} />
                        <span style={{ fontSize: '0.9rem' }}>{t('prop_min_stay')}</span>
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 600 }}>{chalet.minStay || 2} {t('nights')}</div>
                </div>
                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>
                        <BarChart2 size={18} />
                        <span style={{ fontSize: '0.9rem' }}>{t('analytics_occupancy')}</span>
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 600 }}>0%</div>
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
