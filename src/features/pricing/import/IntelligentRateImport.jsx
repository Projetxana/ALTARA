import React, { useRef, useState } from 'react';
import {
    UploadCloud,
    X,
    Sparkles,
    Loader2,
    AlertTriangle,
    CheckCircle2
} from 'lucide-react';

import { supabase } from '../../../lib/supabase';
import RateRuleService from '../RateRuleService';
import { resolveRateForDate } from '../RateResolver';

import {
    DEFAULT_IMPORT_SETTINGS,
    normalizeImportedPrice
} from './PriceNormalizationEngine';

const MAX_FILES = 6;

function money(value) {
    if (value === null || value === undefined) return '—';

    return new Intl.NumberFormat('fr-CA', {
        style: 'currency',
        currency: 'CAD',
        maximumFractionDigits: 0
    }).format(Number(value));
}

function moneyDetailed(value) {
    return new Intl.NumberFormat('fr-CA', {
        style: 'currency',
        currency: 'CAD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(Number(value || 0));
}

function prettyDate(dateString) {
    if (!dateString) return '—';

    return new Intl.DateTimeFormat('fr-CA', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    }).format(new Date(`${dateString}T12:00:00`));
}

function optimizeImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onerror = () =>
            reject(new Error(`Impossible de lire ${file.name}`));

        reader.onload = () => {
            const image = new Image();

            image.onerror = () =>
                reject(new Error(`Image invalide : ${file.name}`));

            image.onload = () => {
                const maxDimension = 1400;

                let width = image.width;
                let height = image.height;

                if (width > maxDimension || height > maxDimension) {
                    const ratio = Math.min(
                        maxDimension / width,
                        maxDimension / height
                    );

                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const context = canvas.getContext('2d');

                context.drawImage(
                    image,
                    0,
                    0,
                    width,
                    height
                );

                resolve(
                    canvas.toDataURL('image/jpeg', 0.78)
                );
            };

            image.src = reader.result;
        };

        reader.readAsDataURL(file);
    });
}

const Toggle = ({ checked, onChange, label }) => (
    <label
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.55rem',
            cursor: 'pointer',
            fontSize: '0.84rem',
            color: 'var(--color-text)'
        }}
    >
        <input
            type="checkbox"
            checked={checked}
            onChange={e => onChange(e.target.checked)}
        />
        {label}
    </label>
);

const NumberField = ({
    label,
    value,
    onChange,
    suffix = ''
}) => (
    <label style={{ display: 'block' }}>
        <span
            style={{
                display: 'block',
                fontSize: '0.75rem',
                color: 'var(--color-text-muted)',
                marginBottom: '0.35rem'
            }}
        >
            {label}
        </span>

        <div style={{ position: 'relative' }}>
            <input
                type="number"
                step="0.01"
                value={value}
                onChange={e =>
                    onChange(Number(e.target.value))
                }
                style={{
                    width: '100%',
                    padding: suffix
                        ? '0.65rem 2.7rem 0.65rem 0.75rem'
                        : '0.65rem 0.75rem',
                    background: 'var(--color-surface, #fff)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--color-text)'
                }}
            />

            {suffix && (
                <span
                    style={{
                        position: 'absolute',
                        right: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--color-text-muted)',
                        fontSize: '0.8rem'
                    }}
                >
                    {suffix}
                </span>
            )}
        </div>
    </label>
);

