import React, { useEffect } from 'react';
import { Clock, Users, ShieldAlert, Dog, Droplets, Flame, Wind, Video, Activity, Ban } from 'lucide-react';

const Terms = () => {
    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div style={{ backgroundColor: 'var(--ayana-bg)', minHeight: '100vh', paddingTop: '100px' }}>
            {/* Header / Hero Section Minimaliste */}
            <section style={{ padding: '8rem 2rem 4rem', textAlign: 'center', backgroundColor: 'var(--ayana-bg)' }}>
                <div className="ayana-animate" style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h1 style={{ fontFamily: 'var(--ayana-font-heading)', fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: 'var(--ayana-text)', marginBottom: '1.5rem', fontWeight: 300, letterSpacing: '2px', textTransform: 'uppercase' }}>
                        Toutes nos Règles
                    </h1>
                    <p style={{ color: 'var(--ayana-muted)', fontSize: '1.1rem', lineHeight: 1.8, maxWidth: '600px', margin: '0 auto' }}>
                        Pour préserver la quiétude et l'harmonie des lieux, nous vous invitons à prendre connaissance des règles et informations de sécurité de la maison avant votre séjour.
                    </p>
                </div>
            </section>

            {/* Contenu Principal */}
            <section style={{ padding: '4rem 2rem 8rem' }}>
                <div className="ayana-container" style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '5rem' }}>

                    {/* RÈGLES DE LA MAISON */}
                    <div className="ayana-animate">
                        <h2 style={{ fontFamily: 'var(--ayana-font-heading)', fontSize: '2rem', color: 'var(--ayana-text)', marginBottom: '2.5rem', borderBottom: '1px solid var(--ayana-border)', paddingBottom: '1rem' }}>
                            Règles de la maison
                        </h2>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '3rem' }}>
                            <RuleItem 
                                icon={<Clock strokeWidth={1} size={28} />}
                                title="Horaires"
                                text="Arrivée : Flexible à partir de 16h00. Départ : Avant 11h00."
                            />
                            <RuleItem 
                                icon={<Users strokeWidth={1} size={28} />}
                                title="Capacité & Invités"
                                text="Capacité maximale : 6 voyageurs. Réservé exclusivement aux voyageurs enregistrés."
                            />
                            <RuleItem 
                                icon={<Ban strokeWidth={1} size={28} />}
                                title="Festivités & Tournages"
                                text="Les événements et réceptions ne sont pas autorisés. La photographie commerciale et les tournages sont strictement interdits."
                            />
                            <RuleItem 
                                icon={<Wind strokeWidth={1} size={28} />}
                                title="Tabagisme"
                                text="Il est strictement interdit de fumer ou de vapoter à l'intérieur du chalet. Si vous fumez à l'extérieur, toutes les portes et fenêtres doivent rester fermées."
                            />
                        </div>

                        {/* Période de calme */}
                         <div style={{ marginTop: '3rem', padding: '2rem', backgroundColor: 'var(--ayana-surface)', borderRadius: '4px', border: '1px solid var(--ayana-border)' }}>
                            <h3 style={{ fontFamily: 'var(--ayana-font-heading)', fontSize: '1.3rem', color: 'var(--ayana-text)', marginBottom: '1rem' }}>Période de Calme</h3>
                            <p style={{ color: 'var(--ayana-muted)', lineHeight: 1.7, fontSize: '1rem' }}>
                                Le silence doit être respecté entre <strong>22h00 et 08h00</strong> en tout temps, pour garantir la tranquillité du sanctuaire et du voisinage.
                            </p>
                        </div>
                    </div>

                    {/* ANIMAUX */}
                    <div className="ayana-animate ayana-delay-1">
                        <h2 style={{ fontFamily: 'var(--ayana-font-heading)', fontSize: '2rem', color: 'var(--ayana-text)', marginBottom: '2.5rem', borderBottom: '1px solid var(--ayana-border)', paddingBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <Dog strokeWidth={1} size={32} />
                            Animaux de Compagnie
                        </h2>
                        <ul style={{ color: 'var(--ayana-muted)', lineHeight: 1.8, fontSize: '1.05rem', listStyleType: 'disc', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            <li><strong>Maximum 1 animal autorisé</strong>, devant obligatoirement être déclaré lors de la réservation.</li>
                            <li>Les animaux ne sont pas autorisés sur les meubles ni sur les lits à aucun moment.</li>
                            <li>Les besoins doivent être ramassés immédiatement.</li>
                            <li>Les animaux n'ont absolument pas accès aux installations thermales (spa, sauna, hammam).</li>
                        </ul>
                    </div>

                    {/* INSTALLATIONS THERMALES & RESSOURCES */}
                    <div className="ayana-animate">
                        <h2 style={{ fontFamily: 'var(--ayana-font-heading)', fontSize: '2rem', color: 'var(--ayana-text)', marginBottom: '2.5rem', borderBottom: '1px solid var(--ayana-border)', paddingBottom: '1rem' }}>
                            Installations Thermales & Ressources
                        </h2>
                        
                        <div style={{ display: 'grid', gap: '2rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--ayana-accent)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Droplets strokeWidth={1} size={20} /> Circuit Thermal
                                </h3>
                                <p style={{ color: 'var(--ayana-muted)', lineHeight: 1.8, fontSize: '1.05rem' }}>
                                    L'utilisation du spa, sauna et hammam est réservée exclusivement aux voyageurs enregistrés et se fait sous l'entière responsabilité des voyageurs. Une douche est obligatoire avant l'accès. <strong>Aucun verre ou objet fragile n'est autorisé</strong> dans ou autour des installations. Les enfants doivent être supervisés en tout temps par un adulte.
                                </p>
                            </div>

                            <div>
                                <h3 style={{ fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--ayana-accent)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Activity strokeWidth={1} size={20} /> Eau & Électricité
                                </h3>
                                <p style={{ color: 'var(--ayana-muted)', lineHeight: 1.8, fontSize: '1.05rem' }}>
                                    Le chalet est alimenté par un puits artésien. Nous vous remercions de faire un usage responsable de l'eau claire et de l'électricité afin de préserver les ressources naturelles environnantes.
                                </p>
                            </div>
                        </div>

                        <div style={{ marginTop: '3rem', padding: '1.5rem', backgroundColor: 'rgba(217, 83, 79, 0.05)', borderRadius: '4px', borderLeft: '4px solid #d9534f' }}>
                             <p style={{ color: 'var(--ayana-muted)', lineHeight: 1.6, fontSize: '0.95rem', margin: 0 }}>
                                <strong>Sanctions :</strong> Tout dommage doit être signalé sans délai. Des frais peuvent s'appliquer en cas de dommages ou de nettoyage excessif de la propriété ou des installations, conformément aux politiques en vigueur (Airbnb). Tout non-respect des règles portant sur les animaux ou le circuit thermal entraînera des frais supplémentaires automatiques.
                            </p>
                        </div>
                    </div>

                    {/* SÉCURITÉ */}
                    <div className="ayana-animate">
                        <h2 style={{ fontFamily: 'var(--ayana-font-heading)', fontSize: '2rem', color: 'var(--ayana-text)', marginBottom: '2.5rem', borderBottom: '1px solid var(--ayana-border)', paddingBottom: '1rem' }}>
                            Sécurité du Logement
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <RowItem 
                                icon={<ShieldAlert strokeWidth={1} size={24} color="#d9534f" />}
                                title="Considération Importante"
                                text="La conception architecturale minimaliste inclut des espaces surélevés qui ne comportent ni garde-fous ni barrières de protection. La vigilance est donc de mise, particulièrement avec des enfants."
                            />
                            <RowItem 
                                icon={<Video strokeWidth={1} size={24} />}
                                title="Caméras de Sécurité (Extérieur)"
                                text="Pour assurer la sécurité des lieux, une (1) caméra est présente à l'avant de la maison. Elle est configurée pour détecter l'arrivée ou le départ d'une personne depuis l'allée principale."
                            />
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
                                <div style={{ padding: '1.5rem', border: '1px solid var(--ayana-border)', display: 'flex', alignItems: 'center', gap: '1rem', borderRadius: '4px' }}>
                                    <Flame strokeWidth={1} size={24} color="var(--ayana-accent)" />
                                    <span style={{ color: 'var(--ayana-text)', fontSize: '1rem' }}>Détecteur de Monoxyde de carbone</span>
                                </div>
                                <div style={{ padding: '1.5rem', border: '1px solid var(--ayana-border)', display: 'flex', alignItems: 'center', gap: '1rem', borderRadius: '4px' }}>
                                    <Wind strokeWidth={1} size={24} color="var(--ayana-accent)" />
                                    <span style={{ color: 'var(--ayana-text)', fontSize: '1rem' }}>Détecteur de Fumée</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </section>
        </div>
    );
};

// --- Composants de design ---

const RuleItem = ({ icon, title, text }) => (
    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
        <div style={{ color: 'var(--ayana-accent)', paddingTop: '0.2rem' }}>
            {icon}
        </div>
        <div>
            <h4 style={{ fontFamily: 'var(--ayana-font-heading)', fontSize: '1.2rem', color: 'var(--ayana-text)', marginBottom: '0.5rem', fontWeight: 400 }}>{title}</h4>
            <p style={{ color: 'var(--ayana-muted)', lineHeight: 1.6, fontSize: '1rem' }}>
                {text}
            </p>
        </div>
    </div>
);

const RowItem = ({ icon, title, text }) => (
    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', padding: '1.5rem', backgroundColor: 'var(--ayana-surface)', borderRadius: '4px' }}>
        <div style={{ flexShrink: 0, marginTop: '2px' }}>
            {icon}
        </div>
        <div>
            <h4 style={{ fontSize: '1.05rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--ayana-text)', marginBottom: '0.5rem' }}>{title}</h4>
            <p style={{ color: 'var(--ayana-muted)', lineHeight: 1.6, fontSize: '0.95rem', margin: 0 }}>
                {text}
            </p>
        </div>
    </div>
);

export default Terms;
