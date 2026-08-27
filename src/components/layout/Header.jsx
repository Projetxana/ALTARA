import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSanctuum } from '../../context/SanctuumContext';
import { useLanguage } from '../../context/LanguageContext';
import { Search, Bell, Plus } from 'lucide-react';

const Header = () => {
    const navigate = useNavigate();

    const {
        currentChalet,
        selectedChaletId,
        chalets
    } = useSanctuum();

    const {
        language,
        setLanguage,
        t
    } = useLanguage();

    const bookingChaletId =
        currentChalet?.id ||
        selectedChaletId ||
        chalets?.[0]?.id;

    const getFlag = (lang) => {
        switch (lang) {
            case 'en': return '🇺🇸';
            case 'fr': return '🇫🇷';
            case 'es': return '🇪🇸';
            default: return '🌐';
        }
    };

    return (
        <header
            style={{
                marginBottom: '1.25rem',
                minHeight: '66px',
                padding: '0.8rem 1rem 0.8rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#FCFAF6',
                border: '1px solid #E7E0D5',
                borderRadius: '16px',
                boxShadow: '0 4px 18px rgba(21,33,31,0.035)',
                backdropFilter: 'blur(18px)'
            }}
        >
            <div
                style={{
                    position: 'relative',
                    width: 'min(360px, 32vw)'
                }}
            >
                <Search
                    size={17}
                    style={{
                        position: 'absolute',
                        left: '13px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#84908B'
                    }}
                />

                <input
                    type="text"
                    placeholder={t('header_search')}
                    style={{
                        width: '100%',
                        padding: '0.72rem 1rem 0.72rem 2.55rem',
                        background: '#FFFFFF',
                        border: '1px solid #E5DED3',
                        borderRadius: '9px',
                        color: '#15211F',
                        outline: 'none',
                        fontSize: '0.88rem'
                    }}
                />
            </div>

            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.45rem 0.55rem'
                    }}
                >
                    <span style={{ fontSize: '1rem' }}>
                        {getFlag(language)}
                    </span>

                    <select
                        value={language}
                        onChange={(e) =>
                            setLanguage(e.target.value)
                        }
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#53635E',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            outline: 'none'
                        }}
                    >
                        <option value="en">EN</option>
                        <option value="fr">FR</option>
                        <option value="es">ES</option>
                    </select>
                </div>

                <button
                    style={{
                        position: 'relative',
                        width: '38px',
                        height: '38px',
                        display: 'grid',
                        placeItems: 'center',
                        background: 'transparent',
                        border: 'none',
                        color: '#53635E',
                        cursor: 'pointer'
                    }}
                >
                    <Bell size={19} />

                    <span
                        style={{
                            position: 'absolute',
                            top: 7,
                            right: 7,
                            width: '7px',
                            height: '7px',
                            background: '#A6553F',
                            border: '2px solid #FFFFFF',
                            borderRadius: '50%'
                        }}
                    />
                </button>

                <button
                    onClick={() => {
                        if (bookingChaletId) {
                            navigate(`/book/${bookingChaletId}`);
                        }
                    }}
                    disabled={!bookingChaletId}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.7rem 1rem',
                        background: bookingChaletId
                            ? '#A75B45'
                            : '#C8C4BE',
                        border: 'none',
                        borderRadius: '9px',
                        color: '#FFFFFF',
                        fontSize: '0.86rem',
                        fontWeight: 600,
                        cursor: bookingChaletId
                            ? 'pointer'
                            : 'not-allowed',
                        boxShadow: bookingChaletId
                            ? '0 6px 18px rgba(167,91,69,0.16)'
                            : 'none'
                    }}
                >
                    <Plus size={17} />
                    <span>{t('header_new_booking')}</span>
                </button>

                <div
                    style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        background: '#173A35',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid #EEE9E1',
                        fontWeight: 600,
                        fontSize: '0.78rem'
                    }}
                >
                    JD
                </div>
            </div>
        </header>
    );
};

export default Header;
