// src/pages/PostDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUser, FaClock, FaSpinner } from 'react-icons/fa';
import postService from '../services/postService';
import Header from '../components/layout/Header';
import CommentSection from '../components/posts/CommentSection'; // Importación añadida
import '../styles/PostDetailPage.css';

const PostDetailPage = () => {
    const { postId } = useParams();
    const navigate = useNavigate();

    const [post, setPost] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Helper function para extraer nombre del usuario
    const extractUserName = (post) => {
        if (!post) return 'Autor desconocido';
        
        console.log('[PostDetailPage] Extrayendo nombre de usuario del post:', post);
        
        const possibleSources = [
            { source: 'author.alias', value: post.author?.alias },
            { source: 'author.username', value: post.author?.username },
            { source: 'author.name', value: post.author?.name },
            { source: 'user.alias', value: post.user?.alias },
            { source: 'user.username', value: post.user?.username },
            { source: 'user.name', value: post.user?.name },
            { source: 'createdBy.alias', value: post.createdBy?.alias },
            { source: 'createdBy.username', value: post.createdBy?.username },
            { source: 'createdBy.name', value: post.createdBy?.name },
            { source: 'authorName', value: post.authorName },
            { source: 'userName', value: post.userName },
            { source: 'ownerName', value: post.ownerName }
        ];
        
        // Primero buscar nombres directos
        for (const { source, value } of possibleSources) {
            console.log(`[PostDetailPage] Checking ${source}:`, value);
            if (value && typeof value === 'string' && value.trim()) {
                console.log(`[PostDetailPage] ✅ Found user name in ${source}:`, value);
                return value;
            }
        }
        
        // Buscar en objetos de usuario
        const userObjects = [
            { source: 'userId object', obj: post.userId },
            { source: 'authorId object', obj: post.authorId },
            { source: 'author object', obj: post.author },
            { source: 'user object', obj: post.user },
            { source: 'createdBy object', obj: post.createdBy }
        ];
        
        for (const { source, obj } of userObjects) {
            if (obj && typeof obj === 'object') {
                console.log(`[PostDetailPage] Found ${source}:`, obj);
                
                const nameInObject = obj.alias || obj.username || obj.name || obj.displayName;
                if (nameInObject && typeof nameInObject === 'string') {
                    console.log(`[PostDetailPage] ✅ Found user name in ${source}:`, nameInObject);
                    return nameInObject;
                }
                
                const idInObject = obj._id || obj.id;
                if (idInObject && (typeof idInObject === 'string' || typeof idInObject === 'number')) {
                    console.log(`[PostDetailPage] ✅ Using ID from ${source}:`, idInObject);
                    return `Autor #${idInObject}`;
                }
            }
        }
        
        console.log('[PostDetailPage] ❌ No user name found, using fallback');
        return 'Autor desconocido';
    };

    // Helper function para extraer foto del usuario
    const extractUserPhoto = (post) => {
        if (!post) return null;
        
        console.log('[PostDetailPage] Extrayendo foto de usuario del post...');
        
        const possiblePhotoSources = [
            { source: 'author.profileImage', value: post.author?.profileImage },
            { source: 'author.avatar', value: post.author?.avatar },
            { source: 'author.photo', value: post.author?.photo },
            { source: 'author.image', value: post.author?.image },
            { source: 'user.profileImage', value: post.user?.profileImage },
            { source: 'user.avatar', value: post.user?.avatar },
            { source: 'user.photo', value: post.user?.photo },
            { source: 'user.image', value: post.user?.image },
            { source: 'createdBy.profileImage', value: post.createdBy?.profileImage },
            { source: 'createdBy.avatar', value: post.createdBy?.avatar },
            { source: 'profileImage', value: post.profileImage },
            { source: 'avatar', value: post.avatar },
            { source: 'userPhoto', value: post.userPhoto },
            { source: 'authorPhoto', value: post.authorPhoto }
        ];
        
        // Buscar fotos directas
        for (const { source, value } of possiblePhotoSources) {
            console.log(`[PostDetailPage] Checking photo ${source}:`, value);
            if (value && typeof value === 'string' && value.trim()) {
                console.log(`[PostDetailPage] ✅ Found user photo in ${source}:`, value);
                return value;
            }
        }
        
        // Buscar fotos en objetos
        const userObjects = [
            { source: 'userId object', obj: post.userId },
            { source: 'authorId object', obj: post.authorId },
            { source: 'author object', obj: post.author },
            { source: 'user object', obj: post.user },
            { source: 'createdBy object', obj: post.createdBy }
        ];
        
        for (const { source, obj } of userObjects) {
            if (obj && typeof obj === 'object') {
                const photoInObject = obj.profileImage || obj.avatar || obj.photo || obj.image;
                if (photoInObject && typeof photoInObject === 'string' && photoInObject.trim()) {
                    console.log(`[PostDetailPage] ✅ Found user photo in ${source}:`, photoInObject);
                    return photoInObject;
                }
            }
        }
        
        console.log('[PostDetailPage] ❌ No user photo found');
        return null;
    };

    useEffect(() => {
        const fetchPost = async () => {
            try {
                setIsLoading(true);
                const response = await postService.getPostById(postId);
                // La API estandarizada devuelve 'id', pero el objeto puede estar anidado.
                // Asumimos que la respuesta directa es el post o está en response.data
                setPost(response.data || response);
            } catch (err) {
                setError('Error al cargar la publicación. Es posible que no exista o haya sido eliminada.');
                console.error('Error fetching post:', err);
            } finally {
                setIsLoading(false);
            }
        };

        if (postId) {
            fetchPost();
        }
    }, [postId]);

    const formatDate = (dateString) => {
        if (!dateString) return 'Fecha Desconocida';
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading) {
        return (
            <div className="post-detail-container">
                <Header />
                <div className="loading-message">
                    <FaSpinner className="spinner" /> Cargando publicación...
                </div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="post-detail-container">
                <Header />
                <div className="error-message">
                    <p>{error || 'Publicación no encontrada.'}</p>
                    <button onClick={() => navigate('/community')} className="btn btn-primary">
                        <FaArrowLeft /> Volver a la Comunidad
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="post-detail-container">
            <Header />
            <main className="post-detail-main">
                <div className="post-detail-header">
                    <button onClick={() => navigate(-1)} className="btn-back">
                        <FaArrowLeft /> Volver
                    </button>
                </div>

                <article className="post-detail-card">
                    <header className="post-header">
                        <h1 className="post-title">{post.title}</h1>
                    </header>

                    {post.imageUrl && (
                        <div className="post-image-container">
                            <img src={post.imageUrl} alt={post.title} className="post-image" />
                        </div>
                    )}
                    
                    <div className="post-meta">
                        <div className="author-info">
                            {(() => {
                                const userPhoto = extractUserPhoto(post);
                                return userPhoto ? (
                                    <img 
                                        src={userPhoto} 
                                        alt="Avatar del autor"
                                        className="author-avatar"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'block';
                                        }}
                                    />
                                ) : null;
                            })()}
                            <FaUser className="author-avatar-fallback" style={{ 
                                display: extractUserPhoto(post) ? 'none' : 'block' 
                            }} />
                            <span>{extractUserName(post)}</span>
                        </div>
                        <div className="date-info">
                            <FaClock />
                            <span>{formatDate(post.createdAt)}</span>
                        </div>
                    </div>

                    <div className="post-content">
                        <p>{post.content}</p>
                    </div>

                    {/* Sección de comentarios */}
                    <section className="post-comments-section">
                        <CommentSection postId={post._id} />
                    </section>
                </article>
            </main>
        </div>
    );
};

export default PostDetailPage;
