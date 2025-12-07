import { useState, useEffect, useCallback } from 'react';
import postService from '../services/postService';
import useAuth from './useAuth';

const usePosts = (initialPage = 1) => {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(initialPage);
    const [totalPages, setTotalPages] = useState(1);
    const { isLoggedIn, checkUserStatus } = useAuth();

    const fetchPosts = useCallback(async (loadMore = false) => {
        if (!isLoggedIn) {
            setPosts([]);
            setIsLoading(false);
            setError("Necesitas estar logueado para ver los posts.");
            return;
        }

        if (!loadMore) {
            setIsLoading(true);
            setError(null);
        }

        try {
            const currentPage = loadMore ? page + 1 : page;
            const response = await postService.getAllPosts(currentPage, 10);
            
            if (loadMore) {
                setPosts(prev => [...prev, ...(response.posts || [])]);
                setPage(currentPage);
            } else {
                setPosts(response.posts || []);
            }
            
            setTotalPages(response.totalPages || 1);
        } catch (err) {
            console.error('Error cargando posts:', err);
            setError("No se pudo cargar el feed de publicaciones.");
        } finally {
            setIsLoading(false);
        }
    }, [page, isLoggedIn, checkUserStatus]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const addNewPost = async (postData) => {
        try {
            const newPost = await postService.createPost(postData);
            setPosts(prev => [newPost, ...prev]);
            return { success: true, post: newPost };
        } catch (err) {
            console.error('Error creando post:', err);
            return { success: false, error: err.message };
        }
    };

    const handleLike = async (postId, currentIsLiked) => {
        console.log('🔍 handleLike called:', { postId, currentIsLiked });
        
        setPosts(currentPosts =>
            currentPosts.map(post =>
                post._id === postId
                    ? {
                        ...post,
                        isLiked: !currentIsLiked,
                        likesCount: !currentIsLiked
                            ? (post.likesCount || 0) + 1
                            : Math.max((post.likesCount || 0) - 1, 0)
                    }
                    : post
            )
        );

        try {
            await postService.toggleLike(postId);
        } catch (err) {
            console.error('❌ Error en handleLike:', err);
            
            setPosts(currentPosts =>
                currentPosts.map(post =>
                    post._id === postId
                        ? {
                            ...post,
                            isLiked: currentIsLiked,
                            likesCount: currentIsLiked
                                ? (post.likesCount || 0) + 1
                                : Math.max((post.likesCount || 0) - 1, 0)
                        }
                        : post
                )
            );
            
            setError("No se pudo procesar el me gusta.");
        }
    };

    const handleFavorite = async (postId, currentIsFavorite) => {
        console.log('🔍 handleFavorite called:', { postId, currentIsFavorite });
        
        // Optimistic UI: Actualizar inmediatamente
        setPosts(currentPosts =>
            currentPosts.map(post =>
                post._id === postId
                    ? {
                        ...post,
                        isFavorite: !currentIsFavorite,
                        favoritesCount: !currentIsFavorite 
                            ? (post.favoritesCount || 0) + 1 
                            : Math.max((post.favoritesCount || 0) - 1, 0)
                    }
                    : post
            )
        );

        try {
            console.log('🚀 Calling postService.toggleFavorite with postId:', postId);
            const result = await postService.toggleFavorite(postId);
            console.log('✅ toggleFavorite success:', result);
            
            // Mostrar notificación visual clara
            const action = !currentIsFavorite ? 'agregado a' : 'removido de';
            const message = `✅ Post ${action} favoritos exitosamente`;
            console.log(message);
            
            // Mostrar notificación temporal en pantalla
            const notification = document.createElement('div');
            notification.innerHTML = `
                <div style="
                    position: fixed; 
                    top: 20px; 
                    right: 20px; 
                    background: ${!currentIsFavorite ? '#4CAF50' : '#FF9800'}; 
                    color: white; 
                    padding: 15px 20px; 
                    border-radius: 8px; 
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    z-index: 10000;
                    font-weight: 600;
                    animation: slideIn 0.3s ease-out;
                ">
                    ${!currentIsFavorite ? '💖 Agregado a favoritos' : '💔 Removido de favoritos'}
                </div>
            `;
            document.body.appendChild(notification);
            
            // Remover notificación después de 3 segundos
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 3000);
            
        } catch (err) {
            console.error('❌ Error en handleFavorite:', err);
            
            // Mostrar el error específico
            alert(`❌ Error: ${err.message || 'No se pudo procesar la acción de favoritos'}`);
            
            // Revertir cambios optimistas si falla
            setPosts(currentPosts =>
                currentPosts.map(post =>
                    post._id === postId
                        ? {
                            ...post,
                            isFavorite: currentIsFavorite,
                            favoritesCount: currentIsFavorite 
                                ? (post.favoritesCount || 0) + 1 
                                : Math.max((post.favoritesCount || 0) - 1, 0)
                        }
                        : post
                )
            );
            
            setError(`No se pudo ${!currentIsFavorite ? 'agregar a' : 'remover de'} favoritos: ${err.message}`);
        }
    };

    const addComment = async (postId, content) => {
        try {
            const result = await postService.addComment(postId, content);
            
            setPosts(currentPosts =>
                currentPosts.map(post =>
                    post._id === postId
                        ? { ...post, commentsCount: (post.commentsCount || 0) + 1 }
                        : post
                )
            );
            
            return result;
        } catch (err) {
            console.error('Error añadiendo comentario:', err);
            setError("No se pudo añadir el comentario.");
        }
    };

    const handleDelete = async (postId) => {
        const userConfirmation = window.confirm("¿Estás seguro de que deseas eliminar esta publicación?");
        if (!userConfirmation) return;

        const originalPosts = [...posts];
        setPosts(currentPosts => currentPosts.filter(post => post._id !== postId));

        try {
            await postService.deletePost(postId);
        } catch (err) {
            console.error('Error al eliminar publicación:', err);
            setError("Error al eliminar la publicacion.");
            setPosts(originalPosts);
        }
    };

    const handleEdit = async (postId, updates) => {
        try {
            const updatedPost = await postService.updatePost(postId, updates);

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
        fetchMorePosts: () => fetchPosts(true),
        addNewPost,
        addComment,
        handleLike,
        handleFavorite,
        handleDelete,
        handleEdit,
    };
};

export default usePosts;