const IntelligentRateImport = ({
    chaletId,
    directCleaningFee = 0
}) => {
    const inputRef = useRef(null);
    const resultsRef = useRef(null);

    const [files, setFiles] = useState([]);
    const [settings, setSettings] = useState(
        DEFAULT_IMPORT_SETTINGS
    );

    const [rows, setRows] = useState([]);
    const [analyzing, setAnalyzing] = useState(false);
    const [applying, setApplying] = useState(false);

    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const changeSetting = (key, value) => {
        setSettings(previous => ({
            ...previous,
            [key]: value
        }));
    };

    const addFiles = selectedFiles => {
        const incoming = Array.from(selectedFiles || [])
            .filter(file =>
                file.type.startsWith('image/')
            );

        const remaining =
            MAX_FILES - files.length;

        const accepted =
            incoming.slice(0, remaining);

        const enriched = accepted.map(file => ({
            file,
            id: `${file.name}-${file.size}-${file.lastModified}`,
            preview: URL.createObjectURL(file)
        }));

        setFiles(previous => [
            ...previous,
            ...enriched
        ]);

        setRows([]);
        setMessage('');
        setError('');
    };

    const removeFile = id => {
        setFiles(previous => {
            const target =
                previous.find(item => item.id === id);

            if (target?.preview) {
                URL.revokeObjectURL(target.preview);
            }

            return previous.filter(
                item => item.id !== id
            );
        });

        setRows([]);
    };

    const analyze = async () => {
        if (!chaletId) {
            setError('Aucune propriété sélectionnée.');
            return;
        }

        if (!files.length) {
            setError(
                'Ajoutez au moins une capture du calendrier Airbnb.'
            );
            return;
        }

        try {
            setAnalyzing(true);
            setError('');
            setMessage('');
            setRows([]);

            const optimizedImages =
                await Promise.all(
                    files.map(item =>
                        optimizeImage(item.file)
                    )
                );

            const {
                data: { session },
                error: sessionError
            } = await supabase.auth.getSession();

            if (sessionError) {
                throw sessionError;
            }

            if (!session?.access_token) {
                throw new Error(
                    'Session expirée. Reconnectez-vous à ALTARA.'
                );
            }

            const response = await fetch(
                '/api/pricing/analyze-calendar',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization:
                            `Bearer ${session.access_token}`
                    },
                    body: JSON.stringify({
                        chaletId,
                        images: optimizedImages,
                        currentDate:
                            new Date()
                                .toISOString()
                                .slice(0, 10)
                    })
                }
            );

            const result =
                await response.json()
                    .catch(() => null);

            if (!response.ok) {
                throw new Error(
                    result?.error ||
                    `Analyse impossible (${response.status})`
                );
            }

            const rules =
                await RateRuleService
                    .getRulesForChalet(chaletId);

            const preparedRows =
                (result?.dates || []).map(item => {
                    let currentRate = null;
                    let currentMinStay = 1;

                    try {
                        const resolved =
                            resolveRateForDate(
                                rules,
                                item.date
                            );

                        currentRate =
                            resolved.nightlyRate;

                        currentMinStay =
                            resolved.minStay;
                    } catch {
                        // Import can still be reviewed even if
                        // canonical rates are not initialized.
                    }

                    const normalized =
                        normalizeImportedPrice(
                            item.displayed_price,
                            settings
                        );

                    const proposedRate =
                        normalized.proposedRate;

                    const ratio =
                        currentRate > 0
                            ? proposedRate / currentRate
                            : null;

                    const outlier =
                        ratio !== null &&
                        (ratio > 1.8 || ratio < 0.55);

                    // A large difference with the current ALTARA price
                    // can be perfectly legitimate: the objective of this
                    // import is precisely to rebuild the direct rate from Airbnb.
                    const needsReview =
                        Number(item.confidence) < 85 ||
                        proposedRate <= 0;

                    return {
                        date: item.date,
                        displayedPrice:
                            Number(item.displayed_price),
                        confidence:
                            Number(item.confidence),
                        rawText:
                            item.raw_text || '',
                        currentRate,
                        currentMinStay,
                        proposedRate,
                        totalDeduction:
                            normalized.totalDeduction,
                        deductions:
                            normalized.deductions,
                        referenceNights:
                            normalized.referenceNights,
                        outlier,
                        needsReview,
                        selected: !needsReview
                    };
                });

            preparedRows.sort(
                (a, b) =>
                    a.date.localeCompare(b.date)
            );

            setRows(preparedRows);

            if (preparedRows.length) {
                window.setTimeout(() => {
                    resultsRef.current?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }, 180);
            }

            if (!preparedRows.length) {
                setError(
                    'Aucun tarif exploitable n’a été détecté.'
                );
            }
        } catch (analysisError) {
            console.error(
                '[IntelligentRateImport]',
                analysisError
            );

            setError(
                analysisError.message ||
                'Impossible d’analyser les captures.'
            );
        } finally {
            setAnalyzing(false);
        }
    };

    const updateRow = (index, patch) => {
        setRows(previous =>
            previous.map((row, rowIndex) =>
                rowIndex === index
                    ? { ...row, ...patch }
                    : row
            )
        );
    };

    const applyRates = async () => {
        const selectedRows =
            rows.filter(row =>
                row.selected &&
                Number(row.proposedRate) > 0
            );

        if (!selectedRows.length) {
            setError(
                'Sélectionnez au moins un tarif à appliquer.'
            );
            return;
        }

        try {
            setApplying(true);
            setError('');
            setMessage('');

            await RateRuleService
                .replaceManualRatesForDates(
                    chaletId,
                    selectedRows.map(row => ({
                        date: row.date,
                        price:
                            Number(row.proposedRate),
                        minStay:
                            row.currentMinStay || 1,
                        source: 'airbnb_import'
                    }))
                );

            setRows(previous =>
                previous.map(row =>
                    row.selected
                        ? {
                            ...row,
                            currentRate:
                                row.proposedRate,
                            needsReview: false
                        }
                        : row
                )
            );

            setMessage(
                `${selectedRows.length} tarif${selectedRows.length > 1 ? 's' : ''} appliqué${selectedRows.length > 1 ? 's' : ''} à ALTARA.`
            );

            window.dispatchEvent(
                new CustomEvent(
                    'altara:rates-updated',
                    {
                        detail: { chaletId }
                    }
                )
            );
        } catch (applyError) {
            console.error(
                '[IntelligentRateImport] Apply failed:',
                applyError
            );

            setError(
                applyError.message ||
                'Impossible d’appliquer les tarifs.'
            );
        } finally {
            setApplying(false);
        }
    };

    const selectedCount =
        rows.filter(row => row.selected).length;

    const allSelected =
        rows.length > 0 &&
        rows.every(row => row.selected);

    const toggleAllRows = checked => {
        setRows(previous =>
            previous.map(row => ({
                ...row,
                selected: checked
            }))
        );
    };

    return (
        <div>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '2rem',
                    marginBottom: '1.5rem'
                }}
            >
                <div>
                    <h4
                        style={{
                            fontSize: '1.3rem',
                            marginBottom: '0.35rem'
                        }}
                    >
                        Import intelligent des tarifs
                    </h4>

                    <p
                        style={{
                            color: 'var(--color-text-muted)',
                            maxWidth: '720px',
                            fontSize: '0.9rem'
                        }}
                    >
                        Importez des captures de votre calendrier Airbnb.
                        ALTARA lit les prix affichés puis retire uniquement
                        les frais, commissions et taxes que vous indiquez
                        comme inclus afin de reconstruire votre tarif direct.
                    </p>
                </div>

                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        padding: '0.45rem 0.75rem',
                        background: '#F4EFE6',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        color: '#66716D'
                    }}
                >
                    <Sparkles size={14} />
                    Airbnb · Vision
                </div>
            </div>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns:
                        'minmax(300px, 0.9fr) minmax(380px, 1.1fr)',
                    gap: '1.25rem',
                    marginBottom: '1.5rem'
                }}
            >
                <div
                    onDragOver={e =>
                        e.preventDefault()
                    }
                    onDrop={e => {
                        e.preventDefault();
                        addFiles(
                            e.dataTransfer.files
                        );
                    }}
                    onClick={() =>
                        inputRef.current?.click()
                    }
                    style={{
                        minHeight: '230px',
                        border:
                            '1px dashed #CFC5B6',
                        borderRadius:
                            'var(--radius-lg)',
                        background: '#FCFAF6',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '2rem',
                        cursor: 'pointer',
                        textAlign: 'center'
                    }}
                >
                    <UploadCloud
                        size={34}
                        strokeWidth={1.5}
                        style={{
                            color: '#A6553F',
                            marginBottom: '0.8rem'
                        }}
                    />

                    <strong
                        style={{
                            fontSize: '0.95rem'
                        }}
                    >
                        Déposer les captures Airbnb
                    </strong>

                    <span
                        style={{
                            marginTop: '0.3rem',
                            color:
                                'var(--color-text-muted)',
                            fontSize: '0.8rem'
                        }}
                    >
                        PNG, JPG ou WEBP · jusqu’à {MAX_FILES} images
                    </span>

                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        hidden
                        onChange={e => {
                            addFiles(e.target.files);
                            e.target.value = '';
                        }}
                    />
                </div>

                <div
                    style={{
                        border:
                            '1px solid var(--color-border)',
                        borderRadius:
                            'var(--radius-lg)',
                        padding: '1.25rem',
                        background:
                            'var(--color-surface, #fff)'
                    }}
                >
                    <h5
                        style={{
                            fontFamily:
                                'var(--font-sans)',
                            fontSize: '0.85rem',
                            marginBottom: '1rem'
                        }}
                    >
                        Paramètres de conversion Airbnb
                    </h5>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns:
                                'repeat(3, 1fr)',
                            gap: '0.8rem'
                        }}
                    >
                        <NumberField
                            label="Frais plateforme"
                            value={
                                settings.platformFeePct
                            }
                            suffix="%"
                            onChange={value =>
                                changeSetting(
                                    'platformFeePct',
                                    value
                                )
                            }
                        />

                        <NumberField
                            label="Taxe hébergement"
                            value={
                                settings.lodgingTaxPct
                            }
                            suffix="%"
                            onChange={value =>
                                changeSetting(
                                    'lodgingTaxPct',
                                    value
                                )
                            }
                        />

                        <NumberField
                            label="TPS"
                            value={settings.gstPct}
                            suffix="%"
                            onChange={value =>
                                changeSetting(
                                    'gstPct',
                                    value
                                )
                            }
                        />

                        <NumberField
                            label="TVQ"
                            value={settings.qstPct}
                            suffix="%"
                            onChange={value =>
                                changeSetting(
                                    'qstPct',
                                    value
                                )
                            }
                        />

                        <NumberField
                            label="Ménage Airbnb"
                            value={settings.cleaningFee}
                            suffix="$"
                            onChange={value =>
                                changeSetting(
                                    'cleaningFee',
                                    value
                                )
                            }
                        />

                        <NumberField
                            label="Séjour de référence"
                            value={
                                settings.assumedStayNights
                            }
                            suffix="nuits"
                            onChange={value =>
                                changeSetting(
                                    'assumedStayNights',
                                    Math.max(1, value)
                                )
                            }
                        />
                    </div>

                    <div
                        style={{
                            marginTop: '1rem',
                            paddingTop: '1rem',
                            borderTop:
                                '1px solid var(--color-border)',
                            display: 'grid',
                            gridTemplateColumns:
                                '1fr 1fr',
                            gap: '0.6rem 1rem'
                        }}
                    >
                        <Toggle
                            checked={
                                settings.includePlatformFee
                            }
                            onChange={value =>
                                changeSetting(
                                    'includePlatformFee',
                                    value
                                )
                            }
                            label="Frais plateforme inclus"
                        />

                        <Toggle
                            checked={
                                settings.includeLodgingTax
                            }
                            onChange={value =>
                                changeSetting(
                                    'includeLodgingTax',
                                    value
                                )
                            }
                            label="Taxe hébergement incluse"
                        />

                        <Toggle
                            checked={settings.includeGst}
                            onChange={value =>
                                changeSetting(
                                    'includeGst',
                                    value
                                )
                            }
                            label="TPS incluse"
                        />

                        <Toggle
                            checked={settings.includeQst}
                            onChange={value =>
                                changeSetting(
                                    'includeQst',
                                    value
                                )
                            }
                            label="TVQ incluse"
                        />

                        <Toggle
                            checked={
                                settings.includeCleaning
                            }
                            onChange={value =>
                                changeSetting(
                                    'includeCleaning',
                                    value
                                )
                            }
                            label="Ménage Airbnb inclus dans le prix affiché"
                        />
                    </div>

                    <div
                        style={{
                            marginTop: '1rem',
                            padding: '0.9rem 1rem',
                            background: '#F4EFE6',
                            border: '1px solid #E5DED3',
                            borderRadius: 'var(--radius-md)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '1rem'
                        }}
                    >
                        <div>
                            <div
                                style={{
                                    fontSize: '0.75rem',
                                    color: 'var(--color-text-muted)',
                                    marginBottom: '0.2rem'
                                }}
                            >
                                Ménage direct ALTARA
                            </div>

                            <strong
                                style={{
                                    color: '#173A35',
                                    fontSize: '1rem'
                                }}
                            >
                                {money(directCleaningFee)}
                            </strong>
                        </div>

                        <div
                            style={{
                                maxWidth: '330px',
                                textAlign: 'right',
                                color: 'var(--color-text-muted)',
                                fontSize: '0.76rem',
                                lineHeight: 1.45
                            }}
                        >
                            Configuré dans Fees & Extras.
                            Ce montant n'entre pas dans le tarif de nuit :
                            il sera ajouté séparément aux réservations directes.
                        </div>
                    </div>
                </div>
            </div>

            {files.length > 0 && (
                <div
                    style={{
                        display: 'flex',
                        gap: '0.75rem',
                        flexWrap: 'wrap',
                        marginBottom: '1.25rem'
                    }}
                >
                    {files.map(item => (
                        <div
                            key={item.id}
                            style={{
                                position: 'relative',
                                width: '115px',
                                height: '78px',
                                borderRadius: '10px',
                                overflow: 'hidden',
                                border:
                                    '1px solid var(--color-border)'
                            }}
                        >
                            <img
                                src={item.preview}
                                alt={item.file.name}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                }}
                            />

                            <button
                                onClick={e => {
                                    e.stopPropagation();
                                    removeFile(item.id);
                                }}
                                style={{
                                    position: 'absolute',
                                    top: 4,
                                    right: 4,
                                    width: 24,
                                    height: 24,
                                    display: 'grid',
                                    placeItems: 'center',
                                    border: 'none',
                                    borderRadius: '50%',
                                    background:
                                        'rgba(21,33,31,.84)',
                                    color: '#fff',
                                    cursor: 'pointer'
                                }}
                            >
                                <X size={13} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: rows.length
                        ? '1.25rem'
                        : 0
                }}
            >
                <div>
                    {error && (
                        <div
                            style={{
                                display: 'flex',
                                gap: '0.5rem',
                                alignItems: 'center',
                                color: '#A6553F',
                                fontSize: '0.82rem'
                            }}
                        >
                            <AlertTriangle size={16} />
                            {error}
                        </div>
                    )}

                    {message && (
                        <div
                            style={{
                                display: 'flex',
                                gap: '0.5rem',
                                alignItems: 'center',
                                color: '#315D55',
                                fontSize: '0.82rem'
                            }}
                        >
                            <CheckCircle2 size={16} />
                            {message}
                        </div>
                    )}
                </div>

                <button
                    className="btn-primary"
                    onClick={analyze}
                    disabled={
                        !files.length ||
                        analyzing
                    }
                    style={{
                        background: '#A6553F'
                    }}
                >
                    {analyzing ? (
                        <Loader2
                            size={16}
                            className="spin"
                        />
                    ) : (
                        <Sparkles size={16} />
                    )}

                    {analyzing
                        ? 'Analyse en cours…'
                        : 'Analyser les tarifs'}
                </button>
            </div>

            {rows.length > 0 && (
                <div
                    ref={resultsRef}
                    style={{
                        scrollMarginTop: '1rem',
                        border:
                            '1px solid var(--color-border)',
                        borderRadius:
                            'var(--radius-lg)',
                        overflow: 'hidden',
                        background: '#fff'
                    }}
                >
                    <div
                        style={{
                            padding:
                                '1rem 1.25rem',
                            display: 'flex',
                            justifyContent:
                                'space-between',
                            alignItems: 'center',
                            background: '#FCFAF6',
                            borderBottom:
                                '1px solid var(--color-border)'
                        }}
                    >
                        <div>
                            <strong>
                                Résultat de l’analyse
                            </strong>

                            <div
                                style={{
                                    fontSize: '0.75rem',
                                    color:
                                        'var(--color-text-muted)',
                                    marginTop: '0.15rem'
                                }}
                            >
                                Les lignes incertaines ne sont
                                jamais sélectionnées automatiquement.
                            </div>
                        </div>

                        <strong
                            style={{
                                color: '#A6553F',
                                fontSize: '0.85rem'
                            }}
                        >
                            {selectedCount} sélectionné
                            {selectedCount > 1 ? 's' : ''}
                        </strong>
                    </div>

                    <div
                        style={{
                            overflowX: 'auto'
                        }}
                    >
                        <table
                            style={{
                                width: '100%',
                                minWidth: '820px'
                            }}
                        >
                            <thead>
                                <tr>
                                    <th
                                        style={{
                                            padding: '0.8rem',
                                            textAlign: 'center'
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={allSelected}
                                            onChange={e =>
                                                toggleAllRows(e.target.checked)
                                            }
                                            title="Tout sélectionner"
                                            aria-label="Tout sélectionner"
                                        />
                                    </th>

                                    <th style={{ textAlign: 'left', padding: '0.8rem' }}>
                                        Date
                                    </th>
                                    <th style={{ textAlign: 'right', padding: '0.8rem' }}>
                                        Airbnb
                                    </th>
                                    <th style={{ textAlign: 'right', padding: '0.8rem' }}>
                                        ALTARA
                                    </th>
                                    <th style={{ textAlign: 'right', padding: '0.8rem' }}>
                                        Tarif direct ALTARA
                                    </th>
                                    <th style={{ textAlign: 'right', padding: '0.8rem' }}>
                                        Écart
                                    </th>
                                    <th style={{ textAlign: 'center', padding: '0.8rem' }}>
                                        Confiance
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {rows.map(
                                    (row, index) => {
                                        const difference =
                                            row.currentRate !== null
                                                ? row.proposedRate -
                                                  row.currentRate
                                                : null;

                                        return (
                                            <tr
                                                key={row.date}
                                                style={{
                                                    background:
                                                        row.needsReview
                                                            ? '#FFF9F3'
                                                            : '#fff'
                                                }}
                                            >
                                                <td
                                                    style={{
                                                        padding: '0.8rem',
                                                        borderTop:
                                                            '1px solid var(--color-border)'
                                                    }}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            row.selected
                                                        }
                                                        onChange={e =>
                                                            updateRow(
                                                                index,
                                                                {
                                                                    selected:
                                                                        e.target.checked
                                                                }
                                                            )
                                                        }
                                                    />
                                                </td>

                                                <td
                                                    style={{
                                                        padding: '0.8rem',
                                                        borderTop:
                                                            '1px solid var(--color-border)'
                                                    }}
                                                >
                                                    <strong
                                                        style={{
                                                            fontSize: '0.82rem'
                                                        }}
                                                    >
                                                        {prettyDate(row.date)}
                                                    </strong>

                                                    {row.needsReview && (
                                                        <div
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '0.3rem',
                                                                marginTop: '0.25rem',
                                                                fontSize: '0.7rem',
                                                                color: '#A6553F'
                                                            }}
                                                        >
                                                            <AlertTriangle size={12} />
                                                            À vérifier
                                                        </div>
                                                    )}
                                                </td>

                                                <td
                                                    style={{
                                                        textAlign: 'right',
                                                        padding: '0.8rem',
                                                        borderTop:
                                                            '1px solid var(--color-border)'
                                                    }}
                                                >
                                                    {money(
                                                        row.displayedPrice
                                                    )}
                                                </td>

                                                <td
                                                    style={{
                                                        textAlign: 'right',
                                                        padding: '0.8rem',
                                                        borderTop:
                                                            '1px solid var(--color-border)',
                                                        color:
                                                            'var(--color-text-muted)'
                                                    }}
                                                >
                                                    {money(
                                                        row.currentRate
                                                    )}
                                                </td>

                                                <td
                                                    style={{
                                                        textAlign: 'right',
                                                        padding: '0.8rem',
                                                        borderTop:
                                                            '1px solid var(--color-border)'
                                                    }}
                                                >
                                                    <input
                                                        type="number"
                                                        value={
                                                            row.proposedRate
                                                        }
                                                        onChange={e =>
                                                            updateRow(
                                                                index,
                                                                {
                                                                    proposedRate:
                                                                        Number(
                                                                            e.target.value
                                                                        )
                                                                }
                                                            )
                                                        }
                                                        style={{
                                                            width: '92px',
                                                            padding:
                                                                '0.45rem 0.55rem',
                                                            textAlign: 'right',
                                                            background: '#fff',
                                                            border:
                                                                '1px solid var(--color-border)',
                                                            borderRadius: '7px'
                                                        }}
                                                    />

                                                    <div
                                                        style={{
                                                            marginTop: '0.35rem',
                                                            fontSize: '0.65rem',
                                                            lineHeight: 1.45,
                                                            color: 'var(--color-text-muted)',
                                                            whiteSpace: 'nowrap'
                                                        }}
                                                    >
                                                        − {moneyDetailed(row.deductions?.taxes)} taxes
                                                        {' · '}
                                                        − {moneyDetailed(row.deductions?.platformFee)} Airbnb
                                                        {' · '}
                                                        − {moneyDetailed(row.deductions?.cleaning)} ménage
                                                    </div>
                                                </td>

                                                <td
                                                    style={{
                                                        textAlign: 'right',
                                                        padding: '0.8rem',
                                                        borderTop:
                                                            '1px solid var(--color-border)',
                                                        color:
                                                            difference > 0
                                                                ? '#A6553F'
                                                                : difference < 0
                                                                    ? '#315D55'
                                                                    : 'var(--color-text-muted)'
                                                    }}
                                                >
                                                    {difference === null
                                                        ? '—'
                                                        : `${difference > 0 ? '+' : ''}${money(difference)}`}
                                                </td>

                                                <td
                                                    style={{
                                                        textAlign: 'center',
                                                        padding: '0.8rem',
                                                        borderTop:
                                                            '1px solid var(--color-border)'
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            display: 'inline-flex',
                                                            minWidth: '50px',
                                                            justifyContent: 'center',
                                                            padding:
                                                                '0.25rem 0.45rem',
                                                            borderRadius: '999px',
                                                            fontSize: '0.72rem',
                                                            fontWeight: 600,
                                                            background:
                                                                row.confidence >= 90
                                                                    ? '#EDF5EF'
                                                                    : row.confidence >= 75
                                                                        ? '#FFF4E5'
                                                                        : '#FBEDEC',
                                                            color:
                                                                row.confidence >= 90
                                                                    ? '#315D55'
                                                                    : '#A6553F'
                                                        }}
                                                    >
                                                        {row.confidence} %
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    }
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            padding: '1rem 1.25rem',
                            background: '#FCFAF6',
                            borderTop:
                                '1px solid var(--color-border)'
                        }}
                    >
                        <button
                            className="btn-primary"
                            onClick={applyRates}
                            disabled={
                                applying ||
                                selectedCount === 0
                            }
                            style={{
                                background: '#173A35'
                            }}
                        >
                            {applying && (
                                <Loader2 size={16} />
                            )}

                            {applying
                                ? 'Application…'
                                : `Appliquer ${selectedCount} tarif${selectedCount > 1 ? 's' : ''}`}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IntelligentRateImport;
