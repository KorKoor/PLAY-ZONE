// src/components/posts/PostCard.jsx
import React from 'react';
import { FaHeart, FaComment, FaStar, FaEllipsisV, FaTrash, FaEdit, FaImage } from 'react-icons/fa';
import { useAuthContext } from '../../context/AuthContext';

const PostCard = ({ post, onLike, onDelete, onEdit, onFavorite, onUploadImage }) => {
    const { user } = useAuthContext();
    const isAuthor = user && user.id === post.authorId?._id;

    // Renderizar estrellas de calificación
    const renderRating = (rating) => (
        <div className="post-rating">
            {[...Array(5)].map((_, i) => (
                <FaStar
                    key={i}
                    className={`star ${i + 1 <= rating ? 'active' : ''}`}
                />
            ))}
        </div>
    );

    // Manejar like
    const handleLikeClick = () => {
        onLike(post._id, post.isLiked);
    };

    // Manejar favorita
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
                />
                <div className="author-info">
                    <span className="author-alias">{post.authorId?.alias}</span>
                    <span className="post-date">{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>

                {/* Opciones solo si es autor */}
                {isAuthor && (
                    <div className="post-options">
                        <button onClick={() => onEdit(post._id)} aria-label="Editar post">
                            <FaEdit />
                        </button>
                        <button onClick={() => onDelete(post._id)} aria-label="Eliminar post">
                            <FaTrash />
                        </button>
                        <label className="upload-image-btn" aria-label="Subir imagen">
                            <FaImage />
                            <input
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={handleUploadImage}
                            />
                        </label>
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
                    <span className="count-item"><FaHeart /> {post.likesCount}</span>
                    <span className="count-item"><FaComment /> {post.commentsCount}</span>
                </div>
            </div>

            {/* Acciones */}
            <footer className="post-actions">
                <button
                    onClick={handleLikeClick}
                    className={`btn-action ${post.isLiked ? 'liked' : ''}`}
                    aria-label="Dar like"
                >
                    <FaHeart /> {post.isLiked ? 'Me Gusta' : 'Like'}
                </button>
                <button className="btn-action" aria-label="Comentar">
                    <FaComment /> Comentar
                </button>
                <button
                    onClick={handleFavoriteClick}
                    className={`btn-action ${post.isFavorite ? 'favorited' : ''}`}
                    aria-label="Marcar como favorita"
                >
                    <FaStar /> {post.isFavorite ? 'Favorita' : 'Marcar Favorita'}
                </button>
            </footer>
        </article>
    );
};

export default PostCard;
