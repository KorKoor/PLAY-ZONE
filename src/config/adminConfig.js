/**
 * Configuración de permisos y roles de administrador para el frontend.
 * Contiene funciones para verificar el nivel de acceso de un usuario.
 */

// Roles que tienen acceso al panel de administración o a funciones de moderación.
const ALLOWED_ADMIN_ROLES = ['admin', 'moderator'];

/**
 * Verifica si el objeto de usuario tiene un rol de administrador o moderador.
 * Es la función principal utilizada por useAdmin.
 *
 * @param {object} user - El objeto de usuario obtenido de useAuth().
 * @returns {boolean} True si es admin o moderador.
 */
exports.isUserAdmin = (user) => {
    // 1. Verificar si el objeto user y su propiedad role existen
    if (!user || !user.role) {
        return false;
    }

    // 2. Comparación segura: minúsculas y sin espacios
    const userRole = user.role.toLowerCase().trim();

    return ALLOWED_ADMIN_ROLES.includes(userRole);
};

/**
 * Función que puede ser utilizada por un Route Guard o un componente
 * para ejecutar una acción si el usuario NO es un administrador.
 *
 * @param {object} user - El objeto de usuario.
 * @param {function} onUnauthorized - Función a ejecutar si el usuario no es admin (ej. una redirección).
 * @returns {boolean} El resultado de la verificación isUserAdmin.
 */
exports.requireAdmin = (user, onUnauthorized) => {
    const isAdmin = exports.isUserAdmin(user);

    // Si no es administrador y se proporcionó una función de no autorizado, ejecútala.
    if (!isAdmin && typeof onUnauthorized === 'function') {
        onUnauthorized();
    }

    return isAdmin;
};