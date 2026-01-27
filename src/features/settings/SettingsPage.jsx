import React, { useState } from 'react'; // ADDED React, useState
import { useNavigate } from 'react-router-dom';
import { useSanctuum } from '../../context/SanctuumContext';
import { useLanguage } from '../../context/LanguageContext';
import { User, Bell, Shield, Smartphone, LogOut, Globe } from 'lucide-react';

const SettingsPage = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { currency, setCurrency } = useSanctuum();
    const [activeTab, setActiveTab] = useState('profile');

    return (
        <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>{t('nav_settings')}</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '3rem' }}>

                {/* MENU */}
                <div className="glass-panel" style={{ padding: '1rem', borderRadius: 'var(--radius-lg)', height: 'fit-content' }}>
                    <button
                        onClick={() => setActiveTab('profile')}
                        style={{
                            width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem',
                            background: activeTab === 'profile' ? 'rgba(255,255,255,0.05)' : 'transparent',
                            border: 'none', borderRadius: 'var(--radius-md)', color: activeTab === 'profile' ? '#fff' : 'var(--color-text-muted)',
                            cursor: 'pointer', textAlign: 'left', marginBottom: '0.5rem'
                        }}
                    >
                        <User size={18} /> Profile
                    </button>
                    <button
                        onClick={() => setActiveTab('preferences')}
                        style={{
                            width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem',
                            background: activeTab === 'preferences' ? 'rgba(255,255,255,0.05)' : 'transparent',
                            border: 'none', borderRadius: 'var(--radius-md)', color: activeTab === 'preferences' ? '#fff' : 'var(--color-text-muted)',
                            cursor: 'pointer', textAlign: 'left', marginBottom: '0.5rem'
                        }}
                    >
                        <Globe size={18} /> Preferences
                    </button>
                    <button
                        onClick={() => setActiveTab('notifications')}
                        style={{
                            width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem',
                            background: activeTab === 'notifications' ? 'rgba(255,255,255,0.05)' : 'transparent',
                            border: 'none', borderRadius: 'var(--radius-md)', color: activeTab === 'notifications' ? '#fff' : 'var(--color-text-muted)',
                            cursor: 'pointer', textAlign: 'left', marginBottom: '0.5rem'
                        }}
                    >
                        <Bell size={18} /> Notifications
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        style={{
                            width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem',
                            background: activeTab === 'security' ? 'rgba(255,255,255,0.05)' : 'transparent',
                            border: 'none', borderRadius: 'var(--radius-md)', color: activeTab === 'security' ? '#fff' : 'var(--color-text-muted)',
                            cursor: 'pointer', textAlign: 'left', marginBottom: '0.5rem'
                        }}
                    >
                        <Shield size={18} /> Security
                    </button>

                    <button
                        onClick={() => navigate('/settings/guide-editor')}
                        style={{
                            width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem',
                            background: 'transparent',
                            border: 'none', borderRadius: 'var(--radius-md)', color: '#fff',
                            cursor: 'pointer', textAlign: 'left', marginBottom: '0.5rem'
                        }}
                    >
                        <Smartphone size={18} /> Traveler Guide
                    </button>

                    <div style={{ height: '1px', background: 'var(--color-border)', margin: '1rem 0' }}></div>

                    <button
                        style={{
                            width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem',
                            background: 'transparent',
                            border: 'none', borderRadius: 'var(--radius-md)', color: '#ef4444',
                            cursor: 'pointer', textAlign: 'left'
                        }}
                    >
                        <LogOut size={18} /> Sign Out
                    </button>
                </div>

                {/* CONTENT */}
                <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>

                    {activeTab === 'profile' && (
                        <div style={{ animation: 'fadeIn 0.3s' }}>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Profile Settings</h3>
                            {/* ... Content Omitted for Brevity ... */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '3rem' }}>
                                <div style={{
                                    width: '80px', height: '80px', borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    border: '2px solid rgba(255,255,255,0.1)',
                                    fontSize: '1.5rem', fontWeight: 600
                                }}>
                                    JD
                                </div>
                                <div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.25rem' }}>Jerome D.</div>
                                    <div style={{ color: 'var(--color-text-muted)' }}>Admin • jerome@altara.com</div>
                                </div>
                                <button className="btn-primary" style={{ marginLeft: 'auto' }}>Upload New Photo</button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>First Name</label>
                                    <input type="text" defaultValue="Jerome" style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: '#fff' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Last Name</label>
                                    <input type="text" defaultValue="D." style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: '#fff' }} />
                                </div>
                                <div style={{ gridColumn: '1/-1' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Email Address</label>
                                    <input type="email" defaultValue="jerome@altara.com" style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: '#fff' }} />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'preferences' && (
                        <div style={{ animation: 'fadeIn 0.3s' }}>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Global Preferences</h3>

                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600 }}>Default Currency</label>
                                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                                    Select the currency to display for all property prices and revenues.
                                </p>
                                <select
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value)}
                                    style={{
                                        width: '100%', maxWidth: '300px',
                                        padding: '0.75rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-md)',
                                        color: '#fff',
                                        fontSize: '1rem'
                                    }}
                                >
                                    <option value="EUR">Euro (€)</option>
                                    <option value="USD">US Dollar ($)</option>
                                    <option value="CAD">Canadian Dollar (C$)</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div style={{ animation: 'fadeIn 0.3s' }}>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Notification Preferences</h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>New Bookings</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Receive alerts when a new reservation is made.</div>
                                    </div>
                                    <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px', accentColor: 'var(--color-primary)' }} />
                                </div>
                                <div style={{ height: '1px', background: 'var(--color-border)' }}></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Soul Engine Activity</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Alerts when automated rituals are triggered.</div>
                                    </div>
                                    <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px', accentColor: 'var(--color-primary)' }} />
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
