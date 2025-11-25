// src/components/posts/PostCard.jsx

import React, { useState } from 'react';
import '../../styles/PostCard.css';
import { FaHeart, FaComment, FaStar, FaEllipsisV, FaTrash, FaEdit, FaCalendarAlt, FaUserMinus, FaUserPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom'; // Para navegación de perfil
import { useAuthContext } from '../../context/AuthContext';
import postService from '../../services/postService'; // Servicio para obtener la lista de likes
import CommentSection from './CommentSection';
import LikeListDropdown from './LikeListDropdown'; // Componente para mostrar la lista

// Funciones utilitarias (simuladas aquí, pero la lógica va en usePosts)
const formatDate = (dateString) => {
    if (!dateString) return 'Fecha Desconocida';
    return new Date(dateString).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
};

// Renderizar estrellas de calificación
const renderRating = (rating) => (
    <div className="post-rating">
        {[...Array(5)].map((_, i) => (
            <FaStar
                key={i}
                className={`star ${i + 1 <= rating ? 'active' : 'inactive'}`}
            />
        ))}
    </div>
);


const DefaultAvatar = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="55px" height="55px" style={{ color: '#cccccc' }}>
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
);

const PostCard = ({ post, onLike, onDelete, onEdit, onFavorite, addComment }) => {

    // Hooks y Estados
    const navigate = useNavigate();
    const { user } = useAuthContext();
    const isAuthor = user && user.id === post.authorId;

    const [isCommentsOpen, setIsCommentsOpen] = useState(false);
    const [isLikeListOpen, setIsLikeListOpen] = useState(false);

    // ⚠️ ESTADOS PARA LA CARGA DE LIKES REALES ⚠️
    const [likesData, setLikesData] = useState(null);
    const [isLikesLoading, setIsLikesLoading] = useState(false);


    // Manejar like
    const handleLikeClick = () => {
        if (onLike) onLike(post._id, post.isLiked);
        // Cerrar el listado si se hace toggle de like
        if (isLikeListOpen) setIsLikeListOpen(false);
    };

    const handleFavoriteClick = () => {
        if (onFavorite) onFavorite(post._id, post.isFavorite);
    };

    const handleCommentToggle = () => {
        setIsCommentsOpen(prev => !prev);
        if (isLikeListOpen) setIsLikeListOpen(false);
    };

    // 🚀 FUNCIÓN CLAVE: Cargar y mostrar la lista de likes (Real) 🚀
    const handleLikeCountClick = async () => {
        // 1. Alternar la visibilidad
        setIsLikeListOpen(prev => !prev);

        // 2. Si el dropdown se abre y los datos aún no se han cargado, hacer fetch
        if (!isLikeListOpen && !likesData && post.likesCount > 0) {
            setIsLikesLoading(true);
            try {
                // Llama al endpoint GET /api/v1/posts/:postId/likes
                const data = await postService.getLikesList(post._id);
                setLikesData(data.users); // Asumimos que la API devuelve { users: [...] }
            } catch (error) {
                console.error("Error cargando lista de likes:", error);
                setLikesData([]);
            } finally {
                setIsLikesLoading(false);
            }
        }
    };


    return (
        <article className="post-card">
            {/* Encabezado */}
            <header className="post-header">
                {post.authorId?.avatarUrl ? (
                    <img
                        src={post.authorId.avatarUrl}
                        alt={post.authorId.alias || 'Usuario'}
                        className="author-avatar"
                        onClick={() => navigate(`/profile/${post.authorId._id}`)}
                    />
                ) : (
                    <div className="author-avatar" onClick={() => navigate(`/profile/${post.authorId?._id}`)}>
                        <DefaultAvatar />
                    </div>
                )}
                <div className="author-info">
                    <span className="author-alias">{post.authorId?.alias}</span>
                    <span className="post-date"><FaCalendarAlt /> {formatDate(post.createdAt)}</span>
                </div>

                {/* Opciones solo si es autor */}
                {isAuthor && (
                    <div className="post-options">
                        <button onClick={() => onEdit(post)} aria-label="Editar post" className="btn-icon"><FaEdit /></button>
                        <button onClick={() => onDelete(post._id)} aria-label="Eliminar post" className="btn-icon delete-btn"><FaTrash /></button>
                        <button className="btn-options-icon" aria-label="Más opciones"><FaEllipsisV /></button>
                    </div>
                )}
            </header>

            {/* Contenido */}
            <div className="post-content">
                <h3 className="game-title">{post.gameTitle}</h3>
                {post.imageUrl && (
                    <img src={post.imageUrl} alt={post.gameTitle} className="post-image" />
                )}
                <p className="post-description">{post.description}</p>
            </div>

            {/* Calificación y estadísticas */}
            <div className="post-stats">
                {renderRating(post.rating)}
                <div className="interaction-counts">
                    {/* ⚠️ BOTÓN DE CONTADOR DE LIKES (Real) ⚠️ */}
                    <span
                        className="count-item like-count-clickable"
                        title="Ver usuarios que dieron like"
                        onClick={handleLikeCountClick}
                    >
                        <FaHeart className="icon-heart" /> {post.likesCount}
                    </span>
                    <span
                        className="count-item comments-count-link"
                        title="Comentarios"
                        onClick={handleCommentToggle}
                    >
                        <FaComment /> {post.commentsCount}
                    </span>
                </div>
            </div>

            {/* Acciones */}
            <footer className="post-actions">
                <button
                    onClick={handleLikeClick}
                    className={`btn-action btn-like ${post.isLiked ? 'liked' : ''}`}
                    aria-label={post.isLiked ? 'Quitar Me gusta' : 'Dar Me gusta'}
                >
                    <FaHeart /> {post.isLiked ? 'Me Gusta' : 'Like'}
                </button>
                <button
                    onClick={handleCommentToggle}
                    className="btn-action btn-comment"
                    aria-label="Comentar"
                >
                    <FaComment /> Comentar
                </button>
                <button
                    onClick={handleFavoriteClick}
                    className={`btn-action btn-favorite ${post.isFavorite ? 'favorited' : ''}`}
                    aria-label={post.isFavorite ? 'Quitar de favoritos' : 'Marcar Favorita'}
                >
                    <FaStar /> {post.isFavorite ? 'Favorita' : 'Marcar Favorita'}
                </button>
            </footer>

            {/* ⚠️ DROPDOWN DE LIKES (Visibilidad y datos) ⚠️ */}
            {isLikeListOpen && (
                <div className="like-list-wrapper">
                    <LikeListDropdown
                        likesList={likesData}
                        isLoading={isLikesLoading}
                        onClose={() => setIsLikeListOpen(false)}
                    />
                </div>
            )}

            {/* SECCIÓN DE COMENTARIOS */}
            {isCommentsOpen && (
                <div className="comments-dropdown-wrapper">
                    <CommentSection
                        postId={post._id}
                        postCommentsCount={post.commentsCount}
                        addComment={addComment}
                    />
                </div>
            )}
        </article>
    );
};

export default PostCard;