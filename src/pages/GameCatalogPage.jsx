// src/pages/GameCatalogPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import gameService from '../services/gameService';
import useAuth from '../hooks/useAuth';
import { 
    FaGamepad, 
    FaSearch, 
    FaFilter, 
    FaEye,
    FaTrophy,
    FaStar,
    FaCalendarAlt,
    FaUsers,
    FaBookOpen,
    FaSpinner,
    FaExclamationTriangle
} from 'react-icons/fa';
import '../styles/GameCatalogPage.css';

const GameCatalogPage = () => {
    const navigate = useNavigate();
    const { user, isLoading: authLoading } = useAuth();
    
    // Estados principales
    const [games, setGames] = useState([]);
    const [filteredGames, setFilteredGames] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Estados de filtros y búsqueda
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('all');
    const [selectedPlatform, setSelectedPlatform] = useState('all');
    const [sortBy, setSortBy] = useState('name'); // name, releaseDate, rating
    const [sortOrder, setSortOrder] = useState('asc'); // asc, desc
    
    // Estados de UI
    const [currentPage, setCurrentPage] = useState(1);
    const [gamesPerPage] = useState(12);
    
    // Verificar autenticación
    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
        }
    }, [authLoading, user, navigate]);
    
    // Cargar juegos al montar
    useEffect(() => {
        loadGames();
    }, []);
    
    // Aplicar filtros cuando cambien los criterios
    useEffect(() => {
        applyFilters();
    }, [games, searchTerm, selectedGenre, selectedPlatform, sortBy, sortOrder]);
    
    const loadGames = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await gameService.getGames();
            const gamesList = response?.games || response?.data || response || [];
            setGames(gamesList);
        } catch (error) {
            console.error('Error loading games:', error);
            setError('Error al cargar el catálogo de juegos');
        } finally {
            setIsLoading(false);
        }
    };
    
    const applyFilters = () => {
        let filtered = [...games];
        
        // Filtro de búsqueda
        if (searchTerm) {
            filtered = filtered.filter(game =>
                (game.title || game.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (game.developer || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (game.description || '').toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        // Filtro por género
        if (selectedGenre !== 'all') {
            filtered = filtered.filter(game => {
                if (Array.isArray(game.genre)) {
                    return game.genre.includes(selectedGenre);
                }
                return game.genre === selectedGenre;
            });
        }
        
        // Filtro por plataforma
        if (selectedPlatform !== 'all') {
            filtered = filtered.filter(game => {
                if (Array.isArray(game.platforms)) {
                    return game.platforms.includes(selectedPlatform);
                }
                return game.platform === selectedPlatform;
            });
        }
        
        // Ordenamiento
        filtered.sort((a, b) => {
            let valueA, valueB;
            
            switch (sortBy) {
                case 'releaseDate':
                    valueA = new Date(a.releaseDate || 0);
                    valueB = new Date(b.releaseDate || 0);
                    break;
                case 'rating':
                    valueA = a.metacriticScore || 0;
                    valueB = b.metacriticScore || 0;
                    break;
                case 'featured':
                    valueA = a.featured ? 1 : 0;
                    valueB = b.featured ? 1 : 0;
                    break;
                default: // name
                    valueA = (a.title || a.name || '').toLowerCase();
                    valueB = (b.title || b.name || '').toLowerCase();
            }
            
            if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
            if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
        
        setFilteredGames(filtered);
        setCurrentPage(1); // Reset a primera página cuando cambian filtros
    };
    
    // Obtener géneros únicos
    const getUniqueGenres = () => {
        const genres = new Set();
        games.forEach(game => {
            if (Array.isArray(game.genre)) {
                game.genre.forEach(g => genres.add(g));
            } else if (game.genre) {
                genres.add(game.genre);
            }
        });
        return Array.from(genres).sort();
    };
    
    // Obtener plataformas únicas
    const getUniquePlatforms = () => {
        const platforms = new Set();
        games.forEach(game => {
            if (Array.isArray(game.platforms)) {
                game.platforms.forEach(p => platforms.add(p));
            } else if (game.platform) {
                platforms.add(game.platform);
            }
        });
        return Array.from(platforms).sort();
    };
    
    // Paginación
    const indexOfLastGame = currentPage * gamesPerPage;
    const indexOfFirstGame = indexOfLastGame - gamesPerPage;
    const currentGames = filteredGames.slice(indexOfFirstGame, indexOfLastGame);
    const totalPages = Math.ceil(filteredGames.length / gamesPerPage);
    
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    const handleGameClick = (gameId) => {
        navigate(`/games/${gameId}`);
    };
    
    const clearFilters = () => {
        setSearchTerm('');
        setSelectedGenre('all');
        setSelectedPlatform('all');
        setSortBy('name');
        setSortOrder('asc');
    };
    
    // Loading de autenticación
    if (authLoading) {
        return (
            <div className="loading-page">
                <div className="loading-spinner"></div>
                <p>Cargando...</p>
            </div>
        );
    }
    
    return (
        <div className="game-catalog-page">
            <Header />
            
            <div className="catalog-container">
                {/* Header del Catálogo */}
                <div className="catalog-header">
                    <div className="header-content">
                        <h1>
                            <FaGamepad /> Catálogo de Videojuegos
                        </h1>
                        <p>Explora nuestra colección completa de videojuegos</p>
                        <div className="catalog-stats">
                            <span className="stat">
                                <FaGamepad /> {filteredGames.length} Juegos
                            </span>
                            <span className="stat">
                                <FaTrophy /> {games.filter(g => g.featured).length} Destacados
                            </span>
                        </div>
                    </div>
                </div>
                
                {/* Filtros y Búsqueda */}
                <div className="catalog-controls">
                    <div className="search-section">
                        <div className="search-box">
                            <FaSearch />
                            <input
                                type="text"
                                placeholder="Buscar juegos por título, desarrollador o descripción..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <div className="filters-section">
                        <div className="filter-group">
                            <label>Género:</label>
                            <select
                                value={selectedGenre}
                                onChange={(e) => setSelectedGenre(e.target.value)}
                            >
                                <option value="all">Todos los géneros</option>
                                {getUniqueGenres().map(genre => (
                                    <option key={genre} value={genre}>{genre}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="filter-group">
                            <label>Plataforma:</label>
                            <select
                                value={selectedPlatform}
                                onChange={(e) => setSelectedPlatform(e.target.value)}
                            >
                                <option value="all">Todas las plataformas</option>
                                {getUniquePlatforms().map(platform => (
                                    <option key={platform} value={platform}>{platform}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="filter-group">
                            <label>Ordenar por:</label>
                            <select
                                value={`${sortBy}-${sortOrder}`}
                                onChange={(e) => {
                                    const [sort, order] = e.target.value.split('-');
                                    setSortBy(sort);
                                    setSortOrder(order);
                                }}
                            >
                                <option value="name-asc">Nombre (A-Z)</option>
                                <option value="name-desc">Nombre (Z-A)</option>
                                <option value="releaseDate-desc">Más recientes</option>
                                <option value="releaseDate-asc">Más antiguos</option>
                                <option value="rating-desc">Mayor puntuación</option>
                                <option value="rating-asc">Menor puntuación</option>
                                <option value="featured-desc">Destacados primero</option>
                            </select>
                        </div>
                        
                        <button className="clear-filters-btn" onClick={clearFilters}>
                            <FaFilter /> Limpiar Filtros
                        </button>
                    </div>
                </div>
                
                {/* Contenido Principal */}
                <div className="catalog-content">
                    {isLoading ? (
                        <div className="loading-state">
                            <FaSpinner className="spinner" />
                            <p>Cargando catálogo...</p>
                        </div>
                    ) : error ? (
                        <div className="error-state">
                            <FaExclamationTriangle />
                            <h3>Error al cargar el catálogo</h3>
                            <p>{error}</p>
                            <button onClick={loadGames} className="retry-btn">
                                Reintentar
                            </button>
                        </div>
                    ) : filteredGames.length === 0 ? (
                        <div className="empty-state">
                            <FaGamepad size={64} />
                            <h3>No se encontraron juegos</h3>
                            <p>Intenta ajustar tus filtros de búsqueda</p>
                            <button onClick={clearFilters} className="clear-btn">
                                Limpiar Filtros
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Grid de Juegos */}
                            <div className="games-grid">
                                {currentGames.map(game => (
                                    <div 
                                        key={game._id || game.id} 
                                        className="game-card"
                                        onClick={() => handleGameClick(game._id || game.id)}
                                    >
                                        <div className="game-image">
                                            <img
                                                src={game.imageUrl || '/default-game.svg'}
                                                alt={game.title || game.name}
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = '/default-game.svg';
                                                }}
                                            />
                                            {game.featured && (
                                                <div className="featured-badge">
                                                    <FaTrophy /> Destacado
                                                </div>
                                            )}
                                            <div className="game-overlay">
                                                <button 
                                                    className="view-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleGameClick(game._id || game.id);
                                                    }}
                                                >
                                                    <FaEye /> Ver Detalles
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="game-info">
                                            <h3 className="game-title">
                                                {game.title || game.name}
                                            </h3>
                                            
                                            <div className="game-meta">
                                                <span className="developer">
                                                    {game.developer}
                                                </span>
                                                {game.releaseDate && (
                                                    <span className="release-year">
                                                        <FaCalendarAlt />
                                                        {new Date(game.releaseDate).getFullYear()}
                                                    </span>
                                                )}
                                            </div>
                                            
                                            <div className="game-genres">
                                                {Array.isArray(game.genre) ? 
                                                    game.genre.slice(0, 2).map(genre => (
                                                        <span key={genre} className="genre-tag">
                                                            {genre}
                                                        </span>
                                                    ))
                                                    : game.genre && (
                                                        <span className="genre-tag">
                                                            {game.genre}
                                                        </span>
                                                    )
                                                }
                                            </div>
                                            
                                            {game.description && (
                                                <p className="game-description">
                                                    {game.description.substring(0, 100)}
                                                    {game.description.length > 100 && '...'}
                                                </p>
                                            )}
                                            
                                            <div className="game-footer">
                                                {game.metacriticScore && (
                                                    <div className={`score-badge ${
                                                        game.metacriticScore >= 80 ? 'high' :
                                                        game.metacriticScore >= 60 ? 'medium' : 'low'
                                                    }`}>
                                                        <FaStar /> {game.metacriticScore}
                                                    </div>
                                                )}
                                                
                                                <div className="game-stats">
                                                    <span title="Reseñas">
                                                        <FaUsers /> {game.reviewsCount || 0}
                                                    </span>
                                                    <span title="Guías">
                                                        <FaBookOpen /> {game.guidesCount || 0}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Paginación */}
                            {totalPages > 1 && (
                                <div className="pagination">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="page-btn"
                                    >
                                        Anterior
                                    </button>
                                    
                                    <div className="page-numbers">
                                        {[...Array(totalPages)].map((_, index) => {
                                            const pageNumber = index + 1;
                                            const isNearCurrent = Math.abs(pageNumber - currentPage) <= 2;
                                            const isFirstOrLast = pageNumber === 1 || pageNumber === totalPages;
                                            
                                            if (isNearCurrent || isFirstOrLast) {
                                                return (
                                                    <button
                                                        key={pageNumber}
                                                        onClick={() => handlePageChange(pageNumber)}
                                                        className={`page-number ${currentPage === pageNumber ? 'active' : ''}`}
                                                    >
                                                        {pageNumber}
                                                    </button>
                                                );
                                            } else if (
                                                pageNumber === currentPage - 3 || 
                                                pageNumber === currentPage + 3
                                            ) {
                                                return <span key={pageNumber} className="ellipsis">...</span>;
                                            }
                                            return null;
                                        })}
                                    </div>
                                    
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="page-btn"
                                    >
                                        Siguiente
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GameCatalogPage;