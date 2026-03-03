import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';

const WhatsAppButton = () => {
    const [isHovered, setIsHovered] = useState(false);

    // WhatsApp configuration
    const phoneNumber = "15149793103"; // Removed +, (, ), and - for the API
    const defaultMessage = "Bonjour, je souhaite avoir plus d'informations sur AYANA.";
    const encodedMessage = encodeURIComponent(defaultMessage);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    return (
        <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                position: 'fixed',
                bottom: '2rem',
                right: '2rem',
                zIndex: 50,
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                backgroundColor: 'var(--ayana-text)', // Elegant dark color fitting Japandi
                color: 'var(--ayana-bg)',
                padding: '1rem',
                borderRadius: '50px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                textDecoration: 'none',
                transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                overflow: 'hidden'
            }}
            aria-label="Discuter sur WhatsApp"
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
        </a>
    );
};

export default WhatsAppButton;
