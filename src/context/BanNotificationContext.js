// src/context/BanNotificationContext.js
import React, { createContext, useContext, useState } from 'react';
import BanNotification from '../components/common/BanNotification';

const BanNotificationContext = createContext();

export const useBanNotification = () => {
    const context = useContext(BanNotificationContext);
    if (!context) {
        throw new Error('useBanNotification must be used within a BanNotificationProvider');
    }
    return context;
};

export const BanNotificationProvider = ({ children }) => {
    const [banMessage, setBanMessage] = useState(null);

    const showBanNotification = (message) => {
        setBanMessage(message);
    };

    const hideBanNotification = () => {
        setBanMessage(null);
        // Limpiar sesión y recargar después de cerrar el modal
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        window.location.reload();
    };

    return (
        <BanNotificationContext.Provider value={{ showBanNotification }}>
            {children}
            {banMessage && (
                <BanNotification 
                    message={banMessage}
                    onClose={hideBanNotification}
                />
            )}
        </BanNotificationContext.Provider>
    );
};

export default BanNotificationContext;