import React from 'react';
import { useSanctuum } from '../../context/SanctuumContext';
import { useLanguage } from '../../context/LanguageContext';
import ExperienceCard from './ExperienceCard';

const ExperiencesPage = () => {
    const { experiences } = useSanctuum();
    const { t } = useLanguage();

    return (
        <div>
            <div style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{t('exp_catalog')}</h2>
                <p style={{ color: 'var(--color-text-muted)' }}>{t('exp_manage')}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                {experiences.map(experience => (
                    <ExperienceCard key={experience.id} experience={experience} />
                ))}
            </div>
        </div>
    );
};

export default ExperiencesPage;
