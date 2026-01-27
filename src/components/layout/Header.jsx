import React from 'react';
import { useSanctuum } from '../../context/SanctuumContext';
import { useLanguage } from '../../context/LanguageContext';
import { Search, Bell, Plus, Globe } from 'lucide-react';

const Header = () => {
    const { currentChalet, platforms } = useSanctuum();
    const { language, setLanguage, t } = useLanguage();

    const getFlag = (lang) => {
        switch (lang) {
            case 'en': return '🇺🇸';
            case 'fr': return '🇫🇷';
            case 'es': return '🇪🇸';
            default: return '🌐';
        }
    };

    return (
        <header className="glass-panel" style={{
            marginBottom: '2rem',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderRadius: 'var(--radius-lg)'
        }}>

            {/* Search Bar */}
            <div style={{ position: 'relative', width: '300px' }}>
                <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input
                    type="text"
                    placeholder={t('header_search')}
                    style={{
                        width: '100%',
                        padding: '0.625rem 1rem 0.625rem 2.5rem',
                        background: 'rgba(0,0,0,0.2)',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--color-text)',
                        outline: 'none'
                    }}
                />
            </div>

            {/* Right Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>

                {/* Language Selector */}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <span style={{ fontSize: '1.2rem' }}>{getFlag(language)}</span>
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--color-text)',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            outline: 'none',
                            appearance: 'none', // Hide default arrow
                            paddingRight: '1rem'
                        }}
                    >
                        <option value="en">EN</option>
                        <option value="fr">FR</option>
                        <option value="es">ES</option>
                    </select>
                </div>

                {/* Notifications */}
                <button style={{ position: 'relative', background: 'transparent', border: 'none', color: 'var(--color-text)', cursor: 'pointer' }}>
                    <Bell size={20} />
                    <span style={{
                        position: 'absolute',
                        top: -2,
                        right: -2,
                        width: '8px',
                        height: '8px',
                        background: 'var(--color-primary)',
                        borderRadius: '50%'
                    }}></span>
                </button>

                {/* New Booking CTA */}
                <button className="btn-primary">
                    <Plus size={18} />
                    <span>{t('header_new_booking')}</span>
                </button>

                {/* User Avatar */}
                <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid rgba(255,255,255,0.1)'
                }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>JD</span>
                </div>
            </div>
        </header>
    );
};

export default Header;
