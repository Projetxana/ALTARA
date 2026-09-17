import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export const useCurrency = () => useContext(CurrencyContext);

const EXCHANGE_RATES = {
    CAD: 1.0,
    USD: 0.74,
    EUR: 0.68,
    GBP: 0.58,
    CHF: 0.66
};

const detectCurrency = () => {
    try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (tz.includes('Europe/London')) return 'GBP';
        if (tz.includes('Europe/Zurich')) return 'CHF';
        if (tz.includes('Europe')) return 'EUR';
        if (tz.includes('America/New_York') || tz.includes('America/Los_Angeles') || tz.includes('America/Chicago') || tz.includes('America/Denver')) return 'USD';
    } catch (e) {}
    
    // Fallback based on language
    const lang = navigator.language || 'en-CA';
    if (lang.includes('US')) return 'USD';
    if (lang.includes('FR') || lang.includes('DE') || lang.includes('ES') || lang.includes('IT')) return 'EUR';
    if (lang.includes('GB')) return 'GBP';
    if (lang.includes('CH')) return 'CHF';

    return 'CAD';
};

export const CurrencyProvider = ({ children }) => {
    const [currency, setCurrency] = useState('CAD');

    useEffect(() => {
        const saved = localStorage.getItem('ayana_currency');
        if (saved && EXCHANGE_RATES[saved]) {
            setCurrency(saved);
        } else {
            setCurrency(detectCurrency());
        }
    }, []);

    const changeCurrency = (code) => {
        if (EXCHANGE_RATES[code]) {
            setCurrency(code);
            localStorage.setItem('ayana_currency', code);
        }
    };

    const formatPrice = (priceInCAD) => {
        const rate = EXCHANGE_RATES[currency] || 1;
        const converted = priceInCAD * rate;
        
        return new Intl.NumberFormat(navigator.language || 'fr-CA', {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: 0
        }).format(converted);
    };

    return (
        <CurrencyContext.Provider value={{ currency, changeCurrency, formatPrice, EXCHANGE_RATES }}>
            {children}
        </CurrencyContext.Provider>
    );
};
