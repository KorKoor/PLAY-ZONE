// src/pages/HomePage.jsx
import React, { useState } from 'react';
import { useAuthContext } from '../context/AuthContext';
import usePosts from '../hooks/usePosts';
import PostCard from '../components/posts/PostCard';
import Header from '../components/layout/Header';
import SidebarCommunity from '../components/layout/SidebarCommunity';
import PostForm from '../components/posts/PostForm';
import { FaPlusCircle, FaBookOpen, FaUserCircle, FaHeart, FaHome as FaHomeIcon } from 'react-icons/fa'; // Importar iconos necesarios
import { useNavigate } from 'react-router-dom'; // Importar para navegación

const HomePage = () => {
    const { user } = useAuthContext();
    const navigate = useNavigate(); // Inicializar hook de navegación

    const {
        posts,
        isLoading,
        error,
        fetchMorePosts,
        handleLike,
        addComment,
        handleFavorite, // Asumimos que esta función existe en usePosts
        addNewPost // Función para insertar posts
    } = usePosts();

    const [isPostFormOpen, setIsPostFormOpen] = useState(false);

    // Llama al hook que maneja la inserción de nuevos posts
    const handlePostCreated = (newPost) => {
        addNewPost(newPost);
        setIsPostFormOpen(false);
    };

    // Función para manejar el like (pasada a PostCard)
    const handlePostLike = (postId, isLiked) => {
        if (handleLike) handleLike(postId, isLiked);
    };

    // Función para manejar favoritos (pasada a PostCard)
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

                        {/* 🚀 ENLACES DE NAVEGACIÓN PRINCIPALES (Requisitos 1.8, 2.11) 🚀 */}
                        <div className="nav-links-group">
                            <button className="nav-link-item" onClick={() => navigate('/home')}>
                                <FaHomeIcon /> Feed Principal
                            </button>
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
                                // ⚠️ FIX: Usar el _id de MongoDB como clave única ⚠️
                                key={post._id}
                                post={post}
                                onLike={handlePostLike}
                                onFavorite={handlePostFavorite}
                                addComment={addComment}
                            // onEdit y onDelete se pasan aquí si se implementan modales
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