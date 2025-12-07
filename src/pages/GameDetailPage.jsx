// src/pages/GameDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import gameService from '../services/gameService';
import guideService from '../services/guideService';
import useAuth from '../hooks/useAuth';
import GuideCard from '../components/guides/GuideCard'; // Import GuideCard
import reviewService from '../services/reviewService';
import ReviewCard from '../components/common/ReviewCard';
import ReviewForm from '../components/common/ReviewForm';
import { 
    FaArrowLeft,
    FaGamepad, 
    FaStar,
    FaCalendarAlt,
    FaUsers,
    FaBookOpen,
    FaComments,
    FaTrophy,
    FaExternalLinkAlt,
    FaSpinner,
    FaExclamationTriangle,
    FaFilter,
    FaSearch,
    FaPlusCircle
} from 'react-icons/fa';
import '../styles/GameDetailPage.css';
import '../styles/ReviewsSection.css'; // Asumiendo que crearemos este CSS

const GameDetailPage = () => {
    const { gameId } = useParams();
    const navigate = useNavigate();
    const { user, isLoggedIn } = useAuth(); // Usar isLoggedIn
    
    // Estados principales
    const [game, setGame] = useState(null);
    const [posts, setPosts] = useState([]); // TODO: Implementar posts para el juego
    const [guides, setGuides] = useState({ data: [], total: 0 }); 
    const [reviews, setReviews] = useState({ data: [], total: 0 }); // Estado para reseñas
    
    const [isLoadingGame, setIsLoadingGame] = useState(true);
    const [isLoadingPosts, setIsLoadingPosts] = useState(true); // TODO: Implementar posts para el juego
    const [isLoadingGuides, setIsLoadingGuides] = useState(true);
    const [isLoadingReviews, setIsLoadingReviews] = useState(true); // Estado para carga de reseñas
    
    const [error, setError] = useState(null);
    
    // Estados de UI
    const [activeTab, setActiveTab] = useState('overview');
    const [postsFilter, setPostsFilter] = useState('all'); // TODO: Implementar filtros para posts
    const [guidesFilter, setGuidesFilter] = useState('all'); // TODO: Implementar filtros para guías
    const [showReviewForm, setShowReviewForm] = useState(false); // Para mostrar/ocultar formulario de reseña
    const [editingReview, setEditingReview] = useState(null); // Reseña a editar

    // Cargar datos del juego
    useEffect(() => {
        if (gameId) {
            loadGameData();
        }
    }, [gameId]);

    // Cargar guías cuando la pestaña de guías está activa
    useEffect(() => {
        if (gameId && activeTab === 'guides') {
            loadGuidesData();
        }
    }, [gameId, activeTab]);

    // Cargar reseñas cuando la pestaña de reseñas está activa
    useEffect(() => {
        if (gameId && activeTab === 'reviews') {
            loadReviewsData();
        }
    }, [gameId, activeTab]);
    
    const loadGameData = async () => {
        try {
            setIsLoadingGame(true);
            setError(null);
            const gameData = await gameService.getGameById(gameId);
            setGame(gameData?.game || gameData);
        } catch (error) {
            console.error('Error loading game:', error);
            setError('Juego no encontrado');
        } finally {
            setIsLoadingGame(false);
        }
    };

    const loadGuidesData = async () => {
        try {
            setIsLoadingGuides(true);
            const response = await guideService.getGuidesByGameId(gameId);
            setGuides({ data: response.guides || [], total: response.total || 0 }); // Asumiendo que el backend devuelve {guides: [], total: X}
        } catch (error) {
            console.error('Error loading guides:', error);
            // Manejo de error, quizás mostrar un mensaje al usuario
        } finally {
            setIsLoadingGuides(false);
        }
    };

    const loadReviewsData = async () => {
        try {
            setIsLoadingReviews(true);
            const response = await reviewService.getGameReviews(gameId);
            setReviews({ data: response.reviews || [], total: response.pagination?.total || 0 });
        } catch (error) {
            console.error('Error loading reviews:', error);
            // Manejo de error para reseñas
        } finally {
            setIsLoadingReviews(false);
        }
    };

    const handleReviewSubmitted = (newOrUpdatedReview) => {
        if (editingReview) {
            // Actualizar reseña existente en la lista
            setReviews(prev => ({
                ...prev,
                data: prev.data.map(r => r._id === newOrUpdatedReview._id ? newOrUpdatedReview : r)
            }));
            setEditingReview(null);
        } else {
            // Añadir nueva reseña al principio de la lista
            setReviews(prev => ({
                ...prev,
                data: [newOrUpdatedReview, ...prev.data],
                total: prev.total + 1
            }));
        }
        setShowReviewForm(false); // Ocultar formulario después de enviar
    };

    const handleEditReview = (review) => {
        setEditingReview(review);
        setShowReviewForm(true);
    };

    const handleDeleteReview = async (reviewId) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta reseña?')) {
            try {
                await reviewService.deleteReview(reviewId);
                setReviews(prev => ({
                    ...prev,
                    data: prev.data.filter(r => r._id !== reviewId),
                    total: prev.total - 1
                }));
            } catch (error) {
                console.error('Error deleting review:', error);
                alert('No se pudo eliminar la reseña.');
            }
        }
    };

    const handleToggleUseful = async (reviewId) => {
        if (!isLoggedIn) {
            alert('Necesitas iniciar sesión para marcar una reseña como útil.');
            return;
        }
        try {
            const updatedReview = await reviewService.toggleReviewUseful(reviewId);
            setReviews(prev => ({
                ...prev,
                data: prev.data.map(r => r._id === reviewId ? updatedReview : r)
            }));
        } catch (error) {
            console.error('Error toggling useful status:', error);
            alert('No se pudo actualizar el estado de utilidad de la reseña.');
        }
    };

        // Marcar guía como útil
        const handleToggleUsefulGuide = async (guideId) => {
            if (!isLoggedIn) {
                alert('Necesitas iniciar sesión para marcar una guía como útil.');
                return;
            }
            try {
                const updatedGuide = await guideService.toggleUseful(guideId);
                setGuides(prev => ({
                    ...prev,
                    data: prev.data.map(g => g._id === guideId ? updatedGuide : g)
                }));
            } catch (error) {
                console.error('Error toggling useful status for guide:', error);
                alert('No se pudo actualizar el estado de utilidad de la guía.');
            }
        };

    // Loading and error states
    if (isLoadingGame) {
        return (
            <div className="game-detail-page">
                <Header />
                <div className="loading-container">
                    <FaSpinner className="loading-spinner" />
                    <p>Cargando información del juego...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="game-detail-page">
                <Header />
                <div className="error-container">
                    <FaExclamationTriangle className="error-icon" />
                    <p>Error: {error}</p>
                </div>
            </div>
        );
    }

    if (!game) {
        return (
            <div className="game-detail-page">
                <Header />
                <div className="error-container">
                    <FaExclamationTriangle className="error-icon" />
                    <p>No se pudo cargar la información del juego.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="game-detail-page">
            <Header />
            
            {/* Hero Section */}
            <div className="game-hero">
                <img
                    src={game.imageUrl || '/default-game.svg'}
                    alt={game.title || game.name}
                    className="hero-background"
                />
                <div className="hero-overlay"></div>
                
                <div className="hero-content">
                    <img
                        src={game.imageUrl || '/default-game.svg'}
                        alt={game.title || game.name}
                        className="game-poster"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/default-game.svg';
                        }}
                    />
                    
                    <div className="game-main-info">
                        <h1>{game.title || game.name}</h1>
                        
                        {game.description && (
                            <p className="game-tagline">
                                {game.description.substring(0, 120)}
                                {game.description.length > 120 && '...'}
                            </p>
                        )}
                        
                        <div className="game-quick-info">
                            {game.developer && (
                                <div className="quick-info-item">
                                    <FaUsers />
                                    <span><strong>Desarrollador:</strong> {game.developer}</span>
                                </div>
                            )}
                            
                            {game.releaseDate && (
                                <div className="quick-info-item">
                                    <FaCalendarAlt />
                                    <span><strong>Lanzamiento:</strong> {new Date(game.releaseDate).getFullYear()}</span>
                                </div>
                            )}
                            
                            {game.metacriticScore && (
                                <div className="quick-info-item">
                                    <FaStar />
                                    <span><strong>Puntuación:</strong> {game.metacriticScore}/100</span>
                                </div>
                            )}
                        </div>
                        
                        <div className="game-actions">
                            {game.steamUrl && (
                                <a 
                                    href={game.steamUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="action-btn primary"
                                >
                                    <FaExternalLinkAlt /> Ver en Steam
                                </a>
                            )}
                            
                            <button 
                                onClick={() => navigate('/games')} 
                                className="action-btn secondary"
                            >
                                <FaArrowLeft /> Volver al Catálogo
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Game Content */}
            <div className="game-content">
                <div className="content-container">
                    {/* Navigation Tabs */}
                    <div className="game-nav">
                        <button
                            className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
                            onClick={() => setActiveTab('overview')}
                        >
                            <FaGamepad /> Información
                        </button>
                        <button
                            className={`nav-tab ${activeTab === 'reviews' ? 'active' : ''}`}
                            onClick={() => setActiveTab('reviews')}
                        >
                            <FaComments /> Reseñas
                        </button>
                        <button
                            className={`nav-tab ${activeTab === 'guides' ? 'active' : ''}`}
                            onClick={() => setActiveTab('guides')}
                        >
                            <FaBookOpen /> Guías
                        </button>
                    </div>
                    
                    {/* Tab Content */}
                    <div className="tab-content">
                        {activeTab === 'overview' && (
                            <div className="overview-content">
                                <div className="overview-main">
                                    <h2><FaGamepad /> Descripción del Juego</h2>
                                    <p className="game-description">
                                        {game.description || 'No hay descripción disponible para este juego.'}
                                    </p>
                                    
                                    {game.genre && (
                                        <div className="game-features">
                                            <h3>Géneros</h3>
                                            <div className="game-genres-detail">
                                                {Array.isArray(game.genre) ? 
                                                    game.genre.map(genre => (
                                                        <span key={genre} className="genre-tag">
                                                            {genre}
                                                        </span>
                                                    ))
                                                    : <span className="genre-tag">{game.genre}</span>
                                                }
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="overview-sidebar">
                                    <div className="sidebar-section">
                                        <h3><FaStar /> Puntuación</h3>
                                        {game.metacriticScore ? (
                                            <div className="game-score">
                                                <div className={`score-circle ${
                                                    game.metacriticScore >= 80 ? 'high' :
                                                    game.metacriticScore >= 60 ? 'medium' : 'low'
                                                }`}>
                                                    {game.metacriticScore}
                                                </div>
                                                <div className="score-text">Metacritic Score</div>
                                            </div>
                                        ) : (
                                            <p>Sin puntuación disponible</p>
                                        )}
                                    </div>
                                    
                                    <div className="sidebar-section">
                                        <h3><FaCalendarAlt /> Detalles del Juego</h3>
                                        <div className="game-details">
                                            {game.developer && (
                                                <div className="detail-row">
                                                    <span className="detail-label">Desarrollador:</span>
                                                    <span className="detail-value">{game.developer}</span>
                                                </div>
                                            )}
                                            {game.publisher && (
                                                <div className="detail-row">
                                                    <span className="detail-label">Publicador:</span>
                                                    <span className="detail-value">{game.publisher}</span>
                                                </div>
                                            )}
                                            {game.releaseDate && (
                                                <div className="detail-row">
                                                    <span className="detail-label">Fecha de Lanzamiento:</span>
                                                    <span className="detail-value">
                                                        {new Date(game.releaseDate).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {activeTab === 'reviews' && (
                            <div className="reviews-section">
                                <div className="reviews-header">
                                    <h3><FaComments /> Reseñas de la Comunidad ({reviews.total})</h3>
                                    {console.log('🐛 [ReviewsSection] isLoggedIn:', isLoggedIn, 'showReviewForm:', showReviewForm, 'editingReview:', editingReview, 'reviews.data.length:', reviews.data.length)}
                                    {isLoggedIn && !showReviewForm && !editingReview && ( // Usar isLoggedIn
                                        <button onClick={() => setShowReviewForm(true)} className="add-review-btn">
                                            <FaPlusCircle /> Escribir Reseña
                                        </button>
                                    )}
                                </div>
                                
                                {showReviewForm && (
                                    <ReviewForm
                                        gameId={gameId}
                                        existingReview={editingReview}
                                        onReviewSubmitted={handleReviewSubmitted}
                                        onCancel={() => {
                                            setShowReviewForm(false);
                                            setEditingReview(null);
                                        }}
                                    />
                                )}

                                {isLoadingReviews ? (
                                    <div className="loading-state">
                                        <FaSpinner className="spinner" />
                                        <p>Cargando reseñas...</p>
                                    </div>
                                ) : reviews.data.length > 0 ? (
                                    <div className="reviews-list">
                                        {reviews.data.map(review => (
                                            <ReviewCard 
                                                key={review._id} 
                                                review={review} 
                                                onEdit={handleEditReview} 
                                                onDelete={handleDeleteReview}
                                                onToggleUseful={handleToggleUseful}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="empty-state">
                                        <FaComments size={48} />
                                        <p>No hay reseñas disponibles para este juego. ¡Sé el primero en escribir una!</p>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {activeTab === 'guides' && (
                            <div className="guides-content">
                                <h3><FaBookOpen /> Guías y Tutoriales</h3>
                                {isLoadingGuides ? (
                                    <div className="loading-state">
                                        <FaSpinner className="spinner" />
                                        <p>Cargando guías...</p>
                                    </div>
                                ) : guides.data.length > 0 ? (
                                    <div className="guides-list">
                                        {guides.data.map(guide => (
                                            <GuideCard 
                                                key={guide._id || guide.id} 
                                                guide={guide} 
                                                onToggleUseful={handleToggleUsefulGuide} 
                                                isUsefulToggleDisabled={true} 
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="empty-state">
                                        <FaBookOpen size={48} />
                                        <p>No hay guías disponibles para este juego aún.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GameDetailPage;