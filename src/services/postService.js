// src/services/postService.js
// Importamos las funciones HTTP genéricas que creamos con fetch
import { post, put, del, get } from './httpService';

const postService = {
    // Requisito 2.3, 2.9, 4.3: Obtener el muro principal (feed de seguidos, ordenado por reciente)
    getAllPosts: (page = 1, limit = 10, sortBy = 'createdAt', authorId = null) => {
        let endpoint = `/posts/feed?page=${page}&limit=${limit}&sortBy=${sortBy}`;
        // Para el Requisito 2.10 (Posts por perfil)
        if (authorId) {
            endpoint = `/posts/user/${authorId}?page=${page}&limit=${limit}&sortBy=${sortBy}`;
        }
        return get(endpoint);
    },

    // Requisito 2.1: Crear una nueva publicación
    createPost: (postData) => {
        // postData incluye: Título, Imagen, Descripción, Calificación (Requisitos 2.2)
        return post('/posts', postData);
    },

    // Requisito 2.7: Editar una publicación
    updatePost: (postId, updatedData) => {
        return put(`/posts/${postId}`, updatedData);
    },

    // Requisito 2.7 y 2.13: Eliminar una publicación (propia o por administrador)
    deletePost: (postId) => {
        return del(`/posts/${postId}`);
    },

    // Requisito 2.4: Dar/Quitar "Me Gusta" (asumimos un toggle endpoint)
    toggleLike: (postId) => {
        return post(`/posts/${postId}/like`);
    },

    // Requisito 2.11: Marcar/Quitar como Favorita
    toggleFavorite: (postId) => {
        return post(`/posts/${postId}/favorite`);
    },

    // Requisito 2.5: Añadir un comentario
    addComment: (postId, content) => {
        return post(`/posts/${postId}/comments`, { content });
    },

    // Requisito 2.8: Buscar publicaciones por juego o autor
    searchPosts: (query) => {
        // Asumimos un endpoint de búsqueda que maneja múltiples campos
        return get(`/posts/search?q=${encodeURIComponent(query)}`);
    }
};

export default postService;