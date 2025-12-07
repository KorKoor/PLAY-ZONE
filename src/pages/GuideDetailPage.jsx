// src/pages/GuideDetailPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaClock, FaThumbsUp, FaComment, FaEdit, FaTrash, FaSpinner } from 'react-icons/fa';
import Header from '../components/layout/Header';
import CommentSection from '../components/posts/CommentSection';
import guideService from '../services/guideService';
import useAuth from '../hooks/useAuth';
import '../styles/GuideCard.css'; // Reutilizar estilos existentes
import '../styles/GuideDetailPage.css'; // Estilos específicos para detalle

const GuideDetailPage = () => {
    const { guideId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [guide, setGuide] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isUseful, setIsUseful] = useState(false);

    useEffect(() => {
        const fetchGuideDetail = async () => {
            try {
                setIsLoading(true);
                const response = await guideService.getGuideById(guideId);
                setGuide(response);
                setIsUseful(response.isUseful || false);
            } catch (err) {
                setError('Error al cargar la guía');
                console.error('Error fetching guide:', err);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchGuideDetail();
    }, [guideId]);

    const handleToggleUseful = async () => {
        try {
            await guideService.toggleUseful(guideId);
            setIsUseful(!isUseful);
            // Actualizar contador en la guía
            setGuide(prev => ({
                ...prev,
                usefulCount: isUseful ? prev.usefulCount - 1 : prev.usefulCount + 1,
                isUseful: !isUseful
            }));
        } catch (err) {
            console.error('Error toggling useful:', err);
        }
    };

    const handleEdit = () => {
        // TODO: Implementar edición de guía
        console.log('Editar guía:', guideId);
    };

    const handleDelete = async () => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta guía?')) {
            try {
                await guideService.deleteGuide(guideId);
                navigate('/guides');
            } catch (err) {
                alert('Error al eliminar la guía');
                console.error('Error deleting guide:', err);
            }
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Fecha Desconocida';
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (isLoading) {
        return (
            <div className="guides-page-container">
                <Header />
                <div className="loading-message">
                    <FaSpinner className="spinner" /> Cargando guía...
                </div>
            </div>
        );
    }

    if (error || !guide) {
        return (
            <div className="guides-page-container">
                <Header />
                <div className="error-message">
                    <p>{error || 'Guía no encontrada'}</p>
                    <button onClick={() => navigate('/guides')} className="btn btn-primary">
                        <FaArrowLeft /> Volver a Guías
                    </button>
                </div>
            </div>
        );
    }

    const isAuthor = user && user.id === guide.authorId?._id;
    const isAdmin = user && user.role === 'admin';

    return (
        <div className="guides-page-container">
            <Header />
            
            <main className="guides-main-content">
                <div className="guide-detail-header">
                    <button onClick={() => navigate('/guides')} className="btn-back">
                        <FaArrowLeft /> Volver a Guías
                    </button>
                </div>

                <article className="guide-detail-card">
                    <header className="guide-header">
                        <h1 className="guide-title">{guide.title}</h1>
                        <span className="guide-game-tag">Juego: {guide.game}</span>
                    </header>

                    <div className="guide-meta">
                        <div className="author-info">
                            <img
                                src={guide.authorId?.avatarUrl || '/default-avatar.png'}
                                alt={guide.authorId?.alias}
                                className="author-avatar-small"
                            />
                            <span>{guide.authorId?.alias}</span>
                        </div>
                        <div className="date-info">
                            <FaClock />
                            <span>{formatDate(guide.createdAt)}</span>
                        </div>
                    </div>

                    <div className="guide-description">
                        <h2>Descripción</h2>
                        <p>{guide.description}</p>
                    </div>

                    <div className="guide-steps">
                        <h2>Pasos ({guide.steps?.length || 0})</h2>
                        {guide.steps?.map((step, index) => (
                            <div key={index} className="guide-step">
                                <h3>Paso {step.stepNumber || index + 1}</h3>
                                <p>{step.content}</p>
                            </div>
                        ))}
                    </div>

                    <div className="guide-stats-footer">
                        <button
                            onClick={handleToggleUseful}
                            className={`btn-useful-toggle ${isUseful ? 'useful-active' : ''}`}
                        >
                            <FaThumbsUp /> {guide.usefulCount || 0} Útil
                        </button>

                        <span className="stat-item">
                            <FaComment /> {guide.commentsCount || 0} Comentarios
                        </span>
                    </div>

                    {(isAuthor || isAdmin) && (
                        <div className="guide-admin-options">
                            {isAuthor && (
                                <button onClick={handleEdit} className="btn-icon" title="Editar">
                                    <FaEdit />
                                </button>
                            )}
                            <button onClick={handleDelete} className="btn-icon delete-btn" title="Eliminar">
                                <FaTrash />
                            </button>
                        </div>
                    )}
                </article>

                {/* Sección de comentarios */}
                <section className="guide-comments-section">
                    <CommentSection guideId={guide._id} />
                </section>
            </main>
        </div>
    );
};

export default GuideDetailPage;