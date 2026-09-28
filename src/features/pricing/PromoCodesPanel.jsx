import React, { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const fieldStyle = {
    width: '100%',
    padding: '0.65rem 0.75rem',
    borderRadius: '6px',
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text)'
};

const labelStyle = {
    display: 'block',
    marginBottom: '0.35rem',
    fontSize: '0.75rem',
    color: 'var(--color-text-muted)'
};

const PromoCodesPanel = ({ chaletId }) => {
    const [codes, setCodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const [draft, setDraft] = useState({
        code: '',
        discount_type: 'percent',
        discount_value: 10,
        active: true,
        valid_from: '',
        valid_until: '',
        max_uses: '',
        min_nights: 1
    });

    const loadCodes = async () => {
        if (!chaletId) return;

        setLoading(true);
        setError('');

        const { data, error: loadError } = await supabase
            .from('promo_codes')
            .select('*')
            .eq('chalet_id', chaletId)
            .order('created_at', { ascending: false });

        if (loadError) {
            setError(loadError.message);
        } else {
            setCodes(data || []);
        }

        setLoading(false);
    };

    useEffect(() => {
        loadCodes();
    }, [chaletId]);

    const addCode = async () => {
        const code = draft.code.trim().toUpperCase();

        if (!code) {
            setError('Le code promo est requis.');
            return;
        }

        setSaving(true);
        setError('');

        const { error: insertError } = await supabase
            .from('promo_codes')
            .insert({
                chalet_id: chaletId,
                code,
                discount_type: draft.discount_type,
                discount_value: Number(draft.discount_value),
                active: draft.active,
                valid_from: draft.valid_from || null,
                valid_until: draft.valid_until || null,
                max_uses:
                    draft.max_uses === ''
                        ? null
                        : Number(draft.max_uses),
                min_nights: Math.max(
                    1,
                    Number(draft.min_nights || 1)
                )
            });

        if (insertError) {
            setError(insertError.message);
        } else {
            setDraft({
                code: '',
                discount_type: 'percent',
                discount_value: 10,
                active: true,
                valid_from: '',
                valid_until: '',
                max_uses: '',
                min_nights: 1
            });

            await loadCodes();
        }

        setSaving(false);
    };

    const updateCode = async (id, changes) => {
        setError('');

        const { error: updateError } = await supabase
            .from('promo_codes')
            .update(changes)
            .eq('id', id);

        if (updateError) {
            setError(updateError.message);
            await loadCodes();
            return;
        }

        setCodes(previous =>
            previous.map(item =>
                item.id === id
                    ? { ...item, ...changes }
                    : item
            )
        );
    };

    const deleteCode = async id => {
        const { error: deleteError } = await supabase
            .from('promo_codes')
            .delete()
            .eq('id', id);

        if (deleteError) {
            setError(deleteError.message);
            return;
        }

        setCodes(previous =>
            previous.filter(item => item.id !== id)
        );
    };

    return (
        <div
            style={{
                gridColumn: '1 / -1',
                padding: '1.5rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                background: 'rgba(255,255,255,0.02)'
            }}
        >
            <h4 style={{ margin: '0 0 0.35rem' }}>
                Codes promo
            </h4>

            <p
                style={{
                    margin: '0 0 1.5rem',
                    color: 'var(--color-text-muted)',
                    fontSize: '0.85rem'
                }}
            >
                Codes utilisables directement lors d’une réservation
                sur le site AYANA.
            </p>

            {error && (
                <div
                    style={{
                        marginBottom: '1rem',
                        padding: '0.75rem 1rem',
                        color: '#ef4444',
                        background: 'rgba(239,68,68,0.1)',
                        borderRadius: '6px'
                    }}
                >
                    {error}
                </div>
            )}

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns:
                        '1.2fr 1fr 0.8fr 1fr 1fr 0.8fr 0.8fr auto',
                    gap: '0.75rem',
                    alignItems: 'end',
                    marginBottom: '1.5rem'
                }}
            >
                <div>
                    <label style={labelStyle}>Code</label>
                    <input
                        value={draft.code}
                        placeholder="AYANA10"
                        onChange={e =>
                            setDraft(previous => ({
                                ...previous,
                                code: e.target.value.toUpperCase()
                            }))
                        }
                        style={fieldStyle}
                    />
                </div>

                <div>
                    <label style={labelStyle}>Type</label>
                    <select
                        value={draft.discount_type}
                        onChange={e =>
                            setDraft(previous => ({
                                ...previous,
                                discount_type: e.target.value
                            }))
                        }
                        style={fieldStyle}
                    >
                        <option value="percent">Pourcentage</option>
                        <option value="fixed">Montant fixe</option>
                    </select>
                </div>

                <div>
                    <label style={labelStyle}>Remise</label>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={draft.discount_value}
                        onChange={e =>
                            setDraft(previous => ({
                                ...previous,
                                discount_value: e.target.value
                            }))
                        }
                        style={fieldStyle}
                    />
                </div>

                <div>
                    <label style={labelStyle}>Du</label>
                    <input
                        type="date"
                        value={draft.valid_from}
                        onChange={e =>
                            setDraft(previous => ({
                                ...previous,
                                valid_from: e.target.value
                            }))
                        }
                        style={fieldStyle}
                    />
                </div>

                <div>
                    <label style={labelStyle}>Au</label>
                    <input
                        type="date"
                        value={draft.valid_until}
                        onChange={e =>
                            setDraft(previous => ({
                                ...previous,
                                valid_until: e.target.value
                            }))
                        }
                        style={fieldStyle}
                    />
                </div>

                <div>
                    <label style={labelStyle}>Min. nuits</label>
                    <input
                        type="number"
                        min="1"
                        value={draft.min_nights}
                        onChange={e =>
                            setDraft(previous => ({
                                ...previous,
                                min_nights: e.target.value
                            }))
                        }
                        style={fieldStyle}
                    />
                </div>

                <div>
                    <label style={labelStyle}>Max usages</label>
                    <input
                        type="number"
                        min="1"
                        placeholder="∞"
                        value={draft.max_uses}
                        onChange={e =>
                            setDraft(previous => ({
                                ...previous,
                                max_uses: e.target.value
                            }))
                        }
                        style={fieldStyle}
                    />
                </div>

                <button
                    type="button"
                    className="btn-primary"
                    onClick={addCode}
                    disabled={saving}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        justifyContent: 'center'
                    }}
                >
                    <Plus size={16} />
                    Ajouter
                </button>
            </div>

            {loading ? (
                <div style={{ color: 'var(--color-text-muted)' }}>
                    Chargement…
                </div>
            ) : (
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem'
                    }}
                >
                    {codes.map(item => (
                        <div
                            key={item.id}
                            style={{
                                display: 'grid',
                                gridTemplateColumns:
                                    '1.2fr 1fr 0.8fr 1fr 1fr 0.8fr 0.8fr auto',
                                gap: '0.75rem',
                                alignItems: 'center',
                                padding: '0.9rem',
                                border:
                                    '1px solid var(--color-border)',
                                borderRadius: '8px'
                            }}
                        >
                            <strong>{item.code}</strong>

                            <span>
                                {item.discount_type === 'percent'
                                    ? 'Pourcentage'
                                    : 'Montant fixe'}
                            </span>

                            <strong>
                                {Number(item.discount_value)}
                                {item.discount_type === 'percent'
                                    ? ' %'
                                    : ' $'}
                            </strong>

                            <span>
                                {item.valid_from || '—'}
                            </span>

                            <span>
                                {item.valid_until || '—'}
                            </span>

                            <span>
                                {item.min_nights || 1} nuit(s)
                            </span>

                            <label
                                style={{
                                    display: 'flex',
                                    gap: '0.4rem',
                                    alignItems: 'center'
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={Boolean(item.active)}
                                    onChange={e =>
                                        updateCode(item.id, {
                                            active:
                                                e.target.checked
                                        })
                                    }
                                />
                                Actif
                            </label>

                            <button
                                type="button"
                                title="Supprimer"
                                onClick={() =>
                                    deleteCode(item.id)
                                }
                                style={{
                                    border: 0,
                                    background: 'transparent',
                                    color: '#ef4444',
                                    cursor: 'pointer'
                                }}
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PromoCodesPanel;
