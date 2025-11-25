// src/hooks/usePosts.js

import { useState, useEffect, useCallback } from 'react';
import postService from '../services/postService';
import userService from '../services/userService'; // Necesario para favoritos

const POSTS_PER_PAGE = 10;

const usePosts = () => {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // ==========================================================
    // LÓGICA DE CARGA Y PAGINACIÓN
    // ==========================================================
    const fetchPosts = useCallback(async (reset = false) => {
        if (!hasMore && !reset) return;

        setIsLoading(true);
        setError(null);

        const currentPage = reset ? 1 : page;

        try {
            // Llama a GET /api/v1/posts/feed
            const data = await postService.getAllPosts(currentPage, POSTS_PER_PAGE);

            setPosts(prevPosts => reset ? data.posts : [...prevPosts, ...data.posts]);

            // Verifica si la respuesta fue menor que el limite
            setHasMore(data.posts.length === POSTS_PER_PAGE);

            if (!reset) {
                setPage(currentPage + 1);
            }
        } catch (err) {
            setError(err.message || "No se pudieron cargar las publicaciones del feed.");
        } finally {
            setIsLoading(false);
        }
    }, [page, hasMore]);

    // Cargar posts iniciales al montar
    useEffect(() => {
        fetchPosts(true);
    }, [fetchPosts]);

    // Inserta el nuevo post creado por el PostForm al inicio del array
    const addNewPost = (newPost) => {
        setPosts(prevPosts => [newPost, ...prevPosts]);
    };

    // ==========================================================
    // LÓGICA DE INTERACCIÓN SOCIAL (OPTIMISTIC UI)
    // ==========================================================

    // 1. MANEJAR LIKES (Requisito 2.4)
    const handleLike = async (postId, currentIsLiked) => {
        // Optimistic UI: Actualizar el estado asumiendo éxito
        setPosts(currentPosts =>
            currentPosts.map(post =>
                post._id === postId ? {
                    ...post,
                    isLiked: !currentIsLiked,
                    likesCount: currentIsLiked ? post.likesCount - 1 : post.likesCount + 1
                } : post
            )
        );

        try {
            await postService.toggleLike(postId);

        } catch (err) {
            setError("Error al registrar el like. Intenta de nuevo.");
            // Revertir el estado si falla
            setPosts(currentPosts =>
                currentPosts.map(post =>
                    post._id === postId ? {
                        ...post,
                        isLiked: currentIsLiked,
                        likesCount: currentIsLiked ? post.likesCount + 1 : post.likesCount - 1
                    } : post
                )
            );
        }
    };

    // 2. MANEJAR FAVORITOS (Requisito 2.11)
    const handleFavorite = async (postId, currentIsFavorite) => {
        // Optimistic UI: Asumimos éxito
        setPosts(currentPosts =>
            currentPosts.map(post =>
                post._id === postId ? {
                    ...post,
                    isFavorite: !currentIsFavorite,
                } : post
            )
        );

        try {
            await userService.toggleFavorite(postId);

        } catch (err) {
            setError("Error al marcar como favorito.");
            // Revertir el estado si falla
            setPosts(currentPosts =>
                currentPosts.map(post =>
                    post._id === postId ? {
                        ...post,
                        isFavorite: currentIsFavorite,
                    } : post
                )
            );
        }
    };

    // 3. AÑADIR COMENTARIO (Requisito 2.5)
    const addComment = async (postId, content) => {
        try {
            const result = await postService.addComment(postId, content);

            // Incrementar el contador de comentarios en el estado local
            setPosts(currentPosts =>
                currentPosts.map(post =>
                    post._id === postId ? {
                        ...post,
                        commentsCount: post.commentsCount + 1
                    } : post
                )
            );
            return result; // Devuelve el comentario para la UI
        } catch (err) {
            setError("Fallo al publicar el comentario.");
            throw err;
        }
    };

    // 4. ELIMINAR POST (Requisito 2.7, 2.13)
    const handleDelete = async (postId) => {
        const originalPosts = posts;

        // Optimistic UI: Eliminar el post del estado inmediatamente
        setPosts(currentPosts => currentPosts.filter(post => post._id !== postId));

        try {
            await postService.deletePost(postId);

        } catch (err) {
            setError("Error al eliminar la publicacion. El servidor no respondio.");
            // Revertir el estado si falla
            setPosts(originalPosts);
        }
    };

    // 5. EDITAR POST (Requisito 2.7)
    const handleEdit = async (postId, updates) => {
        try {
            const updatedPost = await postService.updatePost(postId, updates);

            // Actualización Optimista: Reemplazar el post viejo con el nuevo
            setPosts(currentPosts =>
                currentPosts.map(post =>
                    post._id === postId ? updatedPost : post
                )
            );
            return { success: true };

        } catch (err) {
            setError("Error al guardar la edicion.");
            return { success: false, error: err.message };
        }
    };


    return {
        posts,
        isLoading,
        error,
        fetchMorePosts: () => fetchPosts(false),
        addNewPost,
        handleLike,
        handleFavorite,
        addComment,

        // 🚀 EXPORTACIONES DE ADMINISTRACIÓN COMPLETAS 🚀
        handleDelete,
        handleEdit,
    };
};

export default usePosts;