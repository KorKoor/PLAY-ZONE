// src/pages/PostDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUser, FaClock, FaSpinner } from 'react-icons/fa';
import postService from '../services/postService';
import Header from '../components/layout/Header';
import '../styles/PostDetailPage.css';

const PostDetailPage = () => {
    const { postId } = useParams();
    const navigate = useNavigate();

    const [post, setPost] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

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
                            <FaUser />
                            <span>{post.author?.alias || 'Autor desconocido'}</span>
                        </div>
                        <div className="date-info">
                            <FaClock />
                            <span>{formatDate(post.createdAt)}</span>
                        </div>
                    </div>

                    <div className="post-content">
                        <p>{post.content}</p>
                    </div>

                    {/* Aquí se podrían añadir en el futuro interacciones como likes y comentarios */}
                </article>
            </main>
        </div>
    );
};

export default PostDetailPage;
