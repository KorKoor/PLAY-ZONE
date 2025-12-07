// src/pages/FavoritesPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import PostCard from '../components/posts/PostCard';
import useFavorites from '../hooks/useFavorites';
import usePosts from '../hooks/usePosts';
import { FaHeart, FaExclamationTriangle } from 'react-icons/fa';
import '../styles/FavoritesPage.css';

const FavoritesPage = () => {
    const navigate = useNavigate();
    const { favorites, isLoading, error, removeFavorite, fetchFavorites } = useFavorites();
    const { handleLike, addComment } = usePosts();

    const handleFavoriteToggle = async (postId, isFavorite) => {
        if (isFavorite) {
            // In favorites, we are only showing favorited posts, so toggling means removing.
            await removeFavorite(postId);
        }
    };

    if (isLoading) {
        return (
            <div className="favorites-page">
                <Header />
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Cargando tus favoritos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="favorites-page">
            <Header />
            <div className="favorites-container">
                <header className="favorites-header">
                    <h1><FaHeart /> Mis Favoritos</h1>
                    <p className="favorites-subtitle">
                        Aquí encuentras todas las publicaciones que has guardado.
                    </p>
                </header>

                {error && (
                    <div className="error-container">
                        <p className="error-message">
                            <FaExclamationTriangle /> {error}
                        </p>
                        <button onClick={() => fetchFavorites()} className="retry-button">
                            Reintentar
                        </button>
                    </div>
                )}

                {!error && (!favorites || favorites.length === 0) ? (
                    <div className="empty-favorites">
                        <span className="empty-icon">💔</span>
                        <h2>No tienes favoritos aún</h2>
                        <p>Cuando marques publicaciones como favoritas, aparecerán aquí.</p>
                        <button onClick={() => navigate('/home')} className="browse-posts-button">
                            Descubrir Publicaciones
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="favorites-stats">
                            <p className="favorites-count">
                                Tienes {favorites.length} publicación{favorites.length !== 1 ? 'es' : ''} guardada{favorites.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                        <div className="favorites-grid">
                            {favorites.map(post => (
                                <PostCard
                                    key={post._id}
                                    post={{
                                        ...post,
                                        isFavorite: true // Always true on this page
                                    }}
                                    onLike={handleLike}
                                    onFavorite={handleFavoriteToggle}
                                    addComment={addComment}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default FavoritesPage;