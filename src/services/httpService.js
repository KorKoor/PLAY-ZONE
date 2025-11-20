// src/services/httpService.js

import { API_BASE_URL } from '../config/apiConfig';

/**
 * Funcion generica para realizar peticiones fetch a la API.
 * @param {string} endpoint - La ruta especifica de la API.
 * @param {Object} options - Opciones de la peticion fetch.
 */
const httpService = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('authToken');

    // 🚀 LÓGICA CLAVE: Detectar si el cuerpo es un archivo (FormData) 🚀
    const isFormData = options.body instanceof FormData;

    // Inicializar headers. Solo aplicamos 'application/json' si NO es FormData.
    let defaultHeaders = {
        ...(!isFormData && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
    };

    const config = {
        ...options,

        // 🚀 PROCESAMIENTO DEL BODY 🚀
        // Usamos el body directo si es FormData. Si es JSON, hacemos stringify.
        body: isFormData ? options.body : JSON.stringify(options.body),

        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    // Si es FormData, el navegador debe establecer Content-Type: multipart/form-data.
    // Nos aseguramos de que no haya un Content-Type de JSON duplicado en los headers.
    if (isFormData && config.headers['Content-Type']) {
        delete config.headers['Content-Type'];
    }

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
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

// Funciones helpers para metodos HTTP comunes
export const get = (endpoint, options) => httpService(endpoint, { method: 'GET', ...options });

export const post = (endpoint, data, options) => {
    // 'data' puede ser un objeto JSON (login) o FormData (subida de archivos)
    return httpService(endpoint, {
        method: 'POST',
        body: data,
        ...options
    });
};

export const put = (endpoint, data, options) => {
    return httpService(endpoint, {
        method: 'PUT',
        body: data, // El body se pasa directamente. httpService lo procesa.
        ...options
    });
};

export const del = (endpoint, options) => httpService(endpoint, { method: 'DELETE', ...options });