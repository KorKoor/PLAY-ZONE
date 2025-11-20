// src/hooks/useUpdateProfile.js
import { put } from '../services/httpService';
import { useAuthContext } from '../context/AuthContext';

export const useUpdateProfile = () => {
    const { user, setUser } = useAuthContext();

    const updateProfile = async (updates) => {
        try {
            const response = await put(`/users/${user.id}`, updates);
            // Actualizar el contexto con los nuevos datos
            setUser({ ...user, ...response });
            return { success: true, data: response };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    return { updateProfile };
};
