// src/services/reviewService.js
import { post, put, del, get } from './httpService';

const reviewService = {
    // ==========================================================
    // GESTIÓN DE RESEÑAS
    // ==========================================================

    // Obtener todas las reseñas para un juego específico
    getGameReviews: (gameId, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc') => {
        let endpoint = `/games/${gameId}/reviews?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`;
        return get(endpoint);
    },

    // Crear una nueva reseña para un juego
    createReview: (gameId, reviewData) => {
        return post(`/games/${gameId}/reviews`, reviewData);
    },

    // Actualizar una reseña existente
    updateReview: (reviewId, updatedData) => {
        return put(`/reviews/${reviewId}`, updatedData);
    },

    // Eliminar una reseña
    deleteReview: (reviewId) => {
        return del(`/reviews/${reviewId}`);
    },
};

export default reviewService;
