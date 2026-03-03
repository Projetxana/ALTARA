import React from 'react';
import './wellness-sanctuary.css';

const WellnessSanctuarySection = () => {
    return (
        <section id="spa" className="wellness-section">
            <div className="wellness-container">
                {/* LEFT COLUMN: Content & Steps */}
                <div className="wellness-content ayana-animate">
                    <span className="wellness-kicker">Le Cœur du Concept</span>
                    <h2 className="wellness-title">Sanctuaire de Bien-être</h2>
                    <p className="wellness-intro">
                        Cœur battant de l'expérience AYANA, nos installations privées sont conçues comme un voyage sensoriel vers la détente absolue pour redessiner votre équilibre intérieur.
                    </p>

                    <hr className="wellness-divider" />

                    <ul className="wellness-steps">
                        {/* Étape 01 */}
                        <li className="wellness-step">
                            <div className="wellness-step-badge">01</div>
                            <div className="wellness-step-content">
                                <h3 className="wellness-step-title">Chaleur Enveloppante</h3>
                                <p className="wellness-step-desc">
                                    Purifiez votre corps dans la douceur de notre hammam ou la chaleur réconfortante de notre sauna sec profond.
                                </p>
                                <p className="wellness-step-signature">Élévation de la température corporelle • Relâchement</p>
                            </div>
                        </li>

                        {/* Étape 02 */}
                        <li className="wellness-step">
                            <div className="wellness-step-badge">02</div>
                            <div className="wellness-step-content">
                                <h3 className="wellness-step-title">Détente au Cœur de la Nature</h3>
                                <p className="wellness-step-desc">
                                    Laissez l'hydrothérapie de notre grand jacuzzi extérieur relâcher chaque tension pendant que vous admirez le paysage sauvage.
                                </p>
                                <p className="wellness-step-signature">Impesanteur • Massage profond</p>
                            </div>
                        </li>

                        {/* Étape 03 */}
                        <li className="wellness-step">
                            <div className="wellness-step-badge">03</div>
                            <div className="wellness-step-content">
                                <h3 className="wellness-step-title">Luminosité et Introspection</h3>
                                <p className="wellness-step-desc">
                                    Terminez votre rituel dans notre salle de repos, offrant une luminosité magnifique au coucher du soleil.
                                </p>
                                <p className="wellness-step-signature">Retour au calme • Contemplation</p>
                            </div>
                        </li>
                    </ul>
                </div>

                {/* RIGHT COLUMN: Magazine-style Asymmetric Gallery */}
                <div className="wellness-gallery">
                    {/* Colonne 1 : image verticale, carre, et portrait */}
                    <div className="wellness-gallery-col">
                        <div className="wellness-img-wrapper rect-tall ayana-animate">
                            <img src="/ayana/photos/v2/spa-nouveau-2.jpg" alt="Hammam vapeur douce" loading="lazy" />
                        </div>
                        <div className="wellness-img-wrapper square ayana-animate">
                            <img src="/ayana/photos/v2/japandi-towels.png" alt="Détail serviettes" loading="lazy" />
                        </div>
                        <div className="wellness-img-wrapper rect-portrait ayana-animate">
                            <img src="/ayana/photos/v2/spa-nouveau-3.jpg" alt="Jacuzzi coucher de soleil" loading="lazy" />
                        </div>
                    </div>

                    {/* Colonne 2 : Décalée (margin-top: 64px) -> Carre, vertical, portrait */}
                    <div className="wellness-gallery-col shifted">
                        <div className="wellness-img-wrapper square ayana-animate ayana-delay-1">
                            <img src="/ayana/photos/v2/japandi-sauna.png" alt="Détail sauna seau" loading="lazy" />
                        </div>
                        <div className="wellness-img-wrapper rect-tall ayana-animate ayana-delay-1">
                            <img src="/ayana/photos/v2/spa-nouveau-1.jpg" alt="Salle de repos luminosité" loading="lazy" />
                        </div>
                        <div className="wellness-img-wrapper rect-portrait ayana-animate ayana-delay-1">
                            <img src="/ayana/photos/v2/spa-nouveau-4.jpg" alt="Jacuzzi hydrothérapie" loading="lazy" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default WellnessSanctuarySection;
