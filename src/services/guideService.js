// src/services/guideService.js
import { post, put, del, get } from './httpService';

const guideService = {
    // ==========================================================
    // GESTIÓN DE GUÍAS
    // ==========================================================

    // Obtener todas las guías (con paginación y filtros)
    getAllGuides: (page = 1, limit = 10, filters = {}) => {
        let endpoint = `/guides?page=${page}&limit=${limit}`;
        
        // Agregar filtros si existen
        if (filters.category) endpoint += `&category=${encodeURIComponent(filters.category)}`;
        if (filters.difficulty) endpoint += `&difficulty=${encodeURIComponent(filters.difficulty)}`;
        if (filters.search) endpoint += `&search=${encodeURIComponent(filters.search)}`;
        if (filters.gameId) endpoint += `&gameId=${encodeURIComponent(filters.gameId)}`; // Nuevo filtro por gameId
        
        return get(endpoint);
    },

    // Obtener guías por ID de juego
    getGuidesByGameId: (gameId, page = 1, limit = 10) => {
        return guideService.getAllGuides(page, limit, { gameId });
    },

    // Obtener guía por ID
    getGuideById: (guideId) => {
        return get(`/guides/${guideId}`);
    },

    // Crear nueva guía
    createGuide: (guideData) => {
        return post('/guides', guideData);
    },

    // Actualizar guía existente
    updateGuide: (guideId, updatedData) => {
        return put(`/guides/${guideId}`, updatedData);
    },

    // Eliminar guía
    deleteGuide: (guideId) => {
        return del(`/guides/${guideId}`);
    },

    // ==========================================================
    // INTERACCIONES CON GUÍAS
    // ==========================================================

    // Marcar/desmarcar guía como útil
    toggleUseful: (guideId) => {
        return put(`/guides/${guideId}/useful`);
    },

    // Obtener comentarios de una guía
    getGuideComments: (guideId) => {
        return get(`/guides/${guideId}/comments`);
    },

    // Añadir comentario a una guía
    addGuideComment: (guideId, content) => {
        return post(`/guides/${guideId}/comments`, { content });
    },

    // Buscar guías
    searchGuides: (query) => {
        return get(`/guides/search?q=${encodeURIComponent(query)}`);
    },

    // Obtener guías por categoría
    getGuidesByCategory: (category) => {
        return get(`/guides/category/${encodeURIComponent(category)}`);
    },

    // Obtener guías destacadas
    getFeaturedGuides: () => {
        return get('/guides/featured');
    },

    // Obtener estadísticas de guías para admin
    getGuidesStats: () => {
        return get('/guides/stats');
    }
};

export default guideService;