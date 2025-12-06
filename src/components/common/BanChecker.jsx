// src/components/common/BanChecker.jsx
import React, { useEffect, useState } from 'react';
import useAuth from '../../hooks/useAuth';

const BanChecker = ({ children }) => {
    const { user, isLoggedIn, checkUserStatus } = useAuth();
    const [isChecking, setIsChecking] = useState(false);

    useEffect(() => {
        // Verificar estado del usuario cuando se detecta un posible ban
        const handleBanCheck = async () => {
            if (isLoggedIn && user) {
                setIsChecking(true);
                try {
                    await checkUserStatus();
                } catch (error) {
                    console.error('Error en BanChecker:', error);
                } finally {
                    setIsChecking(false);
                }
            }
        };

        // Listener para verificaciones manuales de ban
        window.addEventListener('checkUserBan', handleBanCheck);

        return () => {
            window.removeEventListener('checkUserBan', handleBanCheck);
        };
    }, [isLoggedIn, user, checkUserStatus]);

    if (isChecking) {
        return (
            <div className="ban-checking-overlay">
                <div className="ban-checking-message">
                    Verificando estado de la cuenta...
                </div>
            </div>
        );
    }

    return children;
};

export default BanChecker;