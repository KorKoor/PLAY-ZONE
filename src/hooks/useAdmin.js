// src/hooks/useAdmin.js
import { useAuthContext } from '../context/AuthContext';
import { isUserAdmin, requireAdmin } from '../config/adminConfig';

/**
 * Hook personalizado para verificar permisos de administrador
 * @returns {Object} - Funciones y estado relacionado con admin
 */
const useAdmin = () => {
    const { user } = useAuthContext();

    return {
        // Estado
        isAdmin: isUserAdmin(user),
        user,
        
        // Funciones
        checkAdminAccess: () => isUserAdmin(user),
        requireAdminAccess: (onUnauthorized) => requireAdmin(user, onUnauthorized),
        
        // Helper para mostrar/ocultar elementos admin
        AdminOnly: ({ children, fallback = null }) => {
            return isUserAdmin(user) ? children : fallback;
        }
    };
};

export default useAdmin;