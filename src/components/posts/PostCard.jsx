// src/components/posts/PostCard.jsx
import React from 'react';
import { FaHeart, FaComment, FaStar, FaEllipsisV } from 'react-icons/fa'; 
import { useAuthContext } from '../../context/AuthContext';
// Importa el hook usePosts para las interacciones (o las recibe por props)

const PostCard = ({ post, onLike, onDelete, onEdit }) => {
    const { user } = useAuthContext(); 
    const isAuthor = user && user.id === post.authorId;
    
    // Función para renderizar la calificación de 1 a 5 estrellas (Requisito 2.2)
    const renderRating = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <FaStar 
                    key={i} 
                    className={i <= rating ? 'star-filled' : 'star-empty'} 
                />
            );
        }
        return <div className="post-rating">{stars}</div>;
    };

    // Maneja el like usando la función del hook/prop
    const handleLikeClick = () => {
        onLike(post.id, post.isLiked);
    };

    return (
        <article className="post-card">
            {/* Encabezado del Post: Autor e Información */}
            <header className="post-header">
                <img src={post.authorAvatar || '/default-avatar.png'} alt={post.authorAlias} className="author-avatar" />
                <div className="author-info">
                    <span className="author-alias">{post.authorAlias}</span>
                    <span className="post-date">{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
                {/* Opciones (Editar, Eliminar, Reportar) Requisito 2.7, 4.5 */}
                <div className="post-options">
                    <FaEllipsisV className="btn-options-icon" />
                    {/* El menú desplegable iría aquí (no implementado por simplicidad) */}
                </div>
            </header>

            {/* Contenido principal de la publicación */}
            <div className="post-content">
                <h3 className="game-title">{post.gameTitle}</h3> {/* Requisito 2.2 */}
                <img src={post.imageUrl} alt={post.gameTitle} className="post-image" /> {/* Requisito 2.2 */}
                <p className="post-description">{post.description}</p> {/* Requisito 2.2 */}
            </div>
            
            {/* Calificación y Estadísticas */}
            <div className="post-stats">
                {renderRating(post.rating)} {/* Requisito 2.2 */}
                <div className="interaction-counts">
                    <span className="count-item"><FaHeart /> {post.likesCount}</span> {/* Requisito 2.6 */}
                    <span className="count-item"><FaComment /> {post.commentsCount}</span> {/* Requisito 2.6 */}
                </div>
            </div>

            {/* Acciones (Interacción) */}
            <footer className="post-actions">
                <button 
                    onClick={handleLikeClick} 
                    className={`btn-action ${post.isLiked ? 'liked' : ''}`}
                >
                    <FaHeart /> {post.isLiked ? 'Me Gusta' : 'Like'}
                </button>
                <button className="btn-action">
                    <FaComment /> Comentar
                </button>
                <button className="btn-action">
                    Marcar Favorita {/* Requisito 2.11 */}
                </button>
            </footer>
        </article>
    );
};

export default PostCard;