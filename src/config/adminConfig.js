// src/config/adminConfig.js
// Lista de emails que tienen permisos de administrador
export const ADMIN_EMAILS = [
    'leonardoposada7777@gmail.com',  // Con 4 sietes
    'leonardoposada777@gmail.com',   // Con 3 sietes
    // Agregar más emails admin aquí según sea necesario
    // 'otro-admin@ejemplo.com',
];

/**
 * Verifica si un usuario tiene permisos de administrador
 * @param {Object} user - Objeto usuario con email
 * @returns {boolean} - true si es admin, false si no
 */
export const isUserAdmin = (user) => {
    // El usuario puede venir envuelto en un objeto {user: {...}}
    const actualUser = user?.user || user;
    
    if (!actualUser || !actualUser.email) {
        return false;
    }
    
    const userEmail = actualUser.email.toLowerCase();
    const isAdmin = ADMIN_EMAILS.includes(userEmail);
    
    return isAdmin;
};

/**
 * Middleware para verificar permisos de admin en componentes
 * @param {Object} user - Usuario actual
 * @param {Function} onUnauthorized - Callback si no es admin
 * @returns {boolean} - true si puede continuar
 */
export const requireAdmin = (user, onUnauthorized = null) => {
    const hasPermission = isUserAdmin(user);
    
    if (!hasPermission && onUnauthorized) {
        onUnauthorized();
    }
    
    return hasPermission;
};