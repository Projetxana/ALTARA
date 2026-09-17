import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowRight,
    Eye,
    EyeOff,
    Loader,
    Lock,
    Mail,
    User
} from 'lucide-react';

import { supabase } from '../../lib/supabase';

const fieldStyle = {
    width: '100%',
    height: 52,
    padding: '0 46px 0 46px',
    border: '1px solid #DED8CD',
    borderRadius: 12,
    background: '#FFFFFF',
    color: '#15211F',
    fontSize: '0.95rem',
    outline: 'none',
    transition:
        'border-color 160ms ease, box-shadow 160ms ease'
};

const AuthPage = () => {
    const navigate = useNavigate();

    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] =
        useState(false);
    const [loading, setLoading] =
        useState(false);
    const [error, setError] =
        useState('');

    const [formData, setFormData] =
        useState({
            email: '',
            password: '',
            fullName: ''
        });

    const handleChange = e => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async e => {
        e.preventDefault();

        try {
            setLoading(true);
            setError('');

            if (isLogin) {
                const { error } =
                    await supabase.auth
                        .signInWithPassword({
                            email:
                                formData.email,
                            password:
                                formData.password
                        });

                if (error) throw error;

                navigate('/planning');
                return;
            }

            const { error } =
                await supabase.auth.signUp({
                    email:
                        formData.email,
                    password:
                        formData.password,
                    options: {
                        data: {
                            full_name:
                                formData.fullName
                        }
                    }
                });

            if (error) throw error;

            navigate('/planning');

        } catch (err) {
            console.error(
                '[AuthPage]',
                err
            );

            setError(
                err.message ||
                'Une erreur est survenue.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main
            style={{
                minHeight: '100vh',
                display: 'grid',
                gridTemplateColumns:
                    'minmax(0, 1.18fr) minmax(440px, 0.82fr)',
                background: '#FCFAF6'
            }}
        >
            {/* BRAND PANEL */}
            <section
                className="altara-auth-brand"
                style={{
                    position: 'relative',
                    minHeight: '100vh',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    padding:
                        'clamp(70px, 9vh, 110px) clamp(48px, 7vw, 110px) 70px',
                    background: '#173A35',
                    color: '#F4EFE6'
                }}
            >
                {/* Decorative glow */}
                <div
                    style={{
                        position: 'absolute',
                        width: 520,
                        height: 520,
                        borderRadius: '50%',
                        right: '-180px',
                        top: '-190px',
                        background:
                            'radial-gradient(circle, rgba(197,166,106,0.14) 0%, rgba(197,166,106,0) 70%)'
                    }}
                />

                <div
                    style={{
                        position: 'absolute',
                        width: 420,
                        height: 420,
                        borderRadius: '50%',
                        left: '-210px',
                        bottom: '-190px',
                        background:
                            'radial-gradient(circle, rgba(145,166,159,0.13) 0%, rgba(145,166,159,0) 72%)'
                    }}
                />

                <div
                    style={{
                        position: 'relative',
                        zIndex: 1,
                        width: '100%',
                        maxWidth: 620,
                        transform: 'translateY(-60px)'
                    }}
                >
                    <img
                        src="/brand/altara-logo-light.svg"
                        alt="ALTARA"
                        style={{
                            width:
                                'min(82%, 400px)',
                            height: 'auto',
                            display: 'block',
                            marginBottom: '2.8rem'
                        }}
                    />

                    <div
                        style={{
                            width: 56,
                            height: 2,
                            background: '#C5A66A',
                            marginBottom: '1.75rem'
                        }}
                    />

                    <h1
                        style={{
                            margin:
                                '0 0 1.25rem',
                            maxWidth: 590,
                            fontFamily:
                                'Georgia, "Times New Roman", serif',
                            fontSize:
                                'clamp(2.5rem, 4.8vw, 4.8rem)',
                            fontWeight: 400,
                            lineHeight: 1.03,
                            letterSpacing:
                                '-0.045em',
                            color: '#F4EFE6'
                        }}
                    >
                        La gestion locative,
                        <br />
                        repensée.
                    </h1>

                    <p
                        style={{
                            maxWidth: 520,
                            margin: 0,
                            fontSize:
                                'clamp(1rem, 1.25vw, 1.16rem)',
                            lineHeight: 1.75,
                            color:
                                'rgba(244,239,230,0.68)'
                        }}
                    >
                        Pilotez vos établissements,
                        vos réservations, vos revenus
                        et l’expérience client depuis
                        un seul espace.
                    </p>
                </div>

                <div
                    style={{
                        position: 'absolute',
                        left:
                            'clamp(48px, 7vw, 110px)',
                        bottom: 34,
                        fontSize: '0.68rem',
                        textTransform:
                            'uppercase',
                        letterSpacing:
                            '0.16em',
                        color:
                            'rgba(244,239,230,0.38)'
                    }}
                >
                    ALTARA · Hospitality Management
                </div>
            </section>

            {/* AUTH PANEL */}
            <section
                className="altara-auth-form-panel"
                style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding:
                        '48px clamp(34px, 6vw, 90px)',
                    background: '#FCFAF6'
                }}
            >
                <div
                    style={{
                        width: '100%',
                        maxWidth: 420
                    }}
                >
                    <div
                        style={{
                            marginBottom: '2.5rem'
                        }}
                    >
                        <div
                            style={{
                                marginBottom:
                                    '0.85rem',
                                color: '#A6553F',
                                fontSize:
                                    '0.72rem',
                                fontWeight: 750,
                                letterSpacing:
                                    '0.16em',
                                textTransform:
                                    'uppercase'
                            }}
                        >
                            Espace ALTARA
                        </div>

                        <h2
                            style={{
                                margin:
                                    '0 0 0.75rem',
                                color: '#15211F',
                                fontFamily:
                                    'Georgia, "Times New Roman", serif',
                                fontSize:
                                    'clamp(2.15rem, 4vw, 3rem)',
                                fontWeight: 400,
                                letterSpacing:
                                    '-0.04em'
                            }}
                        >
                            {isLogin
                                ? 'Bienvenue.'
                                : 'Créer votre espace.'}
                        </h2>

                        <p
                            style={{
                                margin: 0,
                                color: '#66716D',
                                lineHeight: 1.65,
                                fontSize:
                                    '0.95rem'
                            }}
                        >
                            {isLogin
                                ? 'Connectez-vous pour accéder à votre espace de gestion.'
                                : 'Créez votre compte ALTARA pour commencer à gérer vos établissements.'}
                        </p>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        style={{
                            display: 'grid',
                            gap: '1.15rem'
                        }}
                    >
                        {!isLogin && (
                            <div>
                                <label
                                    htmlFor="fullName"
                                    style={{
                                        display:
                                            'block',
                                        marginBottom:
                                            '0.5rem',
                                        color:
                                            '#315D55',
                                        fontSize:
                                            '0.78rem',
                                        fontWeight:
                                            700
                                    }}
                                >
                                    Nom complet
                                </label>

                                <div
                                    style={{
                                        position:
                                            'relative'
                                    }}
                                >
                                    <User
                                        size={18}
                                        style={{
                                            position:
                                                'absolute',
                                            left: 16,
                                            top: '50%',
                                            transform:
                                                'translateY(-50%)',
                                            color:
                                                '#91A69F'
                                        }}
                                    />

                                    <input
                                        id="fullName"
                                        name="fullName"
                                        type="text"
                                        autoComplete="name"
                                        required={
                                            !isLogin
                                        }
                                        value={
                                            formData.fullName
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        style={
                                            fieldStyle
                                        }
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label
                                htmlFor="email"
                                style={{
                                    display: 'block',
                                    marginBottom:
                                        '0.5rem',
                                    color: '#315D55',
                                    fontSize:
                                        '0.78rem',
                                    fontWeight: 700
                                }}
                            >
                                Adresse courriel
                            </label>

                            <div
                                style={{
                                    position: 'relative'
                                }}
                            >
                                <Mail
                                    size={18}
                                    style={{
                                        position:
                                            'absolute',
                                        left: 16,
                                        top: '50%',
                                        transform:
                                            'translateY(-50%)',
                                        color:
                                            '#91A69F'
                                    }}
                                />

                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={
                                        formData.email
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="vous@exemple.com"
                                    style={
                                        fieldStyle
                                    }
                                />
                            </div>
                        </div>

                        <div>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent:
                                        'space-between',
                                    gap: '1rem',
                                    alignItems:
                                        'center',
                                    marginBottom:
                                        '0.5rem'
                                }}
                            >
                                <label
                                    htmlFor="password"
                                    style={{
                                        color:
                                            '#315D55',
                                        fontSize:
                                            '0.78rem',
                                        fontWeight:
                                            700
                                    }}
                                >
                                    Mot de passe
                                </label>

                                {isLogin && (
                                    <button
                                        type="button"
                                        style={{
                                            padding: 0,
                                            border: 0,
                                            background:
                                                'transparent',
                                            color:
                                                '#A6553F',
                                            fontSize:
                                                '0.76rem',
                                            cursor:
                                                'pointer'
                                        }}
                                        onClick={() => {
                                            // Functionality to be connected later.
                                        }}
                                    >
                                        Mot de passe oublié ?
                                    </button>
                                )}
                            </div>

                            <div
                                style={{
                                    position: 'relative'
                                }}
                            >
                                <Lock
                                    size={18}
                                    style={{
                                        position:
                                            'absolute',
                                        left: 16,
                                        top: '50%',
                                        transform:
                                            'translateY(-50%)',
                                        color:
                                            '#91A69F'
                                    }}
                                />

                                <input
                                    id="password"
                                    name="password"
                                    type={
                                        showPassword
                                            ? 'text'
                                            : 'password'
                                    }
                                    autoComplete={
                                        isLogin
                                            ? 'current-password'
                                            : 'new-password'
                                    }
                                    required
                                    minLength={6}
                                    value={
                                        formData.password
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    style={
                                        fieldStyle
                                    }
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(
                                            prev => !prev
                                        )
                                    }
                                    aria-label={
                                        showPassword
                                            ? 'Masquer le mot de passe'
                                            : 'Afficher le mot de passe'
                                    }
                                    style={{
                                        position:
                                            'absolute',
                                        right: 10,
                                        top: '50%',
                                        width: 34,
                                        height: 34,
                                        transform:
                                            'translateY(-50%)',
                                        display: 'grid',
                                        placeItems:
                                            'center',
                                        border: 0,
                                        borderRadius: 8,
                                        background:
                                            'transparent',
                                        color:
                                            '#66716D',
                                        cursor:
                                            'pointer'
                                    }}
                                >
                                    {showPassword
                                        ? (
                                            <EyeOff
                                                size={
                                                    17
                                                }
                                            />
                                        )
                                        : (
                                            <Eye
                                                size={
                                                    17
                                                }
                                            />
                                        )}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div
                                style={{
                                    padding:
                                        '0.85rem 1rem',
                                    border:
                                        '1px solid rgba(166,85,63,0.22)',
                                    borderRadius: 10,
                                    background:
                                        'rgba(166,85,63,0.07)',
                                    color:
                                        '#8D4938',
                                    fontSize:
                                        '0.82rem',
                                    lineHeight: 1.5
                                }}
                            >
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                minHeight: 52,
                                marginTop:
                                    '0.35rem',
                                display: 'flex',
                                alignItems:
                                    'center',
                                justifyContent:
                                    'center',
                                gap: '0.6rem',
                                border: 0,
                                borderRadius: 11,
                                background:
                                    loading
                                        ? '#B27E6A'
                                        : '#A6553F',
                                color: '#FFFFFF',
                                fontSize:
                                    '0.9rem',
                                fontWeight: 700,
                                cursor:
                                    loading
                                        ? 'wait'
                                        : 'pointer',
                                boxShadow:
                                    '0 10px 26px rgba(166,85,63,0.17)'
                            }}
                        >
                            {loading ? (
                                <>
                                    <Loader
                                        size={17}
                                        style={{
                                            animation:
                                                'altaraAuthSpin 0.8s linear infinite'
                                        }}
                                    />
                                    Patientez…
                                </>
                            ) : (
                                <>
                                    {isLogin
                                        ? 'Se connecter'
                                        : 'Créer mon compte'}

                                    <ArrowRight
                                        size={17}
                                    />
                                </>
                            )}
                        </button>
                    </form>

                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.8rem',
                            margin:
                                '2rem 0 1.35rem'
                        }}
                    >
                        <div
                            style={{
                                flex: 1,
                                height: 1,
                                background:
                                    '#DED8CD'
                            }}
                        />

                        <span
                            style={{
                                color: '#91A69F',
                                fontSize:
                                    '0.68rem',
                                textTransform:
                                    'uppercase',
                                letterSpacing:
                                    '0.1em'
                            }}
                        >
                            ALTARA
                        </span>

                        <div
                            style={{
                                flex: 1,
                                height: 1,
                                background:
                                    '#DED8CD'
                            }}
                        />
                    </div>

                    <div
                        style={{
                            textAlign: 'center',
                            color: '#66716D',
                            fontSize: '0.84rem'
                        }}
                    >
                        {isLogin
                            ? 'Nouveau sur ALTARA ?'
                            : 'Vous avez déjà un compte ?'}

                        {' '}

                        <button
                            type="button"
                            onClick={() => {
                                setIsLogin(
                                    prev => !prev
                                );
                                setError('');
                            }}
                            style={{
                                border: 0,
                                padding: 0,
                                background:
                                    'transparent',
                                color: '#A6553F',
                                fontWeight: 700,
                                cursor: 'pointer'
                            }}
                        >
                            {isLogin
                                ? 'Créer un compte'
                                : 'Se connecter'}
                        </button>
                    </div>
                </div>
            </section>

            <style>
                {`
                    @keyframes altaraAuthSpin {
                        to {
                            transform: rotate(360deg);
                        }
                    }

                    input:focus {
                        border-color: #315D55 !important;
                        box-shadow: 0 0 0 4px rgba(49,93,85,0.08);
                    }

                    @media (max-width: 880px) {
                        main {
                            grid-template-columns: 1fr !important;
                        }

                        .altara-auth-brand {
                            min-height: auto !important;
                            padding: 42px 28px 48px !important;
                        }

                        .altara-auth-brand img {
                            width: min(78vw, 360px) !important;
                            margin-bottom: 2.5rem !important;
                        }

                        .altara-auth-form-panel {
                            min-height: auto !important;
                            padding: 52px 24px 64px !important;
                        }
                    }

                    @media (max-width: 540px) {
                        .altara-auth-brand h1 {
                            font-size: 2.45rem !important;
                        }

                        .altara-auth-brand p {
                            font-size: 0.95rem !important;
                        }
                    }
                `}
            </style>
        </main>
    );
};

export default AuthPage;
