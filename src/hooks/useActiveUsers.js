// src/hooks/useActiveUsers.js
import { useState, useEffect, useCallback } from 'react';
import userService from '../services/userService';
import useAuth from './useAuth';

const useActiveUsers = () => {
    const [activeUsers, setActiveUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { isLoggedIn, checkUserStatus } = useAuth();

    const fetchActiveUsers = useCallback(async () => {
        // Si no hay usuario logueado, no intentar cargar usuarios activos
        if (!isLoggedIn) {
            setActiveUsers([]);
            setIsLoading(false);
            setError("Necesitas estar logueado para ver usuarios activos.");
            return;
        }

        setIsLoading(true);
        setError(null);
        
        try {
            // Llama al servicio real de la API (Requisito 4.4)
            const data = await userService.getActiveUsers(); 
            
            if (data.users && data.users.length > 0) {
                setActiveUsers(data.users);
            } else {
                // Si no hay usuarios activos, la lista queda vacía
                setActiveUsers([]);
            }
        } catch (err) {
            console.error('Error cargando usuarios activos:', err);
            
            // Si es un error 403, verificar si el usuario fue baneado
            if (err.message && err.message.includes('403')) {
                console.warn('Error 403 en useActiveUsers, verificando estado del usuario...');
                
                // Mostrar mensaje inmediatamente
                alert('🚫 ACCESO RESTRINGIDO\n\nNo puedes acceder a esta función.\n\nTu cuenta puede estar suspendida.');
                
                const wasBanned = await checkUserStatus();
                if (!wasBanned) {
                    // Si no fue baneado, mostrar error estándar
                    setError("Error cargando el feed: Error 403: Forbidden");
                }
                // Si fue baneado, checkUserStatus ya manejó el logout
            } else {
                setError("No se pudo cargar la lista de jugadores activos.");
            }
        } finally {
            setIsLoading(false);
        }
    }, [isLoggedIn, checkUserStatus]);

    useEffect(() => {
        fetchActiveUsers();
    }, [fetchActiveUsers]); // Usar fetchActiveUsers como dependencia

    return { 
        activeUsers, 
        isLoading, 
        error, 
        fetchActiveUsers // Exponemos la función para refresh manual
    };
};

export default useActiveUsers;