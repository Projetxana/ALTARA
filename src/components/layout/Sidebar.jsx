import React from 'react';
import {
    Calendar,
    Home,
    Users,
    Settings,
    Sparkles,
    BarChart,
    Tag,
    Briefcase,
    DollarSign,
    ClipboardList,
    Moon,
    Sun
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { language } = useLanguage();
    const { theme, toggleTheme } = useTheme();

    const labels = {
        fr: {
            planning: 'Planning',
            properties: 'Propriétés',
            housekeeping: 'Entretien',
            pricing: 'Tarification',
            experiences: 'Expériences',
            soul: 'Soul Engine',
            analytics: 'Analyses',
            finance: 'Finances',
            guests: 'Voyageurs',
            settings: 'Réglages',
            light: 'Mode Clair',
            dark: 'Mode Sombre'
        },
        en: {
            planning: 'Planning',
            properties: 'Properties',
            housekeeping: 'Housekeeping',
            pricing: 'Pricing',
            experiences: 'Experiences',
            soul: 'Soul Engine',
            analytics: 'Analytics',
            finance: 'Finance',
            guests: 'Guests',
            settings: 'Settings',
            light: 'Light Mode',
            dark: 'Dark Mode'
        },
        es: {
            planning: 'Calendario',
            properties: 'Propiedades',
            housekeeping: 'Mantenimiento',
            pricing: 'Precios',
            experiences: 'Experiencias',
            soul: 'Soul Engine',
            analytics: 'Análisis',
            finance: 'Finanzas',
            guests: 'Huéspedes',
            settings: 'Ajustes',
            light: 'Modo Claro',
            dark: 'Modo Oscuro'
        }
    };

    const l = labels[language] || labels.en;

    const groups = [
        [
            { icon: Calendar, label: l.planning, path: '/planning' },
            { icon: Home, label: l.properties, path: '/properties' },
            { icon: ClipboardList, label: l.housekeeping, path: '/housekeeping' },
            { icon: Tag, label: l.pricing, path: '/pricing' }
        ],
        [
            { icon: Sparkles, label: l.experiences, path: '/experiences' },
            { icon: Briefcase, label: l.soul, path: '/soul' }
        ],
        [
            { icon: BarChart, label: l.analytics, path: '/analytics' },
            { icon: DollarSign, label: l.finance, path: '/finance' },
            { icon: Users, label: l.guests, path: '/guests' }
        ]
    ];

    const isActivePath = (path) =>
        location.pathname === path ||
        location.pathname.startsWith(`${path}/`);

    const navStyle = (active) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '0.9rem',
        width: '100%',
        minHeight: '46px',
        padding: '0.72rem 0.9rem',
        borderRadius: '10px',
        background: active
            ? 'rgba(255,255,255,0.105)'
            : 'transparent',
        border: active
            ? '1px solid rgba(255,255,255,0.075)'
            : '1px solid transparent',
        color: active
            ? '#FFFFFF'
            : 'rgba(255,255,255,0.63)',
        cursor: 'pointer',
        transition: 'background 160ms ease, color 160ms ease, border-color 160ms ease',
        textAlign: 'left',
        fontFamily: 'var(--font-sans)',
        fontSize: '0.88rem',
        fontWeight: active ? 600 : 450
    });

    return (
        <aside className="altara-sidebar">
            <div className="altara-brand">
                <img
                    src="/brand/altara-logo-light.svg"
                    alt="ALTARA"
                    className="altara-brand-logo"
                />
            </div>

            <nav className="altara-nav">
                {groups.map((group, groupIndex) => (
                    <div
                        className="altara-nav-group"
                        key={groupIndex}
                    >
                        {group.map((item) => {
                            const Icon = item.icon;
                            const active = isActivePath(item.path);

                            return (
                                <button
                                    key={item.path}
                                    onClick={() => navigate(item.path)}
                                    style={navStyle(active)}
                                >
                                    <span
                                        className="altara-nav-icon"
                                        data-active={active}
                                    >
                                        <Icon size={19} strokeWidth={1.7} />
                                    </span>

                                    <span>{item.label}</span>
                                </button>
                            );
                        })}
                    </div>
                ))}
            </nav>

            <div className="altara-sidebar-footer">
                <button
                    onClick={toggleTheme}
                    style={navStyle(false)}
                >
                    {theme === 'dark'
                        ? <Sun size={19} strokeWidth={1.7} />
                        : <Moon size={19} strokeWidth={1.7} />
                    }

                    <span>
                        {theme === 'dark' ? l.light : l.dark}
                    </span>
                </button>

                <button
                    onClick={() => navigate('/settings')}
                    style={navStyle(
                        location.pathname === '/settings'
                    )}
                >
                    <Settings size={19} strokeWidth={1.7} />
                    <span>{l.settings}</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
