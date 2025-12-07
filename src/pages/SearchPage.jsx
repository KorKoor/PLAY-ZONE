// src/pages/SearchPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { 
    FaSearch, 
    FaFilter, 
    FaUser, 
    FaGamepad, 
    FaFileAlt, 
    FaBookOpen,
    FaSpinner,
    FaTimes,
    FaSort,
    FaChevronDown,
    FaEye,
    FaHeart,
    FaComment,
    FaCalendarAlt,
    FaStar,
    FaUsers,
    FaPlay
} from 'react-icons/fa';
import Header from '../components/layout/Header';
import useSearch from '../hooks/useSearch';
import useAuth from '../hooks/useAuth';
import '../styles/SearchPage.css';

const SearchPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const {
        results,
        loading,
        error,
        pagination,
        filters,
        searchQuery,
        availableFilters,
        performSearch,
        loadMore,
        applyFilters,
        clearResults,
        setSearchQuery,
        getTotalResults,
        searchSources
    } = useSearch();

    // Estados locales para la UI
    const [activeTab, setActiveTab] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [localSearchTerm, setLocalSearchTerm] = useState('');

    // Extraer query de la URL al cargar
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const query = urlParams.get('q') || '';
        const type = urlParams.get('type') || 'all';
        
        if (query) {
            setLocalSearchTerm(query);
            setSearchQuery(query);
            setActiveTab(type);
            applyFilters({ type });
            performSearch(query, { type });
        }
    }, [location.search]);

    // Manejar envío del formulario de búsqueda
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (localSearchTerm.trim()) {
            setSearchQuery(localSearchTerm);
            performSearch(localSearchTerm, { type: activeTab });
            // Actualizar URL sin recargar la página
            navigate(`/search?q=${encodeURIComponent(localSearchTerm)}&type=${activeTab}`, { replace: true });
        }
    };

    // Cambiar pestaña/tipo de búsqueda
    const handleTabChange = (newType) => {
        setActiveTab(newType);
        applyFilters({ type: newType });
        if (searchQuery) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}&type=${newType}`, { replace: true });
        }
    };

    // Limpiar búsqueda
    const handleClearSearch = () => {
        setLocalSearchTerm('');
        clearResults();
        navigate('/search', { replace: true });
    };

    // Aplicar filtro específico
    const handleFilterChange = (filterType, value) => {
        applyFilters({ [filterType]: value });
    };

    // Cargar más resultados para un tipo específico
    const handleLoadMore = (type) => {
        loadMore(type);
    };

    // Obtener conteo de resultados por tipo
    const getResultCount = (type) => {
        if (type === 'all') return getTotalResults();
        return pagination[type]?.total || 0;
    };

    // Render del encabezado de búsqueda
    const SearchHeader = () => (
        <div className="search-header">
            <form onSubmit={handleSearchSubmit} className="search-form">
                <div className="search-input-group">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar juegos, usuarios, publicaciones, guías..."
                        value={localSearchTerm}
                        onChange={(e) => setLocalSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    {localSearchTerm && (
                        <button 
                            type="button" 
                            onClick={handleClearSearch}
                            className="clear-search-btn"
                        >
                            <FaTimes />
                        </button>
                    )}
                </div>
                <button type="submit" className="search-submit-btn">
                    Buscar
                </button>
            </form>

            <div className="search-stats">
                {searchQuery && (
                    <p className="search-query-info">
                        Resultados para: <span className="query-text">"{searchQuery}"</span>
                        {getTotalResults() > 0 && (
                            <span className="result-count"> ({getTotalResults()} encontrados)</span>
                        )}
                    </p>
                )}
            </div>
        </div>
    );

    // Render de las pestañas de tipos
    const SearchTabs = () => {
        const tabs = [
            { key: 'all', label: 'Todo', icon: FaSearch, count: getTotalResults() },
            { key: 'users', label: 'Usuarios', icon: FaUser, count: getResultCount('users') },
            { key: 'games', label: 'Juegos', icon: FaGamepad, count: getResultCount('games') },
            { key: 'posts', label: 'Publicaciones', icon: FaFileAlt, count: getResultCount('posts') },
            { key: 'guides', label: 'Guías', icon: FaBookOpen, count: getResultCount('guides') }
        ];

        return (
            <div className="search-tabs">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => handleTabChange(tab.key)}
                            className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                        >
                            <Icon />
                            <span className="tab-label">{tab.label}</span>
                            {tab.count > 0 && (
                                <span className="tab-count">({tab.count})</span>
                            )}
                        </button>
                    );
                })}
            </div>
        );
    };

    // Render del panel de filtros
    const FiltersPanel = () => (
        <div className={`filters-panel ${showFilters ? 'show' : ''}`}>
            <div className="filters-header">
                <h3><FaFilter /> Filtros</h3>
                <button 
                    onClick={() => setShowFilters(false)}
                    className="close-filters-btn"
                >
                    <FaTimes />
                </button>
            </div>

            <div className="filters-content">
                {/* Ordenamiento */}
                <div className="filter-group">
                    <label>Ordenar por:</label>
                    <select 
                        value={`${filters.sortBy}-${filters.sortOrder}`}
                        onChange={(e) => {
                            const [sortBy, sortOrder] = e.target.value.split('-');
                            applyFilters({ sortBy, sortOrder });
                        }}
                    >
                        <option value="relevance-desc">Relevancia</option>
                        <option value="date-desc">Más recientes</option>
                        <option value="date-asc">Más antiguos</option>
                        <option value="name-asc">Nombre (A-Z)</option>
                        <option value="name-desc">Nombre (Z-A)</option>
                    </select>
                </div>

                {/* Filtros específicos por tipo */}
                {(activeTab === 'all' || activeTab === 'guides') && (
                    <>
                        {availableFilters.categories.length > 0 && (
                            <div className="filter-group">
                                <label>Categoría:</label>
                                <select 
                                    value={filters.category}
                                    onChange={(e) => handleFilterChange('category', e.target.value)}
                                >
                                    <option value="">Todas las categorías</option>
                                    {availableFilters.categories.map(cat => (
                                        <option key={cat.id || cat} value={cat.id || cat}>
                                            {cat.name || cat}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {availableFilters.difficulties.length > 0 && (
                            <div className="filter-group">
                                <label>Dificultad:</label>
                                <select 
                                    value={filters.difficulty}
                                    onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                                >
                                    <option value="">Todas las dificultades</option>
                                    {availableFilters.difficulties.map(diff => (
                                        <option key={diff.id || diff} value={diff.id || diff}>
                                            {diff.name || diff}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </>
                )}

                {(activeTab === 'all' || activeTab === 'games') && (
                    <>
                        {availableFilters.genres.length > 0 && (
                            <div className="filter-group">
                                <label>Género:</label>
                                <select 
                                    value={filters.genre}
                                    onChange={(e) => handleFilterChange('genre', e.target.value)}
                                >
                                    <option value="">Todos los géneros</option>
                                    {availableFilters.genres.map(genre => (
                                        <option key={genre.id || genre} value={genre.id || genre}>
                                            {genre.name || genre}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </>
                )}

                {/* Botón para limpiar filtros */}
                <div className="filter-actions">
                    <button 
                        onClick={() => applyFilters({
                            sortBy: 'relevance',
                            sortOrder: 'desc',
                            category: '',
                            difficulty: '',
                            genre: ''
                        })}
                        className="clear-filters-btn"
                    >
                        Limpiar Filtros
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="search-page">
            <Header />
            
            <main className="search-main">
                <div className="search-container">
                    <SearchHeader />
                    
                    {searchQuery && (
                        <>
                            <div className="search-controls">
                                <SearchTabs />
                                
                                <div className="search-actions">
                                    <button 
                                        onClick={() => setShowFilters(!showFilters)}
                                        className={`filters-toggle-btn ${showFilters ? 'active' : ''}`}
                                    >
                                        <FaFilter /> Filtros
                                        <FaChevronDown className={`chevron ${showFilters ? 'rotate' : ''}`} />
                                    </button>
                                </div>
                            </div>

                            <FiltersPanel />

                            <div className="search-results">
                                {/* Debug info - TEMPORAL */}
                                {process.env.NODE_ENV === 'development' && (
                                    <div style={{ 
                                        background: '#e8f4f8', 
                                        border: '1px solid #bce8f1',
                                        padding: '15px', 
                                        margin: '10px 0', 
                                        borderRadius: '4px',
                                        fontSize: '13px',
                                        fontFamily: 'monospace'
                                    }}>
                                        <strong>🐛 Debug Info:</strong><br/>
                                        <strong>Query:</strong> "{searchQuery}" | <strong>Tab:</strong> {activeTab} | <strong>Loading:</strong> {loading ? 'Sí' : 'No'}<br/>
                                        <strong>Resultados:</strong> Users({results.users?.length || 0}) | Games({results.games?.length || 0}) | Posts({results.posts?.length || 0}) | Guides({results.guides?.length || 0})<br/>
                                        <strong>Error:</strong> {error || 'Ninguno'} | <strong>Total:</strong> {getTotalResults()}<br/>
                                        <strong>Filtros:</strong> {JSON.stringify(filters)}<br/>
                                        <strong>Fuentes:</strong> Users({searchSources.users}) | Games({searchSources.games}) | Posts({searchSources.posts}) | Guides({searchSources.guides})
                                    </div>
                                )}

                                {loading && (
                                    <div className="loading-state">
                                        <FaSpinner className="spinner" />
                                        <p>Buscando...</p>
                                    </div>
                                )}

                                {error && (
                                    <div className="error-state">
                                        <p>{error}</p>
                                        <button 
                                            onClick={() => performSearch(searchQuery, filters)}
                                            className="retry-btn"
                                        >
                                            Reintentar
                                        </button>
                                    </div>
                                )}

                                {!loading && !error && getTotalResults() === 0 && searchQuery && (
                                    <div className="no-results-state">
                                        <FaSearch size={48} />
                                        <h3>No se encontraron resultados</h3>
                                        <p>Intenta con otros términos de búsqueda o ajusta los filtros.</p>
                                    </div>
                                )}

                                {/* Aquí irán los componentes de resultados */}
                                <SearchResults 
                                    results={results}
                                    activeTab={activeTab}
                                    pagination={pagination}
                                    onLoadMore={handleLoadMore}
                                    loading={loading}
                                    searchTerm={searchQuery}
                                />
                            </div>
                        </>
                    )}

                    {!searchQuery && (
                        <div className="search-welcome">
                            <div className="welcome-content">
                                <FaSearch size={64} />
                                <h2>Búsqueda Global de PLAY-ZONE</h2>
                                <p>Encuentra juegos, usuarios, publicaciones y guías en un solo lugar</p>
                                
                                <div className="search-tips">
                                    <h3>Consejos de búsqueda:</h3>
                                    <ul>
                                        <li>Usa palabras clave específicas</li>
                                        <li>Puedes buscar por nombre de usuario, título de juego o contenido</li>
                                        <li>Utiliza los filtros para refinar tus resultados</li>
                                        <li>Explora por categorías para descubrir contenido nuevo</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

// Componente para mostrar los resultados
const SearchResults = ({ results, activeTab, pagination, onLoadMore, loading, searchTerm }) => {
    const navigate = useNavigate();

    // Componente para tarjeta de usuario
    const UserCard = ({ user }) => {
        console.log('🐛 [UserCard] Objeto user:', user);
        console.log('🐛 [UserCard] Avatar del usuario:', user.avatar);
        return (
            <div className="result-card user-card" onClick={() => navigate(`/profile/${user._id || user.id}`)}>
                <div className="user-avatar">
                    <img 
                        src={user.avatar || '/default-avatar.png'} 
                        alt={user.alias || user.name}
                        onError={(e) => { e.target.src = '/default-avatar.png'; }}
                    />
                </div>
                <div className="user-info">
                    <h3 className="user-name">{user.alias || user.name}</h3>
                    <p className="user-email">{user.email}</p>
                    {user.bio && <p className="user-bio">{user.bio}</p>}
                    <div className="user-stats">
                        <span><FaUsers /> {user.followersCount || 0} seguidores</span>
                        <span><FaFileAlt /> {user.postsCount || 0} posts</span>
                    </div>
                </div>
            </div>
        );
    };

    // Componente para tarjeta de juego
    const GameCard = ({ game }) => {
        console.log('🐛 [GameCard] Objeto game:', game);
        console.log('🐛 [GameCard] Imagen de portada del juego:', game.coverImage);
        return (
            <div className="result-card game-card" onClick={() => navigate(`/games/${game._id || game.id}`)}>
                <div className="game-image">
                    <img 
                        src={game.imageUrl || '/default-game.png'} 
                        alt={game.title || game.name}
                        onError={(e) => { e.target.src = '/default-game.png'; }}
                    />
                    {game.featured && <span className="featured-badge">Destacado</span>}
                </div>
                <div className="game-info">
                    <h3 className="game-title">{game.title || game.name}</h3>
                    <p className="game-developer">{game.developer}</p>
                    <div className="game-genre">
                        {Array.isArray(game.genre) ? game.genre.join(', ') : game.genre}
                    </div>
                    <div className="game-stats">
                        <span><FaStar /> {game.rating || 'N/A'}</span>
                        <span><FaCalendarAlt /> {game.releaseDate ? new Date(game.releaseDate).getFullYear() : 'TBD'}</span>
                    </div>
                </div>
            </div>
        );
    };

    // Componente para tarjeta de post
    const PostCard = ({ post }) => {
        console.log('🐛 [PostCard] Objeto post:', post);
        console.log('🐛 [PostCard] Avatar del autor:', post.author?.avatar);
        return (
            <div className="result-card post-card" onClick={() => navigate(`/posts/${post._id || post.id}`)}>
                <div className="post-header">
                    <div className="post-author">
                                            <img 
                                                src={post.authorId?.avatarUrl || '/default-avatar.png'} 
                                                alt={post.authorId?.alias || post.authorId?.name}
                                                className="author-avatar"
                                                onError={(e) => { e.target.src = '/default-avatar.png'; }}
                                            />
                                            <span className="author-name">{post.authorId?.alias || post.authorId?.name}</span>
                                        </div>                    <span className="post-date">
                        <FaCalendarAlt /> {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                </div>
                <div className="post-content">
                    <h3 className="post-title">{post.title}</h3>
                    <p className="post-excerpt">{post.content?.substring(0, 150)}...</p>
                    {post.gameId && (
                        <div className="post-game">
                            <FaGamepad /> {post.gameId.title || post.gameId.name}
                        </div>
                    )}
                </div>
                <div className="post-stats">
                    <span><FaHeart /> {post.likes?.length || 0}</span>
                    <span><FaComment /> {post.commentsCount || 0}</span>
                    <span><FaEye /> {post.views || 0}</span>
                </div>
            </div>
        );
    };

    // Componente para tarjeta de guía
    const GuideCard = ({ guide }) => {
        console.log('🐛 [GuideCard] Objeto guide:', guide);
        console.log('🐛 [GuideCard] Avatar del autor:', guide.author?.avatar);
        return (
            <div className="result-card guide-card" onClick={() => navigate(`/guides/${guide._id || guide.id}`)}>
                <div className="guide-header">
                    <h3 className="guide-title">{guide.title}</h3>
                    <div className="guide-meta">
                        <span className="guide-category">{guide.category}</span>
                        <span className="guide-difficulty">{guide.difficulty}</span>
                    </div>
                </div>
                <div className="guide-content">
                    <p className="guide-description">{guide.description?.substring(0, 150)}...</p>
                    <div className="guide-author">
                                            <img 
                                                src={guide.authorId?.avatarUrl || '/default-avatar.png'} 
                                                alt={guide.authorId?.alias || guide.authorId?.name}
                                                className="author-avatar"
                                                onError={(e) => { e.target.src = '/default-avatar.png'; }}
                                            />
                                            <span className="author-name">por {guide.authorId?.alias || guide.authorId?.name}</span>
                                        </div>                </div>
                <div className="guide-stats">
                    <span><FaEye /> {guide.views || 0}</span>
                    <span><FaHeart /> {guide.helpful?.length || 0}</span>
                    <span><FaCalendarAlt /> {new Date(guide.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
        );
    };

    // Componente para botón "Cargar más"
    const LoadMoreButton = ({ type, hasMore, onLoadMore, loading }) => {
        if (!hasMore) return null;
        
        return (
            <div className="load-more-container">
                <button 
                    onClick={() => onLoadMore(type)}
                    disabled={loading}
                    className="load-more-btn"
                >
                    {loading ? (
                        <>
                            <FaSpinner className="spinner" /> Cargando...
                        </>
                    ) : (
                        'Cargar más resultados'
                    )}
                </button>
            </div>
        );
    };

    // Renderizar sección por tipo
    const renderResultSection = (type, title, results, icon) => {
        if (activeTab !== 'all' && activeTab !== type) return null;
        if (!results || results.length === 0) return null;

        const Icon = icon;
        return (
            <div className="results-section" key={type}>
                {activeTab === 'all' && (
                    <div className="section-header">
                        <h2>
                            <Icon /> {title} 
                            <span className="section-count">({pagination[type]?.total || 0})</span>
                        </h2>
                        {results.length > 0 && (
                            <button 
                                onClick={() => navigate(`/search?q=${encodeURIComponent(searchTerm || '')}&type=${type}`)}
                                className="view-all-btn"
                            >
                                Ver todos
                            </button>
                        )}
                    </div>
                )}

                <div className={`results-grid ${type}-grid`}>
                    {results.map((item, index) => {
                        console.log(`🐛 [SearchResults] Item para ${type}:`, item); // Nuevo log de depuración
                        switch (type) {
                            case 'users':
                                return <UserCard key={item._id || item.id || index} user={item} />;
                            case 'games':
                                return <GameCard key={item._id || item.id || index} game={item} />;
                            case 'posts':
                                return <PostCard key={item._id || item.id || index} post={item} />;
                            case 'guides':
                                return <GuideCard key={item._id || item.id || index} guide={item} />;
                            default:
                                return null;
                        }
                    })}
                </div>

                {activeTab === type && (
                    <LoadMoreButton 
                        type={type}
                        hasMore={pagination[type]?.hasMore}
                        onLoadMore={onLoadMore}
                        loading={loading}
                    />
                )}
            </div>
        );
    };

    return (
        <div className="search-results-container">
            {renderResultSection('users', 'Usuarios', results.users, FaUser)}
            {renderResultSection('games', 'Juegos', results.games, FaGamepad)}
            {renderResultSection('posts', 'Publicaciones', results.posts, FaFileAlt)}
            {renderResultSection('guides', 'Guías', results.guides, FaBookOpen)}
        </div>
    );
};

export default SearchPage;