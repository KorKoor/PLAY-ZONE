// src/components/posts/PostCard.jsx (CÓDIGO FINAL Y MEJORADO)
import React from 'react';
import '../../styles/PostCard.css';
import { FaHeart, FaComment, FaStar, FaEllipsisV, FaTrash, FaEdit, FaImage, FaCalendarAlt } from 'react-icons/fa';
import { useAuthContext } from '../../context/AuthContext';

const PostCard = ({ post, onLike, onDelete, onEdit, onFavorite, onUploadImage }) => {
    // Es mejor usar solo el ID para la comparacion, ya que user.id viene del JWT (string)
    const { user } = useAuthContext();
    // ⚠️ Ajuste: Usar el ID del autor para comparacion segura (string vs string) ⚠️
    const isAuthor = user && user.id === post.authorId;

    const formatDate = (dateString) => {
        if (!dateString) return 'Fecha Desconocida';
        // Usamos es-ES para un formato de fecha amigable si los acentos estan resueltos
        return new Date(dateString).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    // Renderizar estrellas de calificación
    const renderRating = (rating) => (
        <div className="post-rating">
            {[...Array(5)].map((_, i) => (
                <FaStar
                    key={i}
                    // ⚠️ Usamos clases 'active' y 'inactive' para el CSS ⚠️
                    className={`star ${i + 1 <= rating ? 'active' : 'inactive'}`}
                />
            ))}
        </div>
    );

    // Manejar like (Requisito 2.4)
    const handleLikeClick = () => {
        // La API espera el ID del post y el estado actual
        if (onLike) onLike(post._id, post.isLiked);
    };

    // Manejar favorita (Requisito 2.11)
    const handleFavoriteClick = () => {
        if (onFavorite) onFavorite(post._id, post.isFavorite);
    };

    // Manejar subida de imagen (solo autor)
    const handleUploadImage = (e) => {
        const file = e.target.files[0];
        if (file && onUploadImage) {
            onUploadImage(post._id, file);
        }
    };

    return (
        <article className="post-card">
            {/* Encabezado */}
            <header className="post-header">
                <img
                    src={post.authorId?.avatarUrl || '/default-avatar.png'}
                    alt={post.authorId?.alias || 'Usuario'}
                    className="author-avatar"
                    // ⚠️ Navegar al perfil al hacer clic en el avatar (Buena UX) ⚠️
                    onClick={() => console.log(`Navegar a /profile/${post.authorId?._id}`)}
                />
                <div className="author-info">
                    <span className="author-alias">{post.authorId?.alias}</span>
                    <span className="post-date"><FaCalendarAlt /> {formatDate(post.createdAt)}</span>
                </div>

                {/* Opciones solo si es autor */}
                {isAuthor && (
                    <div className="post-options">
                        <button onClick={() => onEdit(post)} aria-label="Editar post" className="btn-icon">
                            <FaEdit />
                        </button>
                        <button onClick={() => onDelete(post._id)} aria-label="Eliminar post" className="btn-icon delete-btn">
                            <FaTrash />
                        </button>
                        {/* El botón de opciones desplegable iría aquí */}
                        <button className="btn-options-icon" aria-label="Más opciones">
                            <FaEllipsisV />
                        </button>
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
                    <span className="count-item" title="Me gusta"><FaHeart className="icon-heart" /> {post.likesCount}</span>
                    <span className="count-item" title="Comentarios"><FaComment /> {post.commentsCount}</span>
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
                <button className="btn-action btn-comment" aria-label="Comentar">
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
        </article>
    );
};

export default PostCard;