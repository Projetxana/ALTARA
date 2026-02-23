import React from 'react';
import { LayoutDashboard, Calendar, Home, Users, Settings, Sparkles, BarChart, Tag, Briefcase, DollarSign, ClipboardList } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useLanguage();

    const navItems = [
        { icon: <Calendar size={20} />, label: t('nav_planning'), path: '/planning' },
        { icon: <Home size={20} />, label: t('nav_properties'), path: '/properties' },
        { icon: <ClipboardList size={20} />, label: t('nav_housekeeping') || 'Housekeeping', path: '/housekeeping' },
        { icon: <Tag size={20} />, label: t('nav_pricing'), path: '/pricing' },
        { icon: <Sparkles size={20} />, label: t('nav_experiences'), path: '/experiences' },
        { icon: <Briefcase size={20} />, label: t('nav_soul'), path: '/soul' },
        { icon: <BarChart size={20} />, label: t('nav_analytics'), path: '/analytics' },
        { icon: <DollarSign size={20} />, label: "Finance", path: '/finance' },
        { icon: <Users size={20} />, label: t('nav_guests'), path: '/guests' },
    ];

    return (
        <aside className="glass-panel" style={{
            borderRadius: 0,
            borderRight: '1px solid var(--color-border)',
            borderTop: 0,
            borderBottom: 0,
            borderLeft: 0,
            display: 'flex',
            flexDirection: 'column',
            padding: '2rem 1.5rem'
        }}>
            <div style={{ marginBottom: '3rem', paddingLeft: '0.75rem' }}>
                <h1 style={{
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    letterSpacing: '-0.03em',
                    background: 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    ALTARA
                </h1>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {navItems.map((item, index) => {
                    const isActive = location.pathname.startsWith(item.path);
                    return (
                        <button
                            key={index}
                            onClick={() => navigate(item.path)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '0.875rem 1rem',
                                borderRadius: 'var(--radius-md)',
                                background: isActive ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                                border: 'none',
                                color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                textAlign: 'left',
                                fontFamily: 'var(--font-sans)',
                                fontSize: '0.95rem',
                                fontWeight: isActive ? 600 : 400
                            }}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            <div style={{ marginTop: 'auto' }}>
                <button
                    onClick={() => navigate('/settings')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '0.875rem 1rem',
                        width: '100%',
                        background: location.pathname === '/settings' ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                        borderRadius: 'var(--radius-md)',
                        border: 'none',
                        color: location.pathname === '/settings' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                        cursor: 'pointer'
                    }}
                >
                    <Settings size={20} />
                    <span>{t('nav_settings')}</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
