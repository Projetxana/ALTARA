import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, TrendingUp, TrendingDown, DollarSign, X, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

const FinancePage = () => {
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newItem, setNewItem] = useState({
        description: '',
        amount: '',
        type: 'expense',
        date: new Date().toISOString().split('T')[0],
        category: 'General'
    });

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('finance_entries')
            .select('*')
            .order('date', { ascending: false });

        if (error) console.error('Error fetching finance:', error);
        else setTransactions(data || []);
        setIsLoading(false);
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        const { error } = await supabase
            .from('finance_entries')
            .insert([{
                description: newItem.description,
                amount: parseFloat(newItem.amount),
                type: newItem.type,
                date: newItem.date,
                category: newItem.category
            }]);

        if (error) {
            alert('Error adding entry');
            console.error(error);
        } else {
            setShowModal(false);
            setNewItem({ description: '', amount: '', type: 'expense', date: new Date().toISOString().split('T')[0], category: 'General' });
            fetchTransactions();
        }
    };

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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0 }}>Finance</h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>Track Revenue & Expenses</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn-primary" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Plus size={20} /> New Entry
                </button>
            </div>

            {/* SUMMARY CARDS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                <StatsCard title="Total Revenue" value={totals.revenue} icon={<TrendingUp size={20} />} color="#10b981" />
                <StatsCard title="Total Expenses" value={totals.expenses} icon={<TrendingDown size={20} />} color="#ef4444" />
                <StatsCard title="Net Profit" value={totals.net} icon={<DollarSign size={20} />} color="#3b82f6" />
            </div>

            {/* TRANSACTIONS TABLE */}
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Recent Transactions</h3>
                {isLoading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading...</div>
                ) : transactions.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>
                        No transactions found. Start by adding one!
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left', color: 'var(--color-text-muted)' }}>
                                <th style={{ padding: '1rem' }}>Date</th>
                                <th style={{ padding: '1rem' }}>Description</th>
                                <th style={{ padding: '1rem' }}>Category</th>
                                <th style={{ padding: '1rem', textAlign: 'right' }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((t) => (
                                <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '1rem' }}>{format(new Date(t.date), 'MMM dd, yyyy')}</td>
                                    <td style={{ padding: '1rem' }}>{t.description}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: '12px', background: 'rgba(255,255,255,0.1)' }}>
                                            {t.category}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right', color: t.type === 'revenue' ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>
                                        {t.type === 'revenue' ? '+' : '-'}${Math.abs(t.amount).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* MODAL */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="glass-panel" style={{ width: '400px', padding: '2rem', borderRadius: 'var(--radius-lg)', background: '#1a1a1a', border: '1px solid var(--color-border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0 }}>Add Transaction</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Type</label>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button type="button" onClick={() => setNewItem({ ...newItem, type: 'expense' })}
                                        style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)', border: 'none', background: newItem.type === 'expense' ? '#ef4444' : 'rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer' }}>
                                        Expense
                                    </button>
                                    <button type="button" onClick={() => setNewItem({ ...newItem, type: 'revenue' })}
                                        style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-md)', border: 'none', background: newItem.type === 'revenue' ? '#10b981' : 'rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer' }}>
                                        Revenue
                                    </button>
                                </div>
                            </div>
                            <input
                                type="date"
                                required
                                value={newItem.date}
                                onChange={e => setNewItem({ ...newItem, date: e.target.value })}
                                style={inputStyle}
                            />
                            <input
                                type="text"
                                placeholder="Description"
                                required
                                value={newItem.description}
                                onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                                style={inputStyle}
                            />
                            <input
                                type="number"
                                placeholder="Amount"
                                required
                                min="0" step="0.01"
                                value={newItem.amount}
                                onChange={e => setNewItem({ ...newItem, amount: e.target.value })}
                                style={inputStyle}
                            />
                            <select
                                value={newItem.category}
                                onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                                style={inputStyle}
                            >
                                <option>General</option>
                                <option>Maintenance</option>
                                <option>Supplies</option>
                                <option>Utilities</option>
                                <option>Booking</option>
                            </select>
                            <button type="submit" className="btn-primary" style={{ marginTop: '1rem', width: '100%' }}>Save Entry</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
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
    color: '#fff', fontSize: '1rem'
};

export default FinancePage;
