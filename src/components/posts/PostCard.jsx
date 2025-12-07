// src/components/posts/PostCard.jsx

import React, { useState } from 'react';
import '../../styles/PostCard.css';
import { FaHeart, FaComment, FaStar, FaEllipsisV, FaTrash, FaEdit, FaCalendarAlt, FaUserMinus, FaUserPlus, FaFlag } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom'; // Para navegación de perfil
import { useAuthContext } from '../../context/AuthContext';
import postService from '../../services/postService'; // Servicio para obtener la lista de likes
import CommentSection from './CommentSection';
import LikeListDropdown from './LikeListDropdown'; // Componente para mostrar la lista
import ReportModal from '../common/ReportModal';

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

const PostCard = ({ post, onLike, onDelete, onEdit, onFavorite, addComment, showRemoveFavorite = false }) => {

    // Helper function para extraer nombre del usuario
    const extractUserName = (post) => {
        if (!post) return 'Usuario desconocido';
        
        console.log('[PostCard] Extrayendo nombre de usuario del post:', post);
        
        const possibleSources = [
            { source: 'authorId.alias', value: post.authorId?.alias },
            { source: 'authorId.username', value: post.authorId?.username },
            { source: 'authorId.name', value: post.authorId?.name },
            { source: 'author.alias', value: post.author?.alias },
            { source: 'author.username', value: post.author?.username },
            { source: 'author.name', value: post.author?.name },
            { source: 'user.alias', value: post.user?.alias },
            { source: 'user.username', value: post.user?.username },
            { source: 'user.name', value: post.user?.name },
            { source: 'authorName', value: post.authorName },
            { source: 'userName', value: post.userName }
        ];
        
        // Primero buscar nombres directos
        for (const { source, value } of possibleSources) {
            if (value && typeof value === 'string' && value.trim()) {
                console.log(`[PostCard] ✅ Found user name in ${source}:`, value);
                return value;
            }
        }
        
        // Buscar en objetos
        const userObjects = [
            { source: 'authorId object', obj: post.authorId },
            { source: 'author object', obj: post.author },
            { source: 'user object', obj: post.user }
        ];
        
        for (const { source, obj } of userObjects) {
            if (obj && typeof obj === 'object') {
                const nameInObject = obj.alias || obj.username || obj.name || obj.displayName;
                if (nameInObject && typeof nameInObject === 'string') {
                    console.log(`[PostCard] ✅ Found user name in ${source}:`, nameInObject);
                    return nameInObject;
                }
                
                const idInObject = obj._id || obj.id;
                if (idInObject && (typeof idInObject === 'string' || typeof idInObject === 'number')) {
                    console.log(`[PostCard] ✅ Using ID from ${source}:`, idInObject);
                    return `Usuario #${idInObject}`;
                }
            }
        }
        
        return 'Usuario desconocido';
    };

    // Helper function para extraer foto del usuario
    const extractUserPhoto = (post) => {
        if (!post) return null;
        
        console.log('[PostCard] Extrayendo foto de usuario del post...');
        
        const possiblePhotoSources = [
            { source: 'authorId.avatarUrl', value: post.authorId?.avatarUrl },
            { source: 'authorId.profileImage', value: post.authorId?.profileImage },
            { source: 'authorId.avatar', value: post.authorId?.avatar },
            { source: 'authorId.photo', value: post.authorId?.photo },
            { source: 'author.profileImage', value: post.author?.profileImage },
            { source: 'author.avatar', value: post.author?.avatar },
            { source: 'author.photo', value: post.author?.photo },
            { source: 'author.image', value: post.author?.image },
            { source: 'user.profileImage', value: post.user?.profileImage },
            { source: 'user.avatar', value: post.user?.avatar },
            { source: 'profileImage', value: post.profileImage },
            { source: 'avatar', value: post.avatar }
        ];
        
        // Buscar fotos directas
        for (const { source, value } of possiblePhotoSources) {
            if (value && typeof value === 'string' && value.trim()) {
                console.log(`[PostCard] ✅ Found user photo in ${source}:`, value);
                return value;
            }
        }
        
        // Buscar fotos en objetos
        const userObjects = [
            { source: 'authorId object', obj: post.authorId },
            { source: 'author object', obj: post.author },
            { source: 'user object', obj: post.user }
        ];
        
        for (const { source, obj } of userObjects) {
            if (obj && typeof obj === 'object') {
                const photoInObject = obj.avatarUrl || obj.profileImage || obj.avatar || obj.photo || obj.image;
                if (photoInObject && typeof photoInObject === 'string' && photoInObject.trim()) {
                    console.log(`[PostCard] ✅ Found user photo in ${source}:`, photoInObject);
                    return photoInObject;
                }
            }
        }
        
        console.log('[PostCard] ❌ No user photo found');
        return null;
    };

    // Hooks y Estados
    const navigate = useNavigate();
    const { user } = useAuthContext();
    const isAuthor = user && user.id === post.authorId;

    const [isCommentsOpen, setIsCommentsOpen] = useState(false);
    const [isLikeListOpen, setIsLikeListOpen] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);

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
        console.log(`💖 ${post.isFavorite ? 'Removiendo' : 'Agregando'} favorito: ${post.gameTitle}`);
        
        if (onFavorite) {
            onFavorite(post._id, post.isFavorite);
        } else {
            console.warn('⚠️ onFavorite function not provided to PostCard');
        }
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

    // Manejar reporte
    const handleReportClick = () => {
        setShowReportModal(true);
    };

    const handleReportClose = () => {
        setShowReportModal(false);
    };


    return (
        <article className="post-card">
            {/* Encabezado */}
            <header className="post-header">
                {(() => {
                    const userPhoto = extractUserPhoto(post);
                    const userName = extractUserName(post);
                    const userId = post.authorId?._id || post.author?._id || post.user?._id;
                    
                    return userPhoto ? (
                        <img
                            src={userPhoto}
                            alt={userName}
                            className="author-avatar"
                            onClick={() => navigate(`/profile/${userId}`)}
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                            }}
                        />
                    ) : null;
                })()}
                <div 
                    className="author-avatar author-avatar-fallback" 
                    style={{ display: extractUserPhoto(post) ? 'none' : 'block' }}
                    onClick={() => {
                        const userId = post.authorId?._id || post.author?._id || post.user?._id;
                        if (userId) navigate(`/profile/${userId}`);
                    }}
                >
                    <DefaultAvatar />
                </div>
                <div className="author-info">
                    <span className="author-alias">{extractUserName(post)}</span>
                    <span className="post-date"><FaCalendarAlt /> {formatDate(post.createdAt)}</span>
                </div>

                {/* Opciones */}
                <div className="post-options">
                    {isAuthor ? (
                        // Opciones del autor
                        <>
                            <button onClick={() => onEdit(post)} aria-label="Editar post" className="btn-icon"><FaEdit /></button>
                            <button onClick={() => onDelete(post._id)} aria-label="Eliminar post" className="btn-icon delete-btn"><FaTrash /></button>
                            <button className="btn-options-icon" aria-label="Más opciones"><FaEllipsisV /></button>
                        </>
                    ) : (
                        // Opciones para otros usuarios
                        user && (
                            <button onClick={handleReportClick} aria-label="Reportar post" className="btn-icon report-btn" title="Reportar contenido">
                                <FaFlag />
                            </button>
                        )
                    )}
                </div>
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
                    className={`btn-action btn-favorite ${post.isFavorite ? 'favorited' : ''} ${showRemoveFavorite ? 'remove-favorite' : ''}`}
                    aria-label={showRemoveFavorite ? 'Quitar de favoritos' : (post.isFavorite ? 'Quitar de favoritos' : 'Marcar Favorita')}
                >
                    <FaStar /> 
                    {showRemoveFavorite ? 'Quitar de Favoritos' : (post.isFavorite ? 'Favorita' : 'Marcar Favorita')}
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

            {/* MODAL DE REPORTE */}
            {showReportModal && (
                <ReportModal
                    isOpen={showReportModal}
                    onClose={handleReportClose}
                    contentId={post._id}
                    contentType="post"
                    contentTitle={post.gameTitle}
                    reportedUser={extractUserName(post)}
                    reportedUserId={post.authorId?._id || post.author?._id || post.user?._id || null}
                />
            )}
        </article>
    );
};

export default PostCard;