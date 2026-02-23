import React, { useState } from 'react';
import { useSanctuum } from '../../context/SanctuumContext';
import { useLanguage } from '../../context/LanguageContext';
import { ClipboardList, CheckCircle, Clock } from 'lucide-react';

const HousekeepingPage = () => {
    const { chalets, cleaningTasks, toggleCleaningTaskStatus } = useSanctuum();
    const { t } = useLanguage();

    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'pending', 'completed'

    const tasksWithChaletInfo = cleaningTasks.map(task => {
        const chalet = chalets.find(c => c.id === task.chaletId);
        return {
            ...task,
            chaletName: chalet ? chalet.name : 'Unknown Property',
            chaletLocation: chalet ? chalet.location : ''
        };
    }).sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date ascending

    const filteredTasks = tasksWithChaletInfo.filter(t => {
        if (filterStatus === 'all') return true;
        return t.status === filterStatus;
    });

    const pendingCount = tasksWithChaletInfo.filter(t => t.status === 'pending').length;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.3s ease-out' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', letterSpacing: '-0.02em' }}>
                        <span style={{
                            width: 48, height: 48, borderRadius: 'var(--radius-lg)',
                            background: 'rgba(212, 175, 55, 0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)'
                        }}>
                            <ClipboardList size={24} />
                        </span>
                        Housekeeping
                    </h1>
                    <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem', fontSize: '1.1rem' }}>
                        Manage cleaning interventions automatically generated from bookings.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={() => setFilterStatus('all')}
                        style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: 'none', background: filterStatus === 'all' ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)', color: filterStatus === 'all' ? '#000' : 'var(--color-text-main)', cursor: 'pointer', fontWeight: 600 }}>
                        All ({tasksWithChaletInfo.length})
                    </button>
                    <button
                        onClick={() => setFilterStatus('pending')}
                        style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: 'none', background: filterStatus === 'pending' ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)', color: filterStatus === 'pending' ? '#000' : 'var(--color-text-main)', cursor: 'pointer', fontWeight: 600 }}>
                        Pending ({pendingCount})
                    </button>
                    <button
                        onClick={() => setFilterStatus('completed')}
                        style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: 'none', background: filterStatus === 'completed' ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)', color: filterStatus === 'completed' ? '#000' : 'var(--color-text-main)', cursor: 'pointer', fontWeight: 600 }}>
                        Completed ({tasksWithChaletInfo.length - pendingCount})
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--color-border)', textAlign: 'left', fontSize: '0.85rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            <th style={{ padding: '1.5rem', fontWeight: 600 }}>Date</th>
                            <th style={{ padding: '1.5rem', fontWeight: 600 }}>Location</th>
                            <th style={{ padding: '1.5rem', fontWeight: 600 }}>Status</th>
                            <th style={{ padding: '1.5rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTasks.map((task) => (
                            <tr key={task.id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.2s' }}>
                                <td style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>
                                        {new Date(task.date).toLocaleDateString(navigator.language, { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' })}
                                    </div>
                                    {task.autoGenerated && (
                                        <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', color: 'var(--color-text-muted)' }}>Auto</span>
                                    )}
                                </td>
                                <td style={{ padding: '1.5rem' }}>
                                    <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>{task.chaletName}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>{task.chaletLocation}</div>
                                </td>
                                <td style={{ padding: '1.5rem' }}>
                                    <div style={{
                                        display: 'inline-flex', padding: '0.4rem 0.8rem', borderRadius: '20px', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600,
                                        background: task.status === 'completed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                        color: task.status === 'completed' ? '#10b981' : '#f59e0b'
                                    }}>
                                        {task.status === 'completed' ? <CheckCircle size={14} /> : <Clock size={14} />}
                                        {task.status === 'completed' ? 'DONE' : 'PENDING'}
                                    </div>
                                </td>
                                <td style={{ padding: '1.5rem', textAlign: 'right' }}>
                                    {task.status === 'pending' ? (
                                        <button
                                            onClick={() => toggleCleaningTaskStatus(task.id, 'completed')}
                                            style={{ background: '#10b981', color: '#fff', border: 'none', padding: '0.5rem 1.5rem', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}
                                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                        >
                                            Mark Done
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => toggleCleaningTaskStatus(task.id, 'pending')}
                                            style={{ background: 'transparent', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)', padding: '0.5rem 1.5rem', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer' }}
                                        >
                                            Undo
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}

                        {filteredTasks.length === 0 && (
                            <tr>
                                <td colSpan="4" style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                    <ClipboardList size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
                                    <div style={{ fontSize: '1.1rem', fontWeight: 500 }}>No tasks found for this status.</div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default HousekeepingPage;
