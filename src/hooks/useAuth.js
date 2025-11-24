// src/hooks/useAuth.js
import { useState, useCallback, useEffect } from 'react';
import userService from '../services/userService';
import { jwtDecode } from 'jwt-decode';

const useAuth = () => {
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

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

                return storedUser ? JSON.parse(storedUser) : null;
            } catch (e) {
                console.error('Error al decodificar el token:', e);
                localStorage.removeItem('authToken');
                localStorage.removeItem('authUser');
                return null;
            }
        }
        return null;
    }, []);

    const login = async (credentials) => {
        setIsLoading(true);
        try {
            const { token, user } = await userService.loginUser(credentials);

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

    const logout = useCallback(() => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        setUser(null);
        setIsLoggedIn(false);
    }, []);

    useEffect(() => {
        const storedUser = getStoredUser();
        if (storedUser) {
            setUser(storedUser);
            setIsLoggedIn(true);
        }
        setIsLoading(false);
    }, [getStoredUser]);

    return {
        user,
        setUser,
        isLoggedIn,
        isLoading,
        login,
        logout,
    };
};

export default useAuth;
