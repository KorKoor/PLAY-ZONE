// src/pages/HomePage.jsx

import React, { useState } from 'react';
import { useAuthContext } from '../context/AuthContext';
import usePosts from '../hooks/usePosts';
import PostCard from '../components/posts/PostCard';
import Header from '../components/layout/Header';
import SidebarCommunity from '../components/layout/SidebarCommunity';
import PostForm from '../components/posts/PostForm';
import { FaPlusCircle, FaBookOpen, FaUserCircle, FaHeart, FaHome as FaHomeIcon } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
    const { user } = useAuthContext();
    const navigate = useNavigate();

    const {
        posts,
        isLoading,
        error,
        fetchMorePosts,
        handleLike,
        addComment,
        handleFavorite,
        addNewPost
    } = usePosts();

    const [isPostFormOpen, setIsPostFormOpen] = useState(false);

    const handlePostCreated = (newPost) => {
        addNewPost(newPost);
        setIsPostFormOpen(false);
    };

    const handlePostLike = (postId, isLiked) => {
        if (handleLike) handleLike(postId, isLiked);
    };

    const handlePostFavorite = (postId, isFavorite) => {
        if (handleFavorite) handleFavorite(postId, isFavorite);
    };


    return (
        <div className="home-layout-container">
            {/* 1. Header Global con Navegación y Búsqueda */}
            <Header />

            <main className="main-content-wrapper">

                {/* 2a. Columna Izquierda: Navegación/CTA */}
                <aside className="nav-sidebar">
                    <nav className="main-nav">
                        {/* Botón CTA para crear publicación */}
                        <button
                            onClick={() => setIsPostFormOpen(true)}
                            className="btn btn-create-post"
                            disabled={isLoading}
                        >
                            <FaPlusCircle /> Crear Publicación
                        </button>

                        {/* 🚀 ENLACES DE NAVEGACIÓN PRINCIPALES 🚀 */}
                        <div className="nav-links-group">
                            <button className="nav-link-item" onClick={() => navigate('/home')}>
                                <FaHomeIcon /> Feed Principal
                            </button>
                            {/* ⚠️ CORRECCIÓN AQUÍ: Ruta de navegación a /guides ⚠️ */}
                            <button className="nav-link-item" onClick={() => navigate('/guides')}>
                                <FaBookOpen /> Ver Guías
                            </button>
                            <button className="nav-link-item" onClick={() => navigate(`/profile/${user.id}`)}>
                                <FaUserCircle /> Mi Perfil
                            </button>
                            <button className="nav-link-item" onClick={() => navigate('/favorites')}>
                                <FaHeart /> Mis Favoritos
                            </button>
                        </div>
                    </nav>
                </aside>

                {/* 2b. Columna Central: Muro de Publicaciones (FEED) */}
                <section className="feed-center-column">
                    <h1 className="feed-title">Bienvenido, {user.alias}</h1>
                    <p className="feed-subtitle">Feed de tus jugadores seguidos (Requisito 4.3).</p>

                    {error && <p className="error-message">Error cargando el feed: {error}</p>}

                    {/* Manejo de estados de Carga y Sin Contenido */}
                    {isLoading && posts.length === 0 && <div className="loading-feed-message">Cargando la Zona...</div>}

                    {!isLoading && posts.length === 0 && !error && (
                        <div className="no-content-message">
                            <h2>¡Zona Tranquila! 😴</h2>
                            <p>Aún no hay publicaciones de los jugadores que sigues. Crea tu primer post o sigue a más jugadores en el panel de la derecha.</p>
                        </div>
                    )}

                    {/* Listado de Posts */}
                    <div className="posts-list">
                        {posts.map(post => (
                            <PostCard
                                key={post._id}
                                post={post}
                                onLike={handlePostLike}
                                onFavorite={handlePostFavorite}
                                addComment={addComment}
                            />
                        ))}
                    </div>

                    {/* Botón para cargar más posts (Si hasMore es true) */}
                    {!isLoading && posts.length > 0 && (
                        <button onClick={() => fetchMorePosts()} className="btn btn-load-more">Cargar Más</button>
                    )}
                </section>

                {/* 2c. Columna Derecha: Sidebar de Comunidad */}
                <SidebarCommunity />

            </main>

            {/* Modal/Formulario de Creación de Publicación */}
            {isPostFormOpen && (
                <div className="post-modal-overlay">
                    <PostForm
                        onClose={() => setIsPostFormOpen(false)}
                        onSuccess={handlePostCreated}
                    />
                </div>
            )}
        </div>
    );
};

export default HomePage;