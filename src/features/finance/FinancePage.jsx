import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, TrendingUp, TrendingDown, DollarSign, X, Calendar as CalendarIcon, Edit2, Trash2, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '../../context/LanguageContext';

const FinancePage = () => {
    const { t, language } = useLanguage();
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);

    // Form State
    const [newItem, setNewItem] = useState({
        description: '',
        amount: '',
        type: 'expense',
        date: new Date().toISOString().split('T')[0],
        category: '',
        taxType: 'tps_tvq' // 'none', 'tps_tvq', 'tps_only', 'custom'
    });
    const [newCategory, setNewCategory] = useState('');
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchTransactions();
        fetchCategories();
    }, []);

    const fetchTransactions = async () => {
        setIsLoading(true);
        // Ensure we fetch tax_rate if it exists. If column missing, it returns null implicitly for that field
        const { data, error } = await supabase
            .from('finance_entries')
            .select('*')
            .order('date', { ascending: false });

        if (error) console.error('Error fetching finance:', error);
        else setTransactions(data || []);
        setIsLoading(false);
    };

    const fetchCategories = async () => {
        const { data, error } = await supabase
            .from('finance_categories')
            .select('*')
            .order('name', { ascending: true });

        if (error || !data || data.length === 0) {
            // Default categories if table empty or missing
            setCategories([
                { id: '1', name: 'General' },
                { id: '2', name: 'Maintenance' },
                { id: '3', name: 'Supplies' },
                { id: '4', name: 'Utilities' },
                { id: '5', name: 'Booking' },
                { id: '6', name: 'Taxes/Licences' }
            ]);
        } else {
            setCategories(data);
            if (data.length > 0) {
                setNewItem(prev => ({ ...prev, category: data[0].name }));
            }
        }
    };

    // Tax Logic
    const getTaxRate = (type) => {
        switch (type) {
            case 'tps_tvq': return 14.975; // 5% GST + 9.975% QST
            case 'tps_only': return 5.0;
            case 'none': return 0;
            default: return 0;
        }
    };

    const calculateAmounts = (total, rate) => {
        const net = total / (1 + rate / 100);
        const tax = total - net;
        return { net, tax, total };
    };

    const handleSave = async (e) => {
        e.preventDefault();

        const taxRate = getTaxRate(newItem.taxType);

        const itemData = {
            description: newItem.description,
            amount: parseFloat(newItem.amount), // Storing Total (TTC)
            type: newItem.type,
            date: newItem.date,
            category: newItem.category || (categories.length > 0 ? categories[0].name : 'General'),
            tax_rate: taxRate // Storing rate to recalculate net/tax on display
        };

        let error;

        if (editingId) {
            const { error: updateError } = await supabase
                .from('finance_entries')
                .update(itemData)
                .eq('id', editingId);
            error = updateError;
        } else {
            const { error: insertError } = await supabase
                .from('finance_entries')
                .insert([itemData]);
            error = insertError;
        }

        if (error) {
            console.error(error);
            alert('Error saving entry. Ensure database schema has "tax_rate" column.');
        } else {
            setShowModal(false);
            fetchTransactions();
            resetForm();
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setNewItem({
            description: '',
            amount: '',
            type: 'expense',
            date: new Date().toISOString().split('T')[0],
            category: categories.length > 0 ? categories[0].name : 'General',
            taxType: 'tps_tvq'
        });
    };

    const handleEdit = (item) => {
        setEditingId(item.id);

        // Determine tax type from rate
        let tType = 'none';
        const rate = parseFloat(item.tax_rate || 0);
        if (Math.abs(rate - 14.975) < 0.1) tType = 'tps_tvq';
        else if (Math.abs(rate - 5.0) < 0.1) tType = 'tps_only';
        else if (rate > 0) tType = 'custom';

        setNewItem({
            description: item.description,
            amount: item.amount,
            type: item.type,
            date: item.date,
            category: item.category,
            taxType: tType
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm(t('fin_delete_confirm') || 'Are you sure?')) return;

        const { error } = await supabase
            .from('finance_entries')
            .delete()
            .eq('id', id);

        if (error) alert('Error deleting');
        else fetchTransactions();
    };

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        if (!newCategory.trim()) return;

        const { data, error } = await supabase
            .from('finance_categories')
            .insert([{ name: newCategory.trim() }])
            .select();

        if (error) {
            alert('Error creating category.');
        } else {
            setNewCategory('');
            fetchCategories();
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!window.confirm('Delete this category?')) return;
        const { error } = await supabase.from('finance_categories').delete().eq('id', id);
        if (!error) fetchCategories();
    };

    // Derived Totals
    const totals = transactions.reduce((acc, curr) => {
        const amt = parseFloat(curr.amount);
        if (curr.type === 'revenue') {
            acc.revenue += amt;
            acc.net += amt;
        } else {
            acc.expenses += amt;
            acc.net -= amt;
        }
        return acc;
    }, { revenue: 0, expenses: 0, net: 0 });

    // Tax Report Calculation
    const taxReport = transactions.reduce((acc, curr) => {
        const rate = parseFloat(curr.tax_rate || 0);
        const { net, tax } = calculateAmounts(parseFloat(curr.amount), rate);

        // TPS is approx 5/14.975 of the tax if rate is 14.975, or all if 5%
        // Simplified Logic for Quebec: 
        // If rate ~ 14.975 => TPS = Net * 0.05, TVQ = Net * 0.09975
        // If rate ~ 5 => TPS = Tax, TVQ = 0

        let tps = 0;
        let tvq = 0;

        if (Math.abs(rate - 14.975) < 0.1) {
            tps = net * 0.05;
            tvq = net * 0.09975;
        } else if (Math.abs(rate - 5.0) < 0.1) {
            tps = tax;
        } else {
            // Treat as custom/other tax (assign to TPS for simplicity or ignore)
            tps = tax;
        }

        if (curr.type === 'revenue') {
            acc.tpsCollected += tps;
            acc.tvqCollected += tvq;
        } else {
            acc.tpsPaid += tps;
            acc.tvqPaid += tvq;
        }
        return acc;
    }, { tpsCollected: 0, tvqCollected: 0, tpsPaid: 0, tvqPaid: 0 });

    const netTPS = taxReport.tpsCollected - taxReport.tpsPaid;
    const netTVQ = taxReport.tvqCollected - taxReport.tvqPaid;
    const totalToPay = netTPS + netTVQ;

    return (
        <div style={{ position: 'relative' }}>
            {/* HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0 }}>{t('fin_title')}</h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>{t('fin_subtitle')}</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => setShowReportModal(true)} className="btn-secondary" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid #3b82f6', color: '#60a5fa' }}>
                        <FileText size={18} /> {t('fin_report_btn')}
                    </button>
                    <button onClick={() => setShowCategoryModal(true)} className="btn-secondary" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        {t('fin_manage_categories')}
                    </button>
                    <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <Plus size={20} /> {t('fin_new_entry')}
                    </button>
                </div>
            </div>

            {/* SUMMARY CARDS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                <StatsCard title={t('fin_total_rev')} value={totals.revenue} icon={<TrendingUp size={20} />} color="#10b981" />
                <StatsCard title={t('fin_total_exp')} value={totals.expenses} icon={<TrendingDown size={20} />} color="#ef4444" />
                <StatsCard title={t('fin_net_profit')} value={totals.net} icon={<DollarSign size={20} />} color="#3b82f6" />
            </div>

            {/* TRANSACTIONS TABLE */}
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>{t('fin_recent_trans')}</h3>
                {isLoading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>{t('loading')}</div>
                ) : transactions.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>
                        {t('fin_no_trans')}
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                                    <th style={{ padding: '1rem' }}>{t('fin_date')}</th>
                                    <th style={{ padding: '1rem' }}>{t('fin_desc')}</th>
                                    <th style={{ padding: '1rem' }}>{t('fin_cat')}</th>
                                    <th style={{ padding: '1rem', textAlign: 'right' }}>{t('fin_net')}</th>
                                    <th style={{ padding: '1rem', textAlign: 'right' }}>{t('fin_tax')}</th>
                                    <th style={{ padding: '1rem', textAlign: 'right' }}>{t('fin_total')}</th>
                                    <th style={{ padding: '1rem', textAlign: 'right', width: '100px' }}>{t('fin_actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((tItem) => {
                                    const { net, tax, total } = calculateAmounts(parseFloat(tItem.amount), parseFloat(tItem.tax_rate || 0));
                                    const isRev = tItem.type === 'revenue';

                                    return (
                                        <tr key={tItem.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.95rem' }}>
                                            <td style={{ padding: '1rem' }}>{format(new Date(tItem.date), 'dd/MM/yyyy')}</td>
                                            <td style={{ padding: '1rem' }}>{tItem.description}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: '12px', background: 'rgba(255,255,255,0.1)' }}>
                                                    {tItem.category}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'right', color: 'var(--color-text-muted)' }}>
                                                {isRev ? '' : '-'}${net.toFixed(2)}
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'right', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                                                ${tax.toFixed(2)}
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'right', color: isRev ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>
                                                {isRev ? '+' : '-'}${total.toFixed(2)}
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                    <button onClick={() => handleEdit(tItem)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer' }}>
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button onClick={() => handleDelete(tItem.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* TRANSACTION MODAL */}
            {showModal && (
                <div style={modalOverlayStyle}>
                    <div className="glass-panel" style={modalContentStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{editingId ? t('fin_edit_title') : t('fin_add_title')}</h2>
                            <button onClick={() => setShowModal(false)} style={closeButtonStyle}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={labelStyle}>{t('fin_type')}</label>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button type="button" onClick={() => setNewItem({ ...newItem, type: 'expense' })}
                                        style={{ ...typeButtonStyle, background: newItem.type === 'expense' ? '#ef4444' : 'rgba(255,255,255,0.05)', border: newItem.type === 'expense' ? 'none' : '1px solid var(--color-border)' }}>
                                        {t('fin_exp')}
                                    </button>
                                    <button type="button" onClick={() => setNewItem({ ...newItem, type: 'revenue' })}
                                        style={{ ...typeButtonStyle, background: newItem.type === 'revenue' ? '#10b981' : 'rgba(255,255,255,0.05)', border: newItem.type === 'revenue' ? 'none' : '1px solid var(--color-border)' }}>
                                        {t('fin_rev')}
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={labelStyle}>{t('fin_date')}</label>
                                    <input
                                        type="date"
                                        required
                                        value={newItem.date}
                                        onChange={e => setNewItem({ ...newItem, date: e.target.value })}
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>{t('fin_amount')} (TTC)</label>
                                    <input
                                        type="number"
                                        required
                                        min="0" step="0.01"
                                        value={newItem.amount}
                                        onChange={e => setNewItem({ ...newItem, amount: e.target.value })}
                                        style={inputStyle}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={labelStyle}>{t('fin_desc')}</label>
                                <input
                                    type="text"
                                    required
                                    value={newItem.description}
                                    onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                                    style={inputStyle}
                                    placeholder="..."
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={labelStyle}>{t('fin_cat')}</label>
                                    <select
                                        value={newItem.category}
                                        onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                                        style={inputStyle}
                                    >
                                        {categories.map(cat => (
                                            <option key={cat.id || cat.name} value={cat.name}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>{t('fin_tax_model')}</label>
                                    <select
                                        value={newItem.taxType}
                                        onChange={e => setNewItem({ ...newItem, taxType: e.target.value })}
                                        style={inputStyle}
                                    >
                                        <option value="tps_tvq">{t('fin_tax_quebec')}</option>
                                        <option value="none">{t('fin_tax_none')}</option>
                                        <option value="tps_only">TPS Only (5%)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Live calculation preview */}
                            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)', fontSize: '0.9rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                    <span style={{ color: 'var(--color-text-muted)' }}>Net (HT):</span>
                                    <span>${newItem.amount ? (parseFloat(newItem.amount) / (1 + getTaxRate(newItem.taxType) / 100)).toFixed(2) : '0.00'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
                                    <span>Tax ({getTaxRate(newItem.taxType)}%):</span>
                                    <span>${newItem.amount ? (parseFloat(newItem.amount) - (parseFloat(newItem.amount) / (1 + getTaxRate(newItem.taxType) / 100))).toFixed(2) : '0.00'}</span>
                                </div>
                            </div>

                            <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center', padding: '0.875rem' }}>
                                {editingId ? t('fin_update') : t('fin_save')}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* CATEGORY MODAL */}
            {showCategoryModal && (
                <div style={modalOverlayStyle}>
                    <div className="glass-panel" style={modalContentStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0 }}>{t('fin_cat_title')}</h2>
                            <button onClick={() => setShowCategoryModal(false)} style={closeButtonStyle}><X size={24} /></button>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <form onSubmit={handleCreateCategory} style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="text"
                                    placeholder={t('fin_cat_new')}
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    style={{ ...inputStyle, flex: 1 }}
                                />
                                <button type="submit" className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
                                    <Plus size={18} /> {t('fin_cat_add')}
                                </button>
                            </form>
                        </div>

                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {categories.length === 0 ? (
                                <p style={{ color: 'var(--color-text-muted)', textAlign: 'center' }}>{t('fin_cat_no')}</p>
                            ) : (
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {categories.map((cat) => (
                                        <li key={cat.id || cat.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <span>{cat.name}</span>
                                            {cat.id && (
                                                <button
                                                    onClick={() => handleDeleteCategory(cat.id)}
                                                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: 0.7 }}
                                                >
                                                    <X size={16} />
                                                </button>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* TAX REPORT MODAL */}
            {showReportModal && (
                <div style={modalOverlayStyle}>
                    <div className="glass-panel" style={{ ...modalContentStyle, width: '600px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{t('fin_report_title')}</h2>
                            <button onClick={() => setShowReportModal(false)} style={closeButtonStyle}><X size={24} /></button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                            <div style={{ padding: '1.5rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid #10b981' }}>
                                <h3 style={{ marginTop: 0, color: '#10b981' }}>Perçues (Revenus)</h3>
                                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0.5rem 0' }}>
                                    <span>{t('fin_tps_coll') || 'TPS'}:</span>
                                    <span style={{ fontWeight: 'bold' }}>${taxReport.tpsCollected.toFixed(2)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0.5rem 0' }}>
                                    <span>{t('fin_tvq_coll') || 'TVQ'}:</span>
                                    <span style={{ fontWeight: 'bold' }}>${taxReport.tvqCollected.toFixed(2)}</span>
                                </div>
                            </div>
                            <div style={{ padding: '1.5rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid #ef4444' }}>
                                <h3 style={{ marginTop: 0, color: '#ef4444' }}>Payées (Dépenses)</h3>
                                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0.5rem 0' }}>
                                    <span>{t('fin_tps_paid') || 'TPS'}:</span>
                                    <span style={{ fontWeight: 'bold' }}>${taxReport.tpsPaid.toFixed(2)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0.5rem 0' }}>
                                    <span>{t('fin_tvq_paid') || 'TVQ'}:</span>
                                    <span style={{ fontWeight: 'bold' }}>${taxReport.tvqPaid.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '1.1rem' }}>
                                <span>{t('fin_net_tps')}:</span>
                                <span style={{ color: netTPS >= 0 ? '#ef4444' : '#10b981' }}>${netTPS.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                                <span>{t('fin_net_tvq')}:</span>
                                <span style={{ color: netTVQ >= 0 ? '#ef4444' : '#10b981' }}>${netTVQ.toFixed(2)}</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem', fontWeight: 'bold', padding: '1rem', background: totalToPay >= 0 ? 'rgba(255,255,255,0.05)' : 'rgba(16, 185, 129, 0.2)', borderRadius: 'var(--radius-md)' }}>
                                <span>{totalToPay >= 0 ? t('fin_to_pay') : t('fin_to_refund')}:</span>
                                <span style={{ color: totalToPay >= 0 ? '#ef4444' : '#10b981' }}>${Math.abs(totalToPay).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const modalOverlayStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
};

const modalContentStyle = {
    width: '500px', padding: '2rem', borderRadius: 'var(--radius-lg)',
    background: '#1a1a1a', border: '1px solid var(--color-border)',
    maxHeight: '90vh', overflowY: 'auto'
};

const closeButtonStyle = {
    background: 'none', border: 'none', color: '#fff', cursor: 'pointer'
};

const labelStyle = {
    display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--color-text-muted)'
};

const typeButtonStyle = {
    flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)', color: '#fff', cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s'
};

const StatsCard = ({ title, value, icon, color }) => (
    <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
            <div style={{ padding: '0.5rem', background: `${color}33`, borderRadius: '50%', color: color }}>
                {icon}
            </div>
            <span style={{ color: 'var(--color-text-muted)' }}>{title}</span>
        </div>
        <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>${value.toFixed(2)}</div>
    </div>
);

const inputStyle = {
    width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)',
    background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)',
    color: '#fff', fontSize: '1rem', outline: 'none'
};

export default FinancePage;
const { t, language } = useLanguage();
const [transactions, setTransactions] = useState([]);
const [categories, setCategories] = useState([]);
const [isLoading, setIsLoading] = useState(true);
const [showModal, setShowModal] = useState(false);
const [showCategoryModal, setShowCategoryModal] = useState(false);

// Form State
const [newItem, setNewItem] = useState({
    description: '',
    amount: '',
    type: 'expense',
    date: new Date().toISOString().split('T')[0],
    category: '',
    taxType: 'tps_tvq' // 'none', 'tps_tvq', 'tps_only', 'custom'
});
const [newCategory, setNewCategory] = useState('');
const [editingId, setEditingId] = useState(null);

useEffect(() => {
    fetchTransactions();
    fetchCategories();
}, []);

const fetchTransactions = async () => {
    setIsLoading(true);
    // Ensure we fetch tax_rate if it exists. If column missing, it returns null implicitly for that field
    const { data, error } = await supabase
        .from('finance_entries')
        .select('*')
        .order('date', { ascending: false });

    if (error) console.error('Error fetching finance:', error);
    else setTransactions(data || []);
    setIsLoading(false);
};

const fetchCategories = async () => {
    const { data, error } = await supabase
        .from('finance_categories')
        .select('*')
        .order('name', { ascending: true });

    if (error || !data || data.length === 0) {
        // Default categories if table empty or missing
        setCategories([
            { id: '1', name: 'General' },
            { id: '2', name: 'Maintenance' },
            { id: '3', name: 'Supplies' },
            { id: '4', name: 'Utilities' },
            { id: '5', name: 'Booking' },
            { id: '6', name: 'Taxes/Licences' }
        ]);
    } else {
        setCategories(data);
        if (data.length > 0) {
            setNewItem(prev => ({ ...prev, category: data[0].name }));
        }
    }
};

// Tax Logic
const getTaxRate = (type) => {
    switch (type) {
        case 'tps_tvq': return 14.975; // 5% GST + 9.975% QST
        case 'tps_only': return 5.0;
        case 'none': return 0;
        default: return 0;
    }
};

const calculateAmounts = (total, rate) => {
    const net = total / (1 + rate / 100);
    const tax = total - net;
    return { net, tax, total };
};

const handleSave = async (e) => {
    e.preventDefault();

    const taxRate = getTaxRate(newItem.taxType);

    const itemData = {
        description: newItem.description,
        amount: parseFloat(newItem.amount), // Storing Total (TTC)
        type: newItem.type,
        date: newItem.date,
        category: newItem.category || (categories.length > 0 ? categories[0].name : 'General'),
        tax_rate: taxRate // Storing rate to recalculate net/tax on display
    };

    let error;

    if (editingId) {
        const { error: updateError } = await supabase
            .from('finance_entries')
            .update(itemData)
            .eq('id', editingId);
        error = updateError;
    } else {
        const { error: insertError } = await supabase
            .from('finance_entries')
            .insert([itemData]);
        error = insertError;
    }

    if (error) {
        console.error(error);
        alert('Error saving entry. Ensure database schema has "tax_rate" column.');
    } else {
        setShowModal(false);
        fetchTransactions();
        resetForm();
    }
};

const resetForm = () => {
    setEditingId(null);
    setNewItem({
        description: '',
        amount: '',
        type: 'expense',
        date: new Date().toISOString().split('T')[0],
        category: categories.length > 0 ? categories[0].name : 'General',
        taxType: 'tps_tvq'
    });
};

const handleEdit = (item) => {
    setEditingId(item.id);

    // Determine tax type from rate
    let tType = 'none';
    const rate = parseFloat(item.tax_rate || 0);
    if (Math.abs(rate - 14.975) < 0.1) tType = 'tps_tvq';
    else if (Math.abs(rate - 5.0) < 0.1) tType = 'tps_only';
    else if (rate > 0) tType = 'custom';

    setNewItem({
        description: item.description,
        amount: item.amount,
        type: item.type,
        date: item.date,
        category: item.category,
        taxType: tType
    });
    setShowModal(true);
};

const handleDelete = async (id) => {
    if (!window.confirm(t('fin_delete_confirm') || 'Are you sure?')) return;

    const { error } = await supabase
        .from('finance_entries')
        .delete()
        .eq('id', id);

    if (error) alert('Error deleting');
    else fetchTransactions();
};

const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    const { data, error } = await supabase
        .from('finance_categories')
        .insert([{ name: newCategory.trim() }])
        .select();

    if (error) {
        alert('Error creating category.');
    } else {
        setNewCategory('');
        fetchCategories();
    }
};

const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    const { error } = await supabase.from('finance_categories').delete().eq('id', id);
    if (!error) fetchCategories();
};

// Derived Totals
const totals = transactions.reduce((acc, curr) => {
    const amt = parseFloat(curr.amount);
    if (curr.type === 'revenue') {
        acc.revenue += amt;
        acc.net += amt;
    } else {
        acc.expenses += amt;
        acc.net -= amt;
    }
    return acc;
}, { revenue: 0, expenses: 0, net: 0 });

return (
    <div style={{ position: 'relative' }}>
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0 }}>{t('fin_title')}</h1>
                <p style={{ color: 'var(--color-text-muted)' }}>{t('fin_subtitle')}</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={() => setShowCategoryModal(true)} className="btn-secondary" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {t('fin_manage_categories')}
                </button>
                <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Plus size={20} /> {t('fin_new_entry')}
                </button>
            </div>
        </div>

        {/* SUMMARY CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
            <StatsCard title={t('fin_total_rev')} value={totals.revenue} icon={<TrendingUp size={20} />} color="#10b981" />
            <StatsCard title={t('fin_total_exp')} value={totals.expenses} icon={<TrendingDown size={20} />} color="#ef4444" />
            <StatsCard title={t('fin_net_profit')} value={totals.net} icon={<DollarSign size={20} />} color="#3b82f6" />
        </div>

        {/* TRANSACTIONS TABLE */}
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>{t('fin_recent_trans')}</h3>
            {isLoading ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>{t('loading')}</div>
            ) : transactions.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>
                    {t('fin_no_trans')}
                </div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                                <th style={{ padding: '1rem' }}>{t('fin_date')}</th>
                                <th style={{ padding: '1rem' }}>{t('fin_desc')}</th>
                                <th style={{ padding: '1rem' }}>{t('fin_cat')}</th>
                                <th style={{ padding: '1rem', textAlign: 'right' }}>{t('fin_net')}</th>
                                <th style={{ padding: '1rem', textAlign: 'right' }}>{t('fin_tax')}</th>
                                <th style={{ padding: '1rem', textAlign: 'right' }}>{t('fin_total')}</th>
                                <th style={{ padding: '1rem', textAlign: 'right', width: '100px' }}>{t('fin_actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((tItem) => {
                                const { net, tax, total } = calculateAmounts(parseFloat(tItem.amount), parseFloat(tItem.tax_rate || 0));
                                const isRev = tItem.type === 'revenue';

                                return (
                                    <tr key={tItem.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.95rem' }}>
                                        <td style={{ padding: '1rem' }}>{format(new Date(tItem.date), 'dd/MM/yyyy')}</td>
                                        <td style={{ padding: '1rem' }}>{tItem.description}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: '12px', background: 'rgba(255,255,255,0.1)' }}>
                                                {tItem.category}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right', color: 'var(--color-text-muted)' }}>
                                            {isRev ? '' : '-'}${net.toFixed(2)}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                                            ${tax.toFixed(2)}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right', color: isRev ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>
                                            {isRev ? '+' : '-'}${total.toFixed(2)}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                <button onClick={() => handleEdit(tItem)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer' }}>
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(tItem.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>

        {/* TRANSACTION MODAL */}
        {showModal && (
            <div style={modalOverlayStyle}>
                <div className="glass-panel" style={modalContentStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{editingId ? t('fin_edit_title') : t('fin_add_title')}</h2>
                        <button onClick={() => setShowModal(false)} style={closeButtonStyle}><X size={24} /></button>
                    </div>
                    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>{t('fin_type')}</label>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button type="button" onClick={() => setNewItem({ ...newItem, type: 'expense' })}
                                    style={{ ...typeButtonStyle, background: newItem.type === 'expense' ? '#ef4444' : 'rgba(255,255,255,0.05)', border: newItem.type === 'expense' ? 'none' : '1px solid var(--color-border)' }}>
                                    {t('fin_exp')}
                                </button>
                                <button type="button" onClick={() => setNewItem({ ...newItem, type: 'revenue' })}
                                    style={{ ...typeButtonStyle, background: newItem.type === 'revenue' ? '#10b981' : 'rgba(255,255,255,0.05)', border: newItem.type === 'revenue' ? 'none' : '1px solid var(--color-border)' }}>
                                    {t('fin_rev')}
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={labelStyle}>{t('fin_date')}</label>
                                <input
                                    type="date"
                                    required
                                    value={newItem.date}
                                    onChange={e => setNewItem({ ...newItem, date: e.target.value })}
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>{t('fin_amount')} (TTC)</label>
                                <input
                                    type="number"
                                    required
                                    min="0" step="0.01"
                                    value={newItem.amount}
                                    onChange={e => setNewItem({ ...newItem, amount: e.target.value })}
                                    style={inputStyle}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div>
                            <label style={labelStyle}>{t('fin_desc')}</label>
                            <input
                                type="text"
                                required
                                value={newItem.description}
                                onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                                style={inputStyle}
                                placeholder="..."
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={labelStyle}>{t('fin_cat')}</label>
                                <select
                                    value={newItem.category}
                                    onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                                    style={inputStyle}
                                >
                                    {categories.map(cat => (
                                        <option key={cat.id || cat.name} value={cat.name}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>{t('fin_tax_model')}</label>
                                <select
                                    value={newItem.taxType}
                                    onChange={e => setNewItem({ ...newItem, taxType: e.target.value })}
                                    style={inputStyle}
                                >
                                    <option value="tps_tvq">{t('fin_tax_quebec')}</option>
                                    <option value="none">{t('fin_tax_none')}</option>
                                    <option value="tps_only">TPS Only (5%)</option>
                                </select>
                            </div>
                        </div>

                        {/* Live calculation preview */}
                        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)', fontSize: '0.9rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                <span style={{ color: 'var(--color-text-muted)' }}>Net (HT):</span>
                                <span>${newItem.amount ? (parseFloat(newItem.amount) / (1 + getTaxRate(newItem.taxType) / 100)).toFixed(2) : '0.00'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
                                <span>Tax ({getTaxRate(newItem.taxType)}%):</span>
                                <span>${newItem.amount ? (parseFloat(newItem.amount) - (parseFloat(newItem.amount) / (1 + getTaxRate(newItem.taxType) / 100))).toFixed(2) : '0.00'}</span>
                            </div>
                        </div>

                        <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center', padding: '0.875rem' }}>
                            {editingId ? t('fin_update') : t('fin_save')}
                        </button>
                    </form>
                </div>
            </div>
        )}

        {/* CATEGORY MODAL */}
        {showCategoryModal && (
            <div style={modalOverlayStyle}>
                <div className="glass-panel" style={modalContentStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <h2 style={{ margin: 0 }}>{t('fin_cat_title')}</h2>
                        <button onClick={() => setShowCategoryModal(false)} style={closeButtonStyle}><X size={24} /></button>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <form onSubmit={handleCreateCategory} style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                placeholder={t('fin_cat_new')}
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                style={{ ...inputStyle, flex: 1 }}
                            />
                            <button type="submit" className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
                                <Plus size={18} /> {t('fin_cat_add')}
                            </button>
                        </form>
                    </div>

                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {categories.length === 0 ? (
                            <p style={{ color: 'var(--color-text-muted)', textAlign: 'center' }}>{t('fin_cat_no')}</p>
                        ) : (
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {categories.map((cat) => (
                                    <li key={cat.id || cat.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <span>{cat.name}</span>
                                        {cat.id && (
                                            <button
                                                onClick={() => handleDeleteCategory(cat.id)}
                                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: 0.7 }}
                                            >
                                                <X size={16} />
                                            </button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        )}
    </div>
);
};

const modalOverlayStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
};

const modalContentStyle = {
    width: '500px', padding: '2rem', borderRadius: 'var(--radius-lg)',
    background: '#1a1a1a', border: '1px solid var(--color-border)',
    maxHeight: '90vh', overflowY: 'auto'
};

const closeButtonStyle = {
    background: 'none', border: 'none', color: '#fff', cursor: 'pointer'
};

const labelStyle = {
    display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--color-text-muted)'
};

const typeButtonStyle = {
    flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)', color: '#fff', cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s'
};

const StatsCard = ({ title, value, icon, color }) => (
    <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
            <div style={{ padding: '0.5rem', background: `${color}33`, borderRadius: '50%', color: color }}>
                {icon}
            </div>
            <span style={{ color: 'var(--color-text-muted)' }}>{title}</span>
        </div>
        <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>${value.toFixed(2)}</div>
    </div>
);

const inputStyle = {
    width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)',
    background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)',
    color: '#fff', fontSize: '1rem', outline: 'none'
};

export default FinancePage;
