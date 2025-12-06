// src/hooks/useBanNotificationSetup.js
import { useEffect } from 'react';
import { useBanNotification } from '../context/BanNotificationContext';
import { setBanNotificationHandler } from '../services/httpService';

const useBanNotificationSetup = () => {
    const { showBanNotification } = useBanNotification();

    useEffect(() => {
        // Registrar el handler de notificación en el httpService
        setBanNotificationHandler(showBanNotification);

        // Limpiar al desmontar
        return () => {
            setBanNotificationHandler(null);
        };
    }, [showBanNotification]);
};

export default useBanNotificationSetup;