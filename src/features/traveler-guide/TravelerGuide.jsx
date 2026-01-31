import React, { useState } from 'react';
import { ChevronLeft, ChevronDown, Key, Wifi, Car, Utensils, Wine, BriefcaseMedical, Info, MapPin, Phone } from 'lucide-react';
import './guide.css';
import GuideMenu from './components/GuideMenu';
import { DynamicIcon } from './utils/iconMap';
import { useGuide } from '../../context/GuideContext';

/* --- Components --- */

const GuideItem = ({ item, layout }) => {
    const [isOpen, setIsOpen] = useState(false);
    const hasDetails = !!item.details;
    const rightText = item.right || item.text || item.value || item.contact;

    const toggleOpen = () => {
        if (hasDetails) setIsOpen(!isOpen);
    };

    if (layout === 'list') {
        return (
            <div className="tg-list-card" onClick={toggleOpen} style={{ cursor: hasDetails ? 'pointer' : 'default' }}>
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center', textAlign: 'center' }}>

                    {/* 1. Centered Title */}
                    <div className="tg-list-title">{item.title || item.label}</div>

                    {/* 2. Value / Right Text (Centered below title) */}
                    {rightText && (
                        <div className="tg-list-subtitle">
                            {rightText}
                        </div>
                    )}

                    {/* 3. Description (Below value) */}
                    <div className="tg-list-desc">{item.desc}</div>

                    {/* Chevron (if expandable) */}
                    {hasDetails && (
                        <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                            <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600', color: '#000' }}>
                                {isOpen ? 'Fermer' : 'Voir Plus'}
                            </span>
                            <ChevronDown size={20} color="#000" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                        </div>
                    )}
                </div>

                {isOpen && hasDetails && (
                    <div className="tg-details-panel">
                        {item.details}
                    </div>
                )}
            </div>
        );
    }

    if (layout === 'row') {
        return (
            <div className="tg-simple-row-wrapper" onClick={toggleOpen} style={{ cursor: hasDetails ? 'pointer' : 'default' }}>
                <div className="tg-simple-row">
                    <div className="tg-row-left">
                        {item.icon && item.icon !== 'none' && (
                            <div className="tg-row-icon">
                                <DynamicIcon name={item.icon || 'info'} size={20} />
                            </div>
                        )}
                        <div className="tg-row-label">{item.label || item.title}</div>
                    </div>
                    <div className="tg-row-right" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {rightText}
                        {hasDetails && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ fontSize: '0.6rem', textTransform: 'uppercase', fontWeight: '600', color: '#000' }}>
                                    {isOpen ? 'Fermer' : 'Plus'}
                                </span>
                                <ChevronDown size={18} color="#000" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                            </div>
                        )}
                    </div>
                </div>
                {isOpen && hasDetails && (
                    <div className="tg-details-panel">
                        {item.details}
                    </div>
                )}
            </div>
        );
    }


    if (layout === 'grid') {
        return (
            <div className="tg-grid-card" onClick={toggleOpen} style={{ cursor: hasDetails ? 'pointer' : 'default', height: '100%', position: 'relative' }}>
                <div className="tg-grid-icon-box">
                    <DynamicIcon name={item.icon || 'info'} size={24} />
                </div>
                <div className="tg-grid-title">{item.title}</div>
                <div className="tg-grid-text">{item.text}</div>

                {hasDetails && (
                    <div style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                        <span style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 'bold', color: '#000' }}>
                            {isOpen ? 'Fermer' : 'Plus'}
                        </span>
                        <ChevronDown size={18} color="#000" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                    </div>
                )}

                {isOpen && hasDetails && (
                    <div className="tg-details-panel" style={{ marginTop: '1rem', width: '100%', textAlign: 'left', fontSize: '0.75rem' }}>
                        {item.details}
                    </div>
                )}
            </div>
        );
    }


    if (layout === 'wifi-card') {
        return (
            <div className="tg-wifi-card" onClick={toggleOpen} style={{ cursor: hasDetails ? 'pointer' : 'default', position: 'relative' }}>
                <div className="tg-wifi-title">{item.title}</div>
                <div className="tg-wifi-text" style={{ whiteSpace: 'pre-line' }}>{item.text}</div>

                {hasDetails && (
                    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                        <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600', color: '#000' }}>
                            {isOpen ? 'Fermer' : 'Voir Plus de Détails'}
                        </span>
                        <ChevronDown size={20} color="#000" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                    </div>
                )}

                {isOpen && hasDetails && (
                    <div className="tg-details-panel" style={{ marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                        {item.details}
                    </div>
                )}
            </div>
        );
    }

    return null;
};

const GuideSection = ({ sectionId, onBack, onNavigate, onImageClick }) => {
    const { guideData } = useGuide();

    // Default data if section not found
    const content = guideData.content[sectionId] || {
        title: sectionId.toUpperCase(),
        image: guideData.homeImage,
        layout: "simple",
        items: []
    };

    // Get all sections for the nav strip (filtered by visibility)
    const sections = (guideData.sectionOrder || Object.keys(guideData.content))
        .filter(key => guideData.content[key] && guideData.content[key].isVisible !== false);

    return (
        <div className="traveler-guide-mobile-frame">
            {/* BACK BUTTON (Fixed position, always visible) */}
            <button className="tg-header-back-fixed" onClick={onBack}>
                <ChevronLeft size={28} />
            </button>

            {/* Content Area with Native Scroll */}
            <div className="tg-scroll-content">

                {/* 1. HERO HEADER (Scrolls away) */}
                <div className="tg-header-hero">
                    <h2 className="tg-header-welcome">BIENVENUE</h2>
                    <span className="tg-header-script">chez nous</span>
                    <div className="tg-header-divider"></div>
                </div>

                {/* 2. STICKY TITLE BAR (Sticks to top) */}
                <div className="tg-header-sticky-bar">
                    <h1 className="tg-header-section-title">{content.title}</h1>
                </div>

                {/* Hero Image / Map moved inside content */}
                <img
                    src={content.image}
                    alt={content.title}
                    className={content.layout === 'map' ? "tg-content-map clickable" : "tg-content-image clickable"}
                    onClick={() => onImageClick(content.image)}
                />

                {/* LIST LAYOUT (Restaurants / Map Directions) */}
                {(content.layout === 'list' || content.layout === 'map') && (
                    <div>
                        {content.items.map((item, idx) => (
                            <GuideItem key={idx} item={item} layout="list" />
                        ))}
                    </div>
                )}

                {/* GRID LAYOUT (Informations) */}
                {content.layout === 'grid' && (
                    <div className="tg-grid-container">
                        {content.items.map((item, idx) => (
                            <GuideItem key={idx} item={item} layout="grid" />
                        ))}
                    </div>
                )}

                {/* ROW/SIMPLE LAYOUT (Emergency) */}
                {content.layout === 'row' && (
                    <div style={{ background: 'white', borderRadius: '16px', padding: '0 1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
                        {content.items.map((item, idx) => (
                            <GuideItem key={idx} item={item} layout="row" />
                        ))}
                    </div>
                )}

                {/* WIFI CARD LAYOUT (Full Width, No Icon) */}
                {/* WIFI CARD LAYOUT (Full Width, No Icon) */}
                {content.layout === 'wifi-card' && (
                    <div className="tg-wifi-container">
                        {content.items.map((item, idx) => (
                            <GuideItem key={idx} item={item} layout="wifi-card" />
                        ))}
                    </div>
                )}

                {content.layout === 'simple' && (
                    <div style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>
                        Content coming soon for {sectionId}...
                    </div>
                )}

            </div>

            {/* 3. Icon Navigation Strip (Moved below content) */}
            <div className="tg-nav-strip">
                {sections.map((key) => {
                    const sectionData = guideData.content[key];
                    return (
                        <div
                            key={key}
                            className={`tg-nav-icon ${key === sectionId ? 'active' : ''}`}
                            onClick={() => onNavigate(key)}
                            title={sectionData.title}
                        >
                            <DynamicIcon name={sectionData.icon || 'info'} size={20} />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const TravelerGuide = () => {
    const { guideData } = useGuide();
    const [activeSection, setActiveSection] = useState(null);
    const [expandedImage, setExpandedImage] = useState(null);

    const handleNavigate = (sectionId) => {
        setActiveSection(sectionId);
    };

    const handleBack = () => {
        setActiveSection(null);
    };

    return (
        <div className="traveler-guide-container">
            <div className="traveler-guide-wrapper">

                {activeSection ? (
                    <GuideSection
                        sectionId={activeSection}
                        onBack={handleBack}
                        onNavigate={handleNavigate}
                        onImageClick={setExpandedImage}
                    />
                ) : (
                    <div className="traveler-guide-mobile-frame">
                        {/* HOME PAGE */}
                        {/* HOME PAGE - ELEGANT REDESIGN (Full Width, No BG Image) */}
                        <div className="tg-background-layer" style={{
                            backgroundColor: 'var(--tg-bg)' // Replaced image with solid color
                        }} />

                        <div className="tg-content-layer" style={{ justifyContent: 'center', alignItems: 'center', padding: '1rem', overflowY: 'auto' }}>
                            <div className="tg-home-card full-width-card">
                                <h1 className="tg-home-title">BIENVENUE</h1>
                                <p className="tg-home-subtitle">chez nous</p>

                                <div className="tg-resort-container">
                                    <span className="tg-resort-prefix">Chalet</span>
                                    <h2 className="tg-home-resort">AYANA</h2>
                                </div>

                                <div style={{ width: '100%', marginTop: '2rem' }}>
                                    <h3 style={{ fontFamily: 'var(--font-serif)', textAlign: 'center', marginBottom: '1rem', letterSpacing: '2px', fontSize: '0.9rem' }}>ACCUEIL</h3>
                                    <GuideMenu onNavigate={handleNavigate} />

                                    {/* Footer Image */}
                                    <div className="tg-home-footer-container">
                                        <img
                                            src="/chalet_facade.jpg"
                                            alt="Chalet Facade"
                                            className="tg-home-footer-image clickable"
                                            onClick={() => setExpandedImage('/chalet_facade.jpg')}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* LIGHTBOX OVERLAY */}
                {expandedImage && (
                    <div
                        className="tg-lightbox-overlay"
                        onClick={() => setExpandedImage(null)}
                    >
                        <div className="tg-lightbox-content">
                            <img src={expandedImage} alt="Expanded" className="tg-lightbox-img" />
                            <p className="tg-lightbox-hint">Toucher pour fermer</p>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default TravelerGuide;
