import React, { useState, useEffect } from 'react';
import { Settings, Calendar, Percent, Plus, Trash2, Save, Info } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useSanctuum } from '../../context/SanctuumContext';

const PricingModule = ({ chalet }) => {
    const { t } = useLanguage();
    const { updateChalet, formatPrice } = useSanctuum();

    const defaultPricing = {
        basePrice: chalet.baseNightPrice || 150,
        weekendPrice: chalet.baseNightPrice ? chalet.baseNightPrice + 30 : 180,
        defaultMinStay: chalet.minStay || 2,
        fees: {
            cleaning: 80,
            pet: 30,
            extraGuest: 20,
            includedGuests: 4,
            securityDeposit: 500
        },
        discounts: {
            weekly: 10,
            monthly: 20,
            lastMinute: { active: false, percentage: 15, daysBefore: 3 },
            earlyBird: { active: false, percentage: 10, monthsBefore: 3 }
        },
        customRules: [],
        monthlyRates: Array(12).fill(null).map(() => ({
            basePrice: chalet.baseNightPrice || 150,
            weekendPrice: chalet.baseNightPrice ? chalet.baseNightPrice + 30 : 180,
            minStay: chalet.minStay || 2
        }))
    };

    // Migration: If the chalet has existing pricingInfo without monthlyRates, build it from legacy fields
    const buildInitialPricing = () => {
        if (!chalet.pricingInfo) return defaultPricing;
        const info = { ...chalet.pricingInfo };
        if (!info.monthlyRates) {
            info.monthlyRates = Array(12).fill(null).map(() => ({
                basePrice: info.basePrice || chalet.baseNightPrice || 150,
                weekendPrice: info.weekendPrice || chalet.baseNightPrice + 30 || 180,
                minStay: info.defaultMinStay || chalet.minStay || 2
            }));
        }
        return info;
    };

    const [pricing, setPricing] = useState(() => buildInitialPricing());
    const [activeTab, setActiveTab] = useState('base');
    const [selectedMonthIndex, setSelectedMonthIndex] = useState(new Date().getMonth());
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const monthsNames = [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];

    // Track changes
    useEffect(() => {
        if (JSON.stringify(pricing) !== JSON.stringify(buildInitialPricing())) {
            setHasUnsavedChanges(true);
        } else {
            setHasUnsavedChanges(false);
        }
    }, [pricing, chalet.pricingInfo]);

    const handleSave = () => {
        // Find standard baseNightPrice to save on the root chalet object for backward compatibility
        // We can just use the current month's price as the baseline
        const currentMonthPrice = pricing.monthlyRates[new Date().getMonth()].basePrice;
        const currentMinStay = pricing.monthlyRates[new Date().getMonth()].minStay;

        updateChalet(chalet.id, {
            pricingInfo: pricing,
            baseNightPrice: currentMonthPrice,
            minStay: currentMinStay
        });
        setHasUnsavedChanges(false);
    };

    const handleChange = (section, field, value) => {
        setPricing(prev => {
            if (section) {
                return { ...prev, [section]: { ...prev[section], [field]: value } };
            }
            return { ...prev, [field]: value };
        });
    };

    const handleMonthlyChange = (monthIndex, field, value) => {
        setPricing(prev => {
            const newRates = [...prev.monthlyRates];
            newRates[monthIndex] = { ...newRates[monthIndex], [field]: value };
            return { ...prev, monthlyRates: newRates };
        });
    };

    const handleDiscountObjectChange = (type, field, value) => {
        setPricing(prev => ({
            ...prev,
            discounts: {
                ...prev.discounts,
                [type]: { ...prev.discounts[type], [field]: value }
            }
        }));
    };

    const addCustomRule = () => {
        const newRule = {
            id: 'rule_' + Date.now(),
            name: 'New Season',
            startDate: '',
            endDate: '',
            price: pricing.basePrice,
            minStay: pricing.defaultMinStay
        };
        setPricing(prev => ({ ...prev, customRules: [...prev.customRules, newRule] }));
    };

    const updateCustomRule = (id, field, value) => {
        setPricing(prev => ({
            ...prev,
            customRules: prev.customRules.map(r => r.id === id ? { ...r, [field]: value } : r)
        }));
    };

    const removeCustomRule = (id) => {
        setPricing(prev => ({
            ...prev,
            customRules: prev.customRules.filter(r => r.id !== id)
        }));
    };

    const tabs = [
        { id: 'base', icon: <Settings size={18} />, label: 'Base Price' },
        { id: 'custom', icon: <Calendar size={18} />, label: 'Custom Rules' },
        { id: 'fees', icon: <Plus size={18} />, label: 'Fees & Extras' },
        { id: 'discounts', icon: <Percent size={18} />, label: 'Discounts' }
    ];

    return (
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', position: 'relative' }}>
            {hasUnsavedChanges && (
                <button
                    onClick={handleSave}
                    className="btn-primary"
                    style={{ position: 'absolute', top: '1.5rem', right: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <Save size={16} /> Save Pricing
                </button>
            )}

            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-primary)' }}></span>
                Smart Pricing Module
            </h3>

            {/* TAB NAVIGATION */}
            <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--color-border)', marginBottom: '2rem', paddingBottom: '0.5rem' }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.75rem 1.25rem',
                            background: activeTab === tab.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                            color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-text-muted)',
                            border: 'none',
                            borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                            cursor: 'pointer',
                            fontWeight: activeTab === tab.id ? 600 : 500,
                            borderBottom: activeTab === tab.id ? '2px solid var(--color-primary)' : '2px solid transparent'
                        }}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* TAB CONTENT */}
            <div style={{ minHeight: '300px' }}>

                {/* 1. BASE PRICE (MONTHLY) */}
                {activeTab === 'base' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '3rem', animation: 'fadeIn 0.3s' }}>

                        {/* Month Selector Column */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', borderRight: '1px solid var(--color-border)', paddingRight: '1rem' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem', paddingLeft: '0.75rem' }}>Mois</div>
                            {monthsNames.map((monthName, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedMonthIndex(idx)}
                                    style={{
                                        textAlign: 'left',
                                        padding: '0.75rem 1rem',
                                        background: selectedMonthIndex === idx ? 'var(--color-primary)' : 'transparent',
                                        color: selectedMonthIndex === idx ? 'white' : 'var(--color-text-muted)',
                                        border: 'none',
                                        borderRadius: 'var(--radius-md)',
                                        cursor: 'pointer',
                                        fontWeight: selectedMonthIndex === idx ? 600 : 400,
                                        transition: 'all 0.2s ease',
                                        opacity: selectedMonthIndex === idx ? 1 : 0.8
                                    }}
                                >
                                    {monthName}
                                </button>
                            ))}
                        </div>

                        {/* Month Editing Column */}
                        <div>
                            <div style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px dashed var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <h4 style={{ fontSize: '1.25rem', margin: '0 0 0.25rem 0', color: 'white' }}>Tarifs de {monthsNames[selectedMonthIndex]}</h4>
                                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: 0 }}>Configurez les tarifs standards et week-ends spécifiques à ce mois.</p>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', color: 'var(--color-primary)', fontWeight: 500 }}>
                                    {monthsNames[selectedMonthIndex]}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Standard Night Price</label>
                                    <div style={{ position: 'relative' }}>
                                        <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>$</span>
                                        <input
                                            type="number"
                                            value={pricing.monthlyRates[selectedMonthIndex].basePrice || 0}
                                            onChange={(e) => handleMonthlyChange(selectedMonthIndex, 'basePrice', parseFloat(e.target.value) || 0)}
                                            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', color: 'white', fontSize: '1.25rem' }}
                                        />
                                    </div>
                                    <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.5rem' }}>Tarif par défaut pour les nuits du lundi au jeudi.</p>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Weekend Night Price</label>
                                    <div style={{ position: 'relative' }}>
                                        <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>$</span>
                                        <input
                                            type="number"
                                            value={pricing.monthlyRates[selectedMonthIndex].weekendPrice || 0}
                                            onChange={(e) => handleMonthlyChange(selectedMonthIndex, 'weekendPrice', parseFloat(e.target.value) || 0)}
                                            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', color: 'white', fontSize: '1.25rem' }}
                                        />
                                    </div>
                                    <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.5rem' }}>Appliqué automatiquement du vendredi au dimanche inclus.</p>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Default Minimum Stay (Nights)</label>
                                    <input
                                        type="number"
                                        value={pricing.monthlyRates[selectedMonthIndex].minStay || 0}
                                        onChange={(e) => handleMonthlyChange(selectedMonthIndex, 'minStay', parseInt(e.target.value) || 0)}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', color: 'white', fontSize: '1.25rem' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. CUSTOM RULES */}
                {activeTab === 'custom' && (
                    <div style={{ animation: 'fadeIn 0.3s' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', maxWidth: '600px' }}>Set specific prices and rules for holidays, high seasons, or special events. These will override your base pricing.</p>
                            <button onClick={addCustomRule} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid var(--color-border)', cursor: 'pointer' }}>
                                <Plus size={16} /> Add Rule
                            </button>
                        </div>

                        {pricing.customRules.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--color-border)' }}>
                                <Calendar size={32} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
                                <div style={{ color: 'var(--color-text-muted)' }}>No custom rules set. Add one for holidays!</div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {pricing.customRules.map((rule, idx) => (
                                    <div key={rule.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.5fr 1fr 1fr auto', gap: '1rem', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                                        <div>
                                            <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem', display: 'block' }}>Season Name</label>
                                            <input type="text" value={rule.name} onChange={(e) => updateCustomRule(rule.id, 'name', e.target.value)} style={{ width: '100%', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-border)', color: 'white', borderRadius: '4px' }} placeholder="e.g. Christmas" />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem', display: 'block' }}>Start Date</label>
                                            <input type="date" value={rule.startDate} onChange={(e) => updateCustomRule(rule.id, 'startDate', e.target.value)} style={{ width: '100%', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-border)', color: 'white', borderRadius: '4px', colorScheme: 'dark' }} />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem', display: 'block' }}>End Date</label>
                                            <input type="date" value={rule.endDate} onChange={(e) => updateCustomRule(rule.id, 'endDate', e.target.value)} style={{ width: '100%', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-border)', color: 'white', borderRadius: '4px', colorScheme: 'dark' }} />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem', display: 'block' }}>Nightly Price</label>
                                            <input type="number" value={rule.price} onChange={(e) => updateCustomRule(rule.id, 'price', parseFloat(e.target.value))} style={{ width: '100%', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-border)', color: 'white', borderRadius: '4px' }} />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem', display: 'block' }}>Min Stay</label>
                                            <input type="number" value={rule.minStay} onChange={(e) => updateCustomRule(rule.id, 'minStay', parseInt(e.target.value))} style={{ width: '100%', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-border)', color: 'white', borderRadius: '4px' }} />
                                        </div>
                                        <div style={{ paddingTop: '1.25rem' }}>
                                            <button onClick={() => removeCustomRule(rule.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem' }}>
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* 3. FEES & EXTRAS */}
                {activeTab === 'fees' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', animation: 'fadeIn 0.3s' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Cleaning Fee (Per Stay)</label>
                            <input type="number" value={pricing.fees.cleaning} onChange={(e) => handleChange('fees', 'cleaning', parseFloat(e.target.value))} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', color: 'white' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Security Deposit</label>
                            <input type="number" value={pricing.fees.securityDeposit} onChange={(e) => handleChange('fees', 'securityDeposit', parseFloat(e.target.value))} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', color: 'white' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Pet Fee (Per Stay)</label>
                            <input type="number" value={pricing.fees.pet} onChange={(e) => handleChange('fees', 'pet', parseFloat(e.target.value))} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', color: 'white' }} />
                        </div>
                        <div style={{ gridColumn: '1 / -1', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                            <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>Extra Guests</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Included Guests (Free)</label>
                                    <input type="number" value={pricing.fees.includedGuests} onChange={(e) => handleChange('fees', 'includedGuests', parseInt(e.target.value))} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', color: 'white' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Fee per Extra Guest (Per Night)</label>
                                    <input type="number" value={pricing.fees.extraGuest} onChange={(e) => handleChange('fees', 'extraGuest', parseFloat(e.target.value))} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', color: 'white' }} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 4. DISCOUNTS */}
                {activeTab === 'discounts' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', animation: 'fadeIn 0.3s' }}>

                        <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                            <h4 style={{ margin: '0 0 1rem 0', display: 'flex', justifyContent: 'space-between' }}>
                                Length of Stay
                                <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 6px', borderRadius: '10px' }}>High Impact</span>
                            </h4>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Weekly Discount (7+ nights)</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <input type="number" value={pricing.discounts.weekly} onChange={(e) => handleChange('discounts', 'weekly', parseFloat(e.target.value))} style={{ width: '80px', padding: '0.5rem', borderRadius: '4px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-border)', color: 'white' }} />
                                    <span style={{ fontSize: '1.2rem' }}>% off</span>
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Monthly Discount (28+ nights)</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <input type="number" value={pricing.discounts.monthly} onChange={(e) => handleChange('discounts', 'monthly', parseFloat(e.target.value))} style={{ width: '80px', padding: '0.5rem', borderRadius: '4px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-border)', color: 'white' }} />
                                    <span style={{ fontSize: '1.2rem' }}>% off</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <h4 style={{ margin: 0 }}>Last Minute</h4>
                                <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '40px', height: '20px' }}>
                                    <input type="checkbox" checked={pricing.discounts.lastMinute.active} onChange={(e) => handleDiscountObjectChange('lastMinute', 'active', e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
                                    <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: pricing.discounts.lastMinute.active ? 'var(--color-primary)' : 'rgba(255,255,255,0.2)', transition: '.4s', borderRadius: '20px' }}>
                                        <span style={{ position: 'absolute', content: '""', height: '16px', width: '16px', left: pricing.discounts.lastMinute.active ? '22px' : '2px', bottom: '2px', backgroundColor: 'white', transition: '.4s', borderRadius: '50%' }}></span>
                                    </span>
                                </label>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>Encourage bookings for unbooked nights approaching soon.</p>

                            <div style={{ opacity: pricing.discounts.lastMinute.active ? 1 : 0.4, pointerEvents: pricing.discounts.lastMinute.active ? 'auto' : 'none' }}>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <input type="number" value={pricing.discounts.lastMinute.percentage} onChange={(e) => handleDiscountObjectChange('lastMinute', 'percentage', parseFloat(e.target.value))} style={{ width: '80px', padding: '0.5rem', borderRadius: '4px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-border)', color: 'white' }} />
                                    <span>% off if booked within</span>
                                    <input type="number" value={pricing.discounts.lastMinute.daysBefore} onChange={(e) => handleDiscountObjectChange('lastMinute', 'daysBefore', parseInt(e.target.value))} style={{ width: '70px', padding: '0.5rem', borderRadius: '4px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-border)', color: 'white' }} />
                                    <span>days</span>
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </div>

        </div>
    );
};

export default PricingModule;
