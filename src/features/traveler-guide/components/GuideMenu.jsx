import React from 'react';
import './../guide.css';
import { useGuide } from '../../../context/GuideContext';
import { DynamicIcon } from '../utils/iconMap';

const GuideMenu = ({ onNavigate }) => {
    const { guideData } = useGuide();
    const sections = guideData.sectionOrder || (guideData.content ? Object.keys(guideData.content) : []);

    return (
        <div className="tg-menu">
            {sections.map((key) => {
                const section = guideData.content[key];
                if (!section) return null;
                if (section.isVisible === false) return null; // Respect visibility toggle

                return (
                    <button
                        key={key}
                        className="tg-btn"
                        onClick={() => onNavigate(key)}
                    >
                        <div className="tg-icon-circle">
                            <DynamicIcon name={section.icon || 'info'} size={18} />
                        </div>
                        <span className="tg-btn-label">{section.title || key}</span>
                    </button>
                );
            })}
        </div>
    );
};

export default GuideMenu;
