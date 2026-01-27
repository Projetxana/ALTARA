import React, { useState } from 'react';
import { useSanctuum } from '../../context/SanctuumContext';
import { useNotification } from '../../context/NotificationContext';
import { RefreshCw, Link2, CheckCircle, AlertCircle } from 'lucide-react';
import { SyncEngine } from '../../services/SyncEngine';

const PlatformConnectionPanel = ({ chalet }) => {
    const { updateChaletConnections, platforms } = useSanctuum();
    const { addNotification } = useNotification();
    const [syncing, setSyncing] = useState(false);

    // Initial state from chalet or defaults
    const [connections, setConnections] = useState(chalet.connections || {});

    const handleUrlChange = (platformId, url) => {
        setConnections(prev => ({
            ...prev,
            [platformId]: url
        }));
    };

    const handleSave = () => {
        updateChaletConnections(chalet.id, connections);
        addNotification('success', 'Connections Saved', 'iCal URLs have been updated.');
    };

    const handleManualSync = async () => {
        setSyncing(true);
        addNotification('info', 'Sync Started', 'Fetching latest calendars...');

        try {
            const stats = await SyncEngine.syncNow(chalet.id, connections);
            setSyncing(false);

            if (stats && stats.imported > 0) {
                addNotification('success', 'Sync Complete', `Imported ${stats.imported} bookings. (${stats.errors} errors)`);
            } else if (stats && stats.errors > 0) {
                addNotification('warning', 'Sync Issue', `Completed with ${stats.errors} errors.`);
            } else {
                addNotification('success', 'Up to Date', 'No new bookings found.');
            }
        } catch (err) {
            setSyncing(false);
            console.error(err);
            addNotification('error', 'Sync Failed', 'Could not connect to calendar proxy.');
        }
    };

    return (
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Platform Connections</h3>
                    <p style={{ color: 'var(--color-text-muted)' }}>Manage iCal synchronization for {chalet.name}</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={handleSave}
                        style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: '#fff', cursor: 'pointer' }}>
                        Save URLs
                    </button>
                    <button
                        onClick={handleManualSync}
                        className="btn-primary"
                        disabled={syncing}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: syncing ? 0.7 : 1 }}
                    >
                        <RefreshCw size={18} className={syncing ? "spin-animation" : ""} />
                        <span>{syncing ? 'Syncing...' : 'Sync Now'}</span>
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                {platforms.map(platform => (
                    <div key={platform.id} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: platform.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Link2 size={20} color="#fff" />
                        </div>

                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <label style={{ fontWeight: 600 }}>{platform.name}</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
                                    {connections[platform.id] ? (
                                        <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><CheckCircle size={12} /> CONNECTED</span>
                                    ) : (
                                        <span style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><AlertCircle size={12} /> NOT CONFIGURED</span>
                                    )}
                                </div>
                            </div>
                            <input
                                type="text"
                                placeholder={`Paste ${platform.name} iCal URL here...`}
                                value={connections[platform.id] || ''}
                                onChange={(e) => handleUrlChange(platform.id, e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    background: 'rgba(0,0,0,0.2)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-md)',
                                    color: '#fff',
                                    fontSize: '0.9rem'
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* EXPORT SECTION */}
            <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Sync to Airbnb / Booking (Export)</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                    Copy this URL and paste it into Airbnb's "Import Calendar" section to block dates reserved in ALTARA.
                </p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                        readOnly
                        value={`${window.location.origin}/api/feed?chaletId=${chalet.id}`}
                        style={{ flex: 1, padding: '0.5rem', background: 'rgba(0,0,0,0.3)', border: 'none', color: 'var(--color-text-muted)', borderRadius: '4px', fontSize: '0.85rem', fontFamily: 'monospace' }}
                    />
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/api/feed?chaletId=${chalet.id}`);
                            addNotification('success', 'Copied', 'Export URL copied to clipboard');
                        }}
                        style={{ background: 'var(--color-primary)', border: 'none', borderRadius: '4px', padding: '0 1rem', cursor: 'pointer', fontWeight: 600 }}
                    >
                        COPY
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes spin { 100% { transform: rotate(360deg); } }
                .spin-animation { animation: spin 1s linear infinite; }
            `}</style>
        </div>
    );
};

export default PlatformConnectionPanel;
