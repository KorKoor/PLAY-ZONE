// src/services/httpService.js
import { API_BASE_URL } from '../config/apiConfig';

// Flag para evitar verificaciones múltiples de ban
let isCheckingBan = false;
let banNotificationHandler = null;

// Función para registrar el handler de notificación de ban
export const setBanNotificationHandler = (handler) => {
    banNotificationHandler = handler;
};

// Función para manejar verificación de ban de usuario
const checkUserBanStatus = async () => {
    // Evitar verificaciones múltiples simultáneas
    if (isCheckingBan) return false;
    
    const storedUser = localStorage.getItem('authUser');
    if (!storedUser) return false;

    isCheckingBan = true;

    try {
        const user = JSON.parse(storedUser);
        const userId = user.id || user._id;
        
        if (!userId) return false;

        // Hacer una llamada directa al backend para verificar el estado actual
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const userData = await response.json();
            const actualUser = userData.data || userData;
            
            if (actualUser.isBanned) {
                // Usuario está baneado, mostrar mensaje inmediatamente
                const banMessage = actualUser.banReason 
                    ? `🚫 CUENTA SUSPENDIDA\n\nTu cuenta ha sido suspendida.\n\nMotivo: ${actualUser.banReason}\n\nPor favor contacta al administrador si crees que esto es un error.`
                    : '🚫 CUENTA SUSPENDIDA\n\nTu cuenta ha sido suspendida.\n\nPor favor contacta al administrador si crees que esto es un error.';
                
                // Mostrar alert inmediatamente (siempre visible)
                alert(banMessage);
                
                // Limpiar sesión
                localStorage.removeItem('authToken');
                localStorage.removeItem('authUser');
                
                // Esperar un momento antes de recargar para que el usuario vea el mensaje
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
                
                return true;
            }
        }
        
        return false;
    } catch (error) {
        console.error('Error verificando estado de ban:', error);
        return false;
    } finally {
        isCheckingBan = false;
    }
};

const httpService = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('authToken');

    const isFormData = options.body instanceof FormData;

    let defaultHeaders = {
        ...(!isFormData && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
    };

    const config = {
        ...options,
        body: isFormData ? options.body : options.body ? JSON.stringify(options.body) : undefined,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    if (isFormData && config.headers['Content-Type']) {
        delete config.headers['Content-Type'];
    }

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            // Si es un error 403 y tenemos un token, verificar si el usuario fue baneado
            if (response.status === 403 && token) {
                const wasBanned = await checkUserBanStatus();
                if (wasBanned) {
                    // El usuario fue baneado, no continuar con el error
                    return;
                }
            }

            const error = new Error();
            error.status = response.status;

            let errorData;
            try {
                errorData = await response.json();
                console.error('Error del servidor:', errorData);
                
                // Mostrar errores de validación detallados si existen
                if (errorData.errors && Array.isArray(errorData.errors)) {
                    console.error('🚨 ERRORES DE VALIDACIÓN:', errorData.errors);
                    const errorMessages = errorData.errors.map(err => `• ${err.field || 'Campo'}: ${err.message || err}`).join('\n');
                    error.message = `Error de validación:\n${errorMessages}`;
                } else {
                    error.message = errorData.message || `Error ${response.status}: ${response.statusText}`;
                }
                
                throw error;
            } catch (e) {
                // Si el error ya fue procesado y lanzado (como el 'error' nuestro), volver a lanzarlo.
                // Si es un error de JSON.parse, crear un nuevo mensaje.
                if (e.status) {
                    throw e;
                }
                error.message = `Error ${response.status}: ${response.statusText}`;
                throw error;
            }
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        }
        return null;
    } catch (error) {
        console.error('API Call Error:', error);
        throw error;
    }
};

export const get = (endpoint, options) => httpService(endpoint, { method: 'GET', ...options });
export const post = (endpoint, data, options) => httpService(endpoint, { method: 'POST', body: data, ...options });
export const put = (endpoint, data, options) => httpService(endpoint, { method: 'PUT', body: data, ...options });
export const del = (endpoint, options) => httpService(endpoint, { method: 'DELETE', ...options });

export default httpService;
