// src/services/userService.js (VERSIÓN COMPLETA Y FUNCIONAL)
import { post, put, del, get } from './httpService';

const userService = {

    // === AUTENTICACIÓN ===

    // Requisito 1.1 y 1.9: Registrar nuevo usuario y validar correo único
    registerUser: (userData) => {
        return post('/auth/register', userData);
    },

    // Requisito 1.2: Iniciar sesión
    loginUser: (credentials) => {
        return post('/auth/login', credentials);
    },

    // Para el registro mejorado, necesitamos un endpoint de verificación de correo
    checkEmail: (email) => {
        return post('/auth/check-email', { email });
    },


    // === Rutas que manejan el recurso '/users' (Perfil, Seguidores, Lista) ===

    // 🚀 AÑADIDO (Requisito 1.8): Función para obtener los datos del perfil 🚀
    getUserProfile: (userId) => {
        // Llama a GET /api/v1/users/:userId
        return get(`/users/${userId}`);
    },

    // Requisito 1.3: Editar perfil
    updateProfile: (userId, profileData) => {
        return put(`/users/${userId}`, profileData);
    },

    // 🚀 AÑADIDO (Requisito 1.10): Función para cambiar contraseña 🚀
    changePassword: (passwordData) => {
        // Llama a PUT /api/v1/users/password
        return put(`/users/password`, passwordData);
    },

    // Requisito 1.4: Eliminar cuenta
    deleteAccount: (userId) => {
        return del(`/users/${userId}`);
    },

    // Requisito 1.7: Seguir/Dejar de seguir
    followUser: (targetUserId) => {
        // Llama a POST /api/v1/users/:targetUserId/follow
        return post(`/users/${targetUserId}/follow`);
    },

    // Requisito 1.5 y 1.6: Lista general y búsqueda de usuarios
    getAllUsers: (query = '') => {
        const endpoint = query ? `/users?search=${encodeURIComponent(query)}` : '/users';
        return get(endpoint);
    },

    getActiveUsers: () => {
        return get('/users/active');
    },
};

export default userService;