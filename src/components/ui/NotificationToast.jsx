import React from 'react';
import { useNotification } from '../../context/NotificationContext';
import { X, CheckCircle, AlertTriangle, Info, Bell } from 'lucide-react';

const NotificationToast = () => {
    const { notifications, removeNotification } = useNotification();

    if (notifications.length === 0) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            zIndex: 9999
        }}>
            {notifications.map(notification => {
                let bg, icon, border;

                switch (notification.type) {
                    case 'success':
                        bg = 'rgba(16, 185, 129, 0.9)';
                        icon = <CheckCircle size={20} color="#fff" />;
                        break;
                    case 'warning':
                        bg = 'rgba(245, 158, 11, 0.9)';
                        icon = <AlertTriangle size={20} color="#fff" />;
                        break;
                    case 'error':
                        bg = 'rgba(239, 68, 68, 0.9)';
                        icon = <X size={20} color="#fff" />;
                        break;
                    default:
                        bg = 'rgba(30, 41, 59, 0.9)';
                        icon = <Info size={20} color="#fff" />;
                }

                return (
                    <div
                        key={notification.id}
                        className="glass-panel"
                        style={{
                            background: bg,
                            backdropFilter: 'blur(10px)',
                            padding: '1rem',
                            borderRadius: 'var(--radius-md)',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                            minWidth: '300px',
                            display: 'flex',
                            alignItems: 'start',
                            gap: '0.75rem',
                            color: '#fff',
                            border: '1px solid rgba(255,255,255,0.1)',
                            animation: 'slideIn 0.3s ease-out'
                        }}
                    >
                        {icon}
                        <div style={{ flex: 1 }}>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.25rem' }}>{notification.title}</h4>
                            <p style={{ fontSize: '0.8rem', opacity: 0.9 }}>{notification.message}</p>
                        </div>
                        <button
                            onClick={() => removeNotification(notification.id)}
                            style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}
                        >
                            <X size={14} />
                        </button>
                    </div>
                );
            })}
        </div>
    );
};

export default NotificationToast;
