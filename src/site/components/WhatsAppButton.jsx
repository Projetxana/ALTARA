import React, { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

const WhatsAppButton = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [message, setMessage] = useState('');

    // WhatsApp configuration
    const phoneNumber = "15149793103";

    const handleSend = (e) => {
        e.preventDefault();
        // If empty, use a default message
        const textToSend = message.trim() ? message : "Bonjour, je souhaite avoir plus d'informations sur AYANA.";
        const encodedMessage = encodeURIComponent(textToSend);
        // It always eventually redirects to WhatsApp to actually send the message
        window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
        setIsOpen(false);
        setMessage('');
    };

    return (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 50, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem' }}>
            {/* Chat Window Popup */}
            {isOpen && (
                <div style={{
                    width: '320px',
                    backgroundColor: 'var(--ayana-bg)',
                    borderRadius: '16px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid var(--ayana-border)',
                }}>
                    {/* Header */}
                    <div style={{
                        backgroundColor: 'var(--ayana-text)',
                        color: 'var(--ayana-bg)',
                        padding: '1rem 1.25rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <MessageCircle size={20} />
                            <span style={{ fontWeight: 600, fontSize: '1rem', letterSpacing: '0.5px' }}>AYANA Chat</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--ayana-bg)', cursor: 'pointer', padding: '0.25rem', display: 'flex', alignItems: 'center' }}>
                            <X size={20} />
                        </button>
                    </div>

                    {/* Chat Area */}
                    <div style={{ padding: '1.25rem', backgroundColor: '#f9f9f9', flex: 1, minHeight: '150px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{
                            backgroundColor: 'white',
                            padding: '1rem',
                            borderRadius: '12px',
                            borderTopLeftRadius: '2px',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                            fontSize: '0.9rem',
                            color: 'var(--ayana-text)',
                            alignSelf: 'flex-start',
                            maxWidth: '90%',
                            lineHeight: 1.5
                        }}>
                            Bonjour ! Comment pouvons-nous vous aider à préparer votre séjour au sanctuaire AYANA ?
                        </div>
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} style={{ padding: '1rem', backgroundColor: 'white', borderTop: '1px solid var(--ayana-border)', display: 'flex', gap: '0.5rem' }}>
                        <input
                            type="text"
                            placeholder="Écrivez votre message..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            style={{
                                flex: 1,
                                padding: '0.75rem 1rem',
                                borderRadius: '20px',
                                border: '1px solid #e0e0e0',
                                outline: 'none',
                                fontSize: '0.9rem',
                                fontFamily: 'inherit'
                            }}
                        />
                        <button
                            type="submit"
                            style={{
                                backgroundColor: 'var(--ayana-text)',
                                color: 'var(--ayana-bg)',
                                border: 'none',
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                padding: '0',
                                transition: 'opacity 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = 0.8}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = 1}
                        >
                            <Send size={16} style={{ marginLeft: '2px' }} />
                        </button>
                    </form>
                </div>
            )}

            {/* Floating Bubble */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        backgroundColor: 'var(--ayana-text)',
                        color: 'var(--ayana-bg)',
                        padding: '1rem',
                        borderRadius: '50px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                        outline: 'none'
                    }}
                    aria-label="Discuter avec nous"
                >
                    <MessageCircle size={24} color="var(--ayana-bg)" />
                    <span style={{
                        maxWidth: isHovered ? '200px' : '0',
                        opacity: isHovered ? 1 : 0,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        display: 'inline-block'
                    }}>
                        Discuter avec nous
                    </span>
                </button>
            )}
        </div>
    );
};

export default WhatsAppButton;
