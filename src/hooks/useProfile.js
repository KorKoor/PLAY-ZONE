// src/hooks/useProfile.js
import { useState, useEffect, useCallback } from 'react';
import userService from '../services/userService';
import { useAuthContext } from '../context/AuthContext';

const useProfile = (userId) => {
    const { logout } = useAuthContext();
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProfile = useCallback(async () => {
        if (!userId) {
            setError("ID de usuario no proporcionado.");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            // Llama al endpoint GET /api/v1/users/:userId (Req. 1.8)
            const data = await userService.getUserProfile(userId);
            setProfile(data.user); // Asumimos que la API devuelve { user: {...}, recentPosts: [...] }
        } catch (err) {
            if (err.message.includes('401')) {
                // Si el token es inválido o expiró, forzar el cierre de sesión
                logout();
                setError("Tu sesión ha expirado.");
            } else {
                setError(err.message || "No se pudo cargar el perfil del usuario.");
            }
        } finally {
            setIsLoading(false);
        }
    }, [userId, logout]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    // Función para actualizar datos del perfil (Req. 1.3)
    const updateProfile = async (updates) => {
        try {
            // Llama al endpoint PUT /api/v1/users/:userId
            const updatedData = await userService.updateProfile(userId, updates);

            // Actualizar el estado local con los nuevos datos
            setProfile(prev => ({
                ...prev,
                ...updatedData.user
            }));
            return { success: true, user: updatedData.user };

        } catch (err) {
            setError(err.message || "Error al actualizar el perfil.");
            return { success: false, error: err.message };
        }
    };

    return { profile, isLoading, error, updateProfile, fetchProfile };
};

export default useProfile;