// src/components/common/BanNotification.jsx
import React from 'react';
import './BanNotification.css';

const BanNotification = ({ message, onClose }) => {
    return (
        <div className="ban-notification-overlay">
            <div className="ban-notification-modal">
                <div className="ban-notification-header">
                    <h2>🚫 Cuenta Suspendida</h2>
                </div>
                <div className="ban-notification-content">
                    <p>{message}</p>
                </div>
                <div className="ban-notification-footer">
                    <button 
                        className="ban-notification-button" 
                        onClick={onClose}
                    >
                        Entendido
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BanNotification;