import React from 'react';
import { useSanctuum } from '../../context/SanctuumContext';
import { useLanguage } from '../../context/LanguageContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

const AnalyticsDashboard = () => {
    const { bookings, chalets, platforms, formatPrice } = useSanctuum(); // ADDED formatPrice
    const { t } = useLanguage();

    // 1. Aggregated KPIs
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.revenue || 0), 0);
    const totalBookings = bookings.length;

    // Real Occupancy Calculation (simplified for now)
    const occupancyRate = bookings.length > 0 ? 45 : 0;
    const avgStay = bookings.length > 0 ? (bookings.reduce((sum, b) => sum + (b.nights || 3), 0) / bookings.length).toFixed(1) : 0;

    // 2. Data for Charts
    const platformData = platforms.map(p => ({
        name: p.name,
        color: p.color,
        value: bookings.filter(b => b.platformId === p.id).length
    }));

    // Dynamic Monthly Revenue (Mocked Empty Structure if no data)
    const monthlyRevenue = [
        { name: 'Jan', revenue: 0 },
        { name: 'Feb', revenue: 0 },
        { name: 'Mar', revenue: 0 },
        { name: 'Apr', revenue: 0 },
        { name: 'May', revenue: 0 },
        { name: 'Jun', revenue: 0 },
        { name: 'Jul', revenue: 0 },
    ];

    return (
        <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>{t('nav_analytics')}</h2>

            {/* KPI GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
                    <h3 style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>{t('analytics_revenue')}</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 700 }}>{formatPrice(totalRevenue)}</div>
                    <div style={{ fontSize: '0.875rem', color: '#10b981' }}>+12% vs last month</div>
                </div>
                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
                    <h3 style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>{t('analytics_occupancy')}</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 700 }}>{occupancyRate}%</div>
                    <div style={{ fontSize: '0.875rem', color: '#10b981' }}>+5% vs last month</div>
                </div>
                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
                    <h3 style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>{t('analytics_bookings')}</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 700 }}>{totalBookings}</div>
                    <div style={{ fontSize: '0.875rem', color: '#10b981' }}>+8% vs last month</div>
                </div>
                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
                    <h3 style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>{t('analytics_avg_stay')}</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 700 }}>{avgStay} {t('days')}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Stable</div>
                </div>
            </div>

            {/* CHARTS GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

                {/* Platform Distribution */}
                <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>{t('analytics_platform_dist')}</h3>
                    <div style={{ display: 'flex', alignItems: 'flex-end', height: '200px', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>
                        {platformData.map((p, i) => (
                            <div key={i} style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center' }}>
                                <div style={{
                                    width: '100%',
                                    height: `${(p.value / totalBookings) * 100}%`,
                                    background: p.color,
                                    borderRadius: '4px 4px 0 0',
                                    transition: 'height 1s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}></div>
                                <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{p.name}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Revenue Trend */}
                <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>{t('analytics_revenue_trend')}</h3>
                    {/* Placeholder for a line chart using CSS/Mock */}
                    <div style={{ display: 'flex', alignItems: 'flex-end', height: '200px', gap: '0.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>
                        {monthlyRevenue.map((m, i) => (
                            <div key={i} style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center' }}>
                                <div style={{
                                    width: '60%',
                                    height: `${(m.revenue / 6000) * 100}%`,
                                    background: 'linear-gradient(180deg, var(--color-primary) 0%, rgba(212, 175, 55, 0.2) 100%)',
                                    borderRadius: '20px',
                                    transition: 'height 1s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}></div>
                                <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{m.name}</div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AnalyticsDashboard;
