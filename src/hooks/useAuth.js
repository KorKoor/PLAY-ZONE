// src/hooks/useAuth.js
import { useState, useCallback, useEffect } from 'react';
import userService from '../services/userService';
import { jwtDecode } from 'jwt-decode';

const useAuth = () => {
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const logout = useCallback(() => {
        // Primero limpiar localStorage
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        
        // Luego actualizar estado de forma segura
        setIsLoading(true); // Prevenir renders durante la transición
        
        // Usar un batch update para evitar problemas de concurrencia
        setTimeout(() => {
            setUser(null);
            setIsLoggedIn(false);
            setIsLoading(false);
        }, 0); // Ejecutar en el siguiente tick
    }, []);

    const getStoredUser = useCallback(() => {
        const token = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('authUser');

        if (token) {
            try {
                const decoded = jwtDecode(token);

                if (decoded.exp * 1000 < Date.now()) {
                    console.warn('Token expirado. Sesión cerrada automáticamente.');
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('authUser');
                    return null;
                }

                const userData = storedUser ? JSON.parse(storedUser) : null;
                
                // Verificar si el usuario está baneado
                if (userData && userData.isBanned) {
                    console.warn('Usuario baneado. Cerrando sesión.');
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('authUser');
                    return null;
                }

                return userData;
            } catch (e) {
                console.error('Error al decodificar el token:', e);
                localStorage.removeItem('authToken');
                localStorage.removeItem('authUser');
                return null;
            }
        }
        return null;
    }, []);

    // Función para verificar estado actualizado del usuario
    const checkUserStatus = useCallback(async () => {
        if (!user?.id && !user?._id) return;

        try {
            const userId = user.id || user._id;
            const response = await userService.getUserProfile(userId);
            const updatedUser = response.data || response;

            if (updatedUser.isBanned) {
                const banMessage = updatedUser.banReason 
                    ? `Tu cuenta ha sido suspendida. Motivo: ${updatedUser.banReason}`
                    : 'Tu cuenta ha sido suspendida.';
                alert(banMessage);
                logout();
                return;
            }

            // Actualizar usuario si hay cambios
            if (JSON.stringify(updatedUser) !== JSON.stringify(user)) {
                setUser(updatedUser);
                localStorage.setItem('authUser', JSON.stringify(updatedUser));
            }
        } catch (error) {
            console.error('Error verificando estado del usuario:', error);
        }
    }, [user, logout]);

    const login = async (credentials) => {
        setIsLoading(true);
        try {
            const { token, user } = await userService.loginUser(credentials);

            // Verificar si el usuario está baneado
            if (user.isBanned) {
                const banMessage = user.banReason 
                    ? `Tu cuenta ha sido suspendida. Motivo: ${user.banReason}`
                    : 'Tu cuenta ha sido suspendida.';
                throw new Error(banMessage);
            }

            localStorage.setItem('authToken', token);
            localStorage.setItem('authUser', JSON.stringify(user));

            setUser(user);
            setIsLoggedIn(true);
            
            return { success: true };
        } catch (error) {
            console.error('Login failed:', error.message);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const storedUser = getStoredUser();
        if (storedUser) {
            setUser(storedUser);
            setIsLoggedIn(true);
        }
        setIsLoading(false);
    }, [getStoredUser]);

    // Verificar estado del usuario cada 5 minutos cuando esté logueado
    useEffect(() => {
        if (!isLoggedIn || !user || isLoading) return;
        
        // Verificar inmediatamente con un pequeño delay
        const timeoutId = setTimeout(() => {
            checkUserStatus();
        }, 1000);

        // Configurar verificación periódica
        const interval = setInterval(checkUserStatus, 5 * 60 * 1000); // 5 minutos

        return () => {
            clearTimeout(timeoutId);
            clearInterval(interval);
        };
    }, [isLoggedIn, user?.id, isLoading]); // Solo depender del ID del usuario, no del objeto completo

    return {
        user,
        setUser,
        isLoggedIn,
        isLoading,
        login,
        logout,
        checkUserStatus, // Exponemos la función para uso manual
    };
};

export default useAuth;
