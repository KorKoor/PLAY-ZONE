// src/services/userService.js
import { post, put, del, get } from './httpService';

const userService = {
    // === AUTENTICACIÓN ===
    registerUser: async (userData) => {
        try {
            return await post('/auth/register', userData);
        } catch (error) {
            throw error;
        }
    },

    loginUser: async (credentials) => {
        try {
            return await post('/auth/login', credentials);
        } catch (error) {
            throw error;
        }
    },

    checkEmail: async (email) => {
        try {
            return await post('/auth/check-email', { email });
        } catch (error) {
            throw error;
        }
    },

    // === USERS ===
    getUserProfile: async (userId) => {
        try {
            return await get(`/users/${userId}`);
        } catch (error) {
            console.error('Error en getUserProfile:', error);
            throw error;
        }
    },

    updateProfile: async (userId, profileData) => {
        try {
            return await put(`/users/${userId}`, profileData);
        } catch (error) {
            console.error('Error en updateProfile:', error);
            throw error;
        }
    },

    changePassword: async (passwordData) => {
        try {
            return await put('/users/password', passwordData);
        } catch (error) {
            console.error('Error en changePassword:', error);
            throw error;
        }
    },

    deleteAccount: async (userId) => {
        try {
            return await del(`/users/${userId}`);
        } catch (error) {
            console.error('Error en deleteAccount:', error);
            throw error;
        }
    },

    followUser: async (targetUserId) => {
        try {
            return await post(`/users/${targetUserId}/follow`);
        } catch (error) {
            console.error('Error en followUser:', error);
            throw error;
        }
    },

    getAllUsers: async (query = '') => {
        try {
            const endpoint = query
                ? `/users?search=${encodeURIComponent(query)}`
                : '/users';
            return await get(endpoint);
        } catch (error) {
            console.error('Error en getAllUsers:', error);
            throw error;
        }
    },

    getActiveUsers: async () => {
        try {
            return await get('/users/active');
        } catch (error) {
            console.error('Error en getActiveUsers:', error);
            throw error;
        }
    },

    getUsers: async () => {
        try {
            // Este endpoint se combinará con la URL base para llamar a /api/v1/users
            return await get('/users');
        } catch (error) {
            console.error('Error en getUsers:', error);
            throw error;
        }
    },
};

export default userService;
