import React, { useState, useRef, useEffect } from 'react';
import { useCurrency } from '../../context/CurrencyContext';

const CURRENCIES = [
    { code: 'CAD', name: 'Canadian dollar' },
    { code: 'USD', name: 'United States dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British pound' },
    { code: 'CHF', name: 'Swiss franc' }
];

const CurrencySelector = () => {
    const { currency, changeCurrency } = useCurrency();
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    return (
        <div ref={wrapperRef} style={{ position: 'relative', display: 'inline-block' }}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--ayana-text)',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.5rem',
                    fontFamily: 'var(--ayana-font-body)'
                }}
            >
                {currency}
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}>
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: '0',
                    marginBottom: '0.5rem',
                    backgroundColor: '#fff',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    borderRadius: '4px',
                    minWidth: '240px',
                    padding: '0.5rem 0',
                    zIndex: 1000
                }}>
                    {CURRENCIES.map(c => (
                        <button
                            key={c.code}
                            onClick={() => {
                                changeCurrency(c.code);
                                setIsOpen(false);
                            }}
                            style={{
                                width: '100%',
                                textAlign: 'left',
                                padding: '1rem 1.5rem',
                                background: currency === c.code ? 'rgba(0,0,0,0.03)' : 'none',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                color: 'var(--ayana-text)',
                                fontFamily: 'var(--ayana-font-body)',
                                transition: 'background 0.2s',
                                fontSize: '0.95rem'
                            }}
                            onMouseOver={(e) => {
                                if (currency !== c.code) e.currentTarget.style.background = 'rgba(0,0,0,0.02)';
                            }}
                            onMouseOut={(e) => {
                                if (currency !== c.code) e.currentTarget.style.background = 'none';
                            }}
                        >
                            <span style={{ fontWeight: 600, width: '40px' }}>{c.code}</span>
                            <span style={{ color: 'var(--ayana-muted)' }}>{c.name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CurrencySelector;
