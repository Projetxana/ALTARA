import React, { useState } from 'react';
import { useSanctuum } from '../../context/SanctuumContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowRight, Plus, X } from 'lucide-react';

const PropertiesPage = () => {
    const { chalets, addChalet, formatPrice } = useSanctuum(); // ADDED
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newProperty, setNewProperty] = useState({ name: '', location: '', baseNightPrice: 500, description: '' });

    const handleSave = (e) => {
        e.preventDefault();
        addChalet(newProperty);
        setIsModalOpen(false);
        setNewProperty({ name: '', location: '', baseNightPrice: 500, description: '' });
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '2rem' }}>{t('nav_properties')}</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary"
                    style={{ gap: '0.5rem' }}
                >
                    <Plus size={18} /> {t('header_new_booking').replace('Booking', 'Property')} {/* Fallback generic text */}
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                {chalets.map(chalet => (
                    <div key={chalet.id} className="glass-panel" style={{ padding: '0', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                        {/* Placeholder Image */}
                        <div style={{ height: '200px', background: `linear-gradient(45deg, #1e293b, #334155)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '3rem', opacity: 0.1 }}>{chalet.name.charAt(0)}</span>
                        </div>

                        <div style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{chalet.name}</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                                        <MapPin size={16} /> {chalet.location}
                                    </div>
                                </div>
                            </div>

                            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem', lineHeight: '1.6', height: '3em', overflow: 'hidden' }}>
                                {chalet.description}
                            </p>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                                <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{formatPrice(chalet.baseNightPrice)} <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>/ {t('nights')}</span></div>
                                <button
                                    onClick={() => navigate(`/properties/${chalet.id}`)}
                                    style={{
                                        background: 'transparent',
                                        border: '1px solid var(--color-border)',
                                        padding: '0.5rem 1rem',
                                        borderRadius: 'var(--radius-md)',
                                        color: '#fff',
                                        cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {t('prop_view_details')} <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ADD PROPERTY MODAL */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
                    <div className="glass-panel" style={{ width: '500px', padding: '2rem', borderRadius: 'var(--radius-lg)', position: 'relative', background: '#0f172a' }}>
                        <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}><X size={20} /></button>

                        <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Add New Property</h3>

                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Property Name</label>
                                <input required type="text" value={newProperty.name} onChange={e => setNewProperty({ ...newProperty, name: e.target.value })} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: '#fff' }} placeholder="e.g. Chalet L'Olympe" />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Location</label>
                                <input required type="text" value={newProperty.location} onChange={e => setNewProperty({ ...newProperty, location: e.target.value })} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: '#fff' }} placeholder="e.g. Courchevel 1850" />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Base Night Price (€)</label>
                                <input required type="number" value={newProperty.baseNightPrice} onChange={e => setNewProperty({ ...newProperty, baseNightPrice: Number(e.target.value) })} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: '#fff' }} />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Short Description</label>
                                <textarea row="3" value={newProperty.description} onChange={e => setNewProperty({ ...newProperty, description: e.target.value })} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: '#fff' }} placeholder="Luxury ski-in ski-out chalet..." />
                            </div>

                            <button type="submit" className="btn-primary" style={{ justifyContent: 'center', marginTop: '1rem' }}>Create Property</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PropertiesPage;
