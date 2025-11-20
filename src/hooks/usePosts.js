// src/hooks/usePosts.js
import { useState, useEffect, useCallback } from 'react';
import postService from '../services/postService';

const POSTS_PER_PAGE = 10; // Definimos un límite de posts por página

const usePosts = () => {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // Función para cargar publicaciones (con paginación y manejo del feed de seguidos - Requisito 4.3)
    const fetchPosts = useCallback(async (reset = false) => {
        if (!hasMore && !reset) return; // Evitar llamadas si no hay más posts y no es un reset

        setIsLoading(true);
        setError(null);

        const currentPage = reset ? 1 : page;

        try {
            // Asumimos que getAllPosts ya filtra por seguidos del usuario logueado (Requisito 4.3)
            const data = await postService.getAllPosts(currentPage, POSTS_PER_PAGE);

            setPosts(prevPosts => reset ? data.posts : [...prevPosts, ...data.posts]);

            // Verificar si la respuesta fue menor que el límite, indicando el final
            setHasMore(data.posts.length === POSTS_PER_PAGE);

            if (!reset) {
                setPage(currentPage + 1);
            }
        } catch (err) {
            setError(err.message || "No se pudieron cargar las publicaciones del feed.");
        } finally {
            setIsLoading(false);
        }
    }, [page, hasMore]); // Las dependencias controlan cuándo se recrea la función

    // Cargar posts iniciales al montar
    useEffect(() => {
        // En un entorno con Router, esto se activaría al navegar a /home
        fetchPosts(true);
    }, [fetchPosts]);

    // Requisito 2.4: Dar/Quitar "Me Gusta"
    const handleLike = async (postId, currentIsLiked) => {
        // Optimistic UI Update: Cambiar el estado inmediatamente para mejor UX
        setPosts(currentPosts =>
            currentPosts.map(post =>
                post.id === postId ? {
                    ...post,
                    isLiked: !currentIsLiked,
                    likesCount: currentIsLiked ? post.likesCount - 1 : post.likesCount + 1
                } : post
            )
        );

        try {
            await postService.toggleLike(postId); // Asumimos endpoint toggleLike
        } catch (err) {
            // Revertir el cambio si la llamada a la API falla
            setError("Error al registrar el like.");
            setPosts(currentPosts =>
                currentPosts.map(post =>
                    post.id === postId ? {
                        ...post,
                        isLiked: currentIsLiked,
                        likesCount: currentIsLiked ? post.likesCount + 1 : post.likesCount - 1
                    } : post
                )
            );
        }
    };

    // Función para insertar un nuevo post en la parte superior del feed
    const addNewPost = (newPost) => {
        setPosts(prevPosts => [newPost, ...prevPosts]);
    };

    return {
        posts,
        isLoading,
        error,
        fetchMorePosts: () => fetchPosts(false),
        handleLike,
        addNewPost
        // ... (Aquí se exportarían onDelete, onEdit, etc.)
    };
};

export default usePosts;