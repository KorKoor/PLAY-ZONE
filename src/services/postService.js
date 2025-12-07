// src/services/postService.js
// Importamos las funciones HTTP genéricas que creamos con fetch
import { post, put, del, get } from './httpService';

const postService = {
    // ==========================================================
    // CARGA Y BÚSQUEDA
    // ==========================================================

    // Requisito 2.3, 2.9, 4.3: Obtener el muro principal / Posts por perfil
    getAllPosts: (page = 1, limit = 10, sortBy = 'createdAt', authorId = null) => {
        let endpoint = `/posts/feed?page=${page}&limit=${limit}&sortBy=${sortBy}`;

        // Para el Requisito 2.10 (Posts por perfil)
        if (authorId) {
            endpoint = `/posts/${authorId}?page=${page}&limit=${limit}&sortBy=${sortBy}`;
        }
        return get(endpoint);
    },

    // Requisito 2.8: Buscar publicaciones por juego o autor
    searchPosts: (query) => {
        return get(`/posts/search?q=${encodeURIComponent(query)}`);
    },

    // ==========================================================
    // GESTIÓN DE PUBLICACIONES
    // ==========================================================

    // Requisito 2.1: Crear una nueva publicación (Recibe FormData o JSON)
    createPost: (postData) => {
        return post('/posts', postData);
    },

    // Requisito 2.7: Editar una publicación
    updatePost: (postId, updatedData) => {
        return put(`/posts/${postId}`, updatedData);
    },

    // Requisito 2.7 y 2.13: Eliminar una publicación
    deletePost: (postId) => {
        return del(`/posts/${postId}`);
    },

    // ==========================================================
    // INTERACCIONES SOCIALES
    // ==========================================================

    // Requisito 2.4: Dar/Quitar "Me Gusta"
    toggleLike: (postId) => {
        return put(`/posts/${postId}/like`);
    },

    // Requisito 2.11: Marcar/Quitar como Favorita
    toggleFavorite: async (postId) => {
        try {
            const result = await put(`/posts/${postId}/favorite`);
            return result;
        } catch (error) {
            console.error('Error al alternar favorito:', error);
            throw error;
        }
    },

    // Obtener lista de favoritos del usuario
    getUserFavorites: async () => {
        // Usar solo el endpoint que funciona según los logs
        const workingEndpoint = '/favorites';

        try {
            const result = await get(workingEndpoint);
            return result;
        } catch (error) {
            console.error('Error obteniendo favoritos:', error);
            return { favorites: [] };
        }
    },

    // Obtener estado de favorito de un post específico
    getFavoriteStatus: (postId) => {
        return get(`/posts/${postId}/favorite-status`);
    },

    // 🚀 FUNCIÓN FALTANTE: Obtener lista de usuarios que dieron like (Req. 2.6) 🚀
    getLikesList: (postId) => {
        // Llama al endpoint GET /api/v1/posts/:postId/likes
        return get(`/posts/${postId}/likes`);
    },

    // Requisito 2.5: Añadir un comentario
    addComment: (postId, content) => {
        return post(`/posts/${postId}/comments`, { content });
    },

    // Requisito 2.6: Obtener comentarios de un post
    getComments: (postId) => {
        return get(`/posts/${postId}/comments`);
    }
};

export default postService;