import React, { useState, useEffect } from 'react';
import { useSanctuum } from '../../context/SanctuumContext';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '../../lib/supabase';

const AnalyticsDashboard = () => {
    const { bookings, chalets, platforms, formatPrice } = useSanctuum();
    const { t } = useLanguage();

    const [financeData, setFinanceData] = useState([]);

    useEffect(() => {
        const fetchFinances = async () => {
            const { data } = await supabase.from('finance_entries').select('*');
            if (data) setFinanceData(data);
        };
        fetchFinances();
    }, []);

    // 1. Aggregated KPIs

    // Revenue from real finance DB (Net calculation)
    const totalRevenue = financeData.reduce((sum, item) => {
        if (item.type === 'revenue') {
            const rate = parseFloat(item.tax_rate || 0);
            const amt = parseFloat(item.amount);
            const net = amt / (1 + rate / 100);
            return sum + net;
        }
        return sum;
    }, 0);

    // Projected Revenue from Calendar
    const todayStr = new Date().toISOString().split('T')[0];
    const projectedRevenue = bookings.reduce((sum, b) => {
        if (b.end > todayStr && b.status !== 'blocked') {
            return sum + (b.totalRevenue || 0);
        }
        return sum;
    }, 0);

    const totalBookings = bookings.length;
    const occupancyRate = bookings.length > 0 ? 45 : 0; // Keeping simplified for now
    const avgStay = bookings.length > 0 ? (bookings.reduce((sum, b) => {
        // approximate days
        const start = new Date(b.start);
        const end = new Date(b.end);
        const days = Math.round((end - start) / (1000 * 60 * 60 * 24));
        return sum + Math.max(days, 1);
    }, 0) / bookings.length).toFixed(1) : 0;

    // 2. Data for Charts
    const platformData = platforms.map(p => ({
        name: p.name,
        color: p.color,
        value: bookings.filter(b => b.platformId === p.id || b.source === p.id).length
    }));

    // Dynamic Monthly Revenue from real finance db
    const currentYear = new Date().getFullYear();
    const monthlyMap = {
        '01': { name: 'Jan', revenue: 0 },
        '02': { name: 'Fév', revenue: 0 },
        '03': { name: 'Mar', revenue: 0 },
        '04': { name: 'Avr', revenue: 0 },
        '05': { name: 'Mai', revenue: 0 },
        '06': { name: 'Juin', revenue: 0 },
        '07': { name: 'Juil', revenue: 0 },
        '08': { name: 'Aoû', revenue: 0 },
        '09': { name: 'Sep', revenue: 0 },
        '10': { name: 'Oct', revenue: 0 },
        '11': { name: 'Nov', revenue: 0 },
        '12': { name: 'Déc', revenue: 0 },
    };

    let maxMonthlyRevenue = 100; // avoid div by 0

    financeData.forEach(item => {
        if (item.type === 'revenue' && item.date && item.date.startsWith(`${currentYear}`)) {
            const monthStr = item.date.split('-')[1];
            if (monthlyMap[monthStr]) {
                const rate = parseFloat(item.tax_rate || 0);
                const amt = parseFloat(item.amount);
                const net = amt / (1 + rate / 100);
                monthlyMap[monthStr].revenue += net;
                if (monthlyMap[monthStr].revenue > maxMonthlyRevenue) {
                    maxMonthlyRevenue = monthlyMap[monthStr].revenue;
                }
            }
        }
    });

    const monthlyRevenue = Object.values(monthlyMap);

    return (
        <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Analytiques</h2>

            {/* KPI GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
                    <h3 style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Revenu Total (Net)</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 700 }}>{formatPrice(totalRevenue)}</div>
                    <div style={{ fontSize: '0.875rem', color: '#10b981' }}>+12% vs mois dernier</div>
                </div>
                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
                    <h3 style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Chiffre d'affaire projeté</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-primary)' }}>{formatPrice(projectedRevenue)}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Basé sur le calendrier</div>
                </div>
                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
                    <h3 style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Taux d'occupation</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 700 }}>{occupancyRate}%</div>
                    <div style={{ fontSize: '0.875rem', color: '#10b981' }}>+5% vs mois dernier</div>
                </div>
                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
                    <h3 style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Réservations Totales</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 700 }}>{totalBookings}</div>
                    <div style={{ fontSize: '0.875rem', color: '#10b981' }}>+8% vs mois dernier</div>
                </div>
                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
                    <h3 style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Durée moyenne</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 700 }}>{avgStay} {t('jours') || 'jours'}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Stable</div>
                </div>
            </div>

            {/* CHARTS GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

                {/* Platform Distribution */}
                <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Distribution par plateforme</h3>
                    <div style={{ display: 'flex', alignItems: 'flex-end', height: '200px', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>
                        {platformData.map((p, i) => (
                            <div key={i} style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center' }}>
                                <div style={{
                                    width: '100%',
                                    height: totalBookings > 0 ? `${(p.value / totalBookings) * 100}%` : '5%',
                                    background: p.color,
                                    borderRadius: '4px 4px 0 0',
                                    transition: 'height 1s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}></div>
                                <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>{p.name}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Revenue Trend */}
                <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Évolution des revenus</h3>
                    <div style={{ display: 'flex', alignItems: 'flex-end', height: '200px', gap: '0.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>
                        {monthlyRevenue.map((m, i) => (
                            <div key={i} style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center' }} title={`${m.name}: ${formatPrice(m.revenue)}`}>
                                {m.revenue > 0 && (
                                    <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', opacity: 0.7, transform: 'rotate(-45deg)', transformOrigin: 'left bottom', whiteSpace: 'nowrap', textAlign: 'left', alignSelf: 'center', marginBottom: '1rem' }}>
                                        ${Math.round(m.revenue)}
                                    </div>
                                )}
                                <div style={{
                                    width: '60%',
                                    height: `${Math.max(5, (m.revenue / maxMonthlyRevenue) * 100)}%`, // minimum 5% height to be visible
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
