// src/services/httpService.js
import { API_BASE_URL } from '../config/apiConfig';

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
            let errorData;
            try {
                errorData = await response.json();
                throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
            } catch {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
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
