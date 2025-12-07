// src/pages/CommunityPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import userService from '../services/userService';
import gameService from '../services/gameService';
import useAuth from '../hooks/useAuth';
import { 
    FaUsers, 
    FaGamepad, 
    FaSearch, 
    FaUserCircle, 
    FaBookOpen, 
    FaHeart, 
    FaComments,
    FaTrophy,
    FaChartLine,
    FaEye,
    FaFilter
} from 'react-icons/fa';
import '../styles/CommunityPage.css';

const CommunityPage = () => {
    const navigate = useNavigate();
    const { user, isLoading: authLoading } = useAuth();
    
    // Si no está autenticado, redirigir
    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
        }
    }, [authLoading, user, navigate]);
    
    // Estados para usuarios
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [usersLoading, setUsersLoading] = useState(true);
    const [usersError, setUsersError] = useState(null);
    
    // Estados para juegos
    const [games, setGames] = useState([]);
    const [filteredGames, setFilteredGames] = useState([]);
    const [gameSearchTerm, setGameSearchTerm] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('all');
    const [gamesLoading, setGamesLoading] = useState(true);
    const [gamesError, setGamesError] = useState(null);
    
    // Estados para estadísticas
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalGames: 0,
        totalPosts: 0,
        totalGuides: 0,
        activeUsers: 0
    });
    
    // Estados de UI
    const [activeTab, setActiveTab] = useState('overview');
    
    useEffect(() => {
        loadCommunityData();
    }, []);
    
    const loadCommunityData = async () => {
        await Promise.all([
            loadUsers(),
            loadGames(),
            loadStats()
        ]);
    };
    
    const loadUsers = async () => {
        try {
            setUsersLoading(true);
            // Intentar getAllUsers primero, fallback a getUsers
            let response;
            try {
                response = await userService.getAllUsers();
            } catch {
                response = await userService.getUsers();
            }
            const usersList = response?.users || response?.data || response || [];
            setUsers(usersList);
            setFilteredUsers(usersList);
            setUsersError(null);
        } catch (error) {
            console.error('Error loading users:', error);
            setUsersError('Error al cargar usuarios');
        } finally {
            setUsersLoading(false);
        }
    };
    
    const loadGames = async () => {
        try {
            setGamesLoading(true);
            const response = await gameService.getGames();
            const gamesList = response?.games || response?.data || response || [];
            setGames(gamesList);
            setFilteredGames(gamesList);
            setGamesError(null);
        } catch (error) {
            console.error('Error loading games:', error);
            setGamesError('Error al cargar juegos');
        } finally {
            setGamesLoading(false);
        }
    };
    
    const loadStats = async () => {
        try {
            // Calculamos estadísticas basadas en los datos cargados
            setStats({
                totalUsers: users.length,
                totalGames: games.length,
                totalPosts: users.reduce((sum, user) => sum + (user.postsCount || 0), 0),
                totalGuides: users.reduce((sum, user) => sum + (user.guidesCount || 0), 0),
                activeUsers: users.filter(user => user.postsCount > 0 || user.guidesCount > 0).length
            });
        } catch (error) {
            console.error('Error calculating stats:', error);
        }
    };
    
    // Efectos para filtros
    useEffect(() => {
        const filtered = users.filter(user =>
            user.alias?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
            user.name?.toLowerCase().includes(userSearchTerm.toLowerCase())
        );
        setFilteredUsers(filtered);
    }, [userSearchTerm, users]);
    
    useEffect(() => {
        let filtered = games.filter(game =>
            game.title?.toLowerCase().includes(gameSearchTerm.toLowerCase()) ||
            game.name?.toLowerCase().includes(gameSearchTerm.toLowerCase())
        );
        
        if (selectedGenre !== 'all') {
            filtered = filtered.filter(game => 
                Array.isArray(game.genre) 
                    ? game.genre.includes(selectedGenre)
                    : game.genre === selectedGenre
            );
        }
        
        setFilteredGames(filtered);
    }, [gameSearchTerm, selectedGenre, games]);
    
    // Actualizar stats cuando cambien los datos
    useEffect(() => {
        loadStats();
    }, [users, games]);
    
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
    
    const navigateToProfile = (userId) => {
        navigate(`/profile/${userId}`);
    };
    
    const navigateToGame = (gameId) => {
        navigate(`/games/${gameId}`);
    };
    
    const StatsOverview = () => (
        <div className="community-stats">
            <div className="stats-grid">
                <div className="stat-card users">
                    <div className="stat-icon">
                        <FaUsers />
                    </div>
                    <div className="stat-content">
                        <div className="stat-number">{stats.totalUsers}</div>
                        <div className="stat-label">Usuarios Registrados</div>
                    </div>
                </div>
                
                <div className="stat-card games">
                    <div className="stat-icon">
                        <FaGamepad />
                    </div>
                    <div className="stat-content">
                        <div className="stat-number">{stats.totalGames}</div>
                        <div className="stat-label">Juegos en Catálogo</div>
                    </div>
                </div>
                
                <div className="stat-card posts">
                    <div className="stat-icon">
                        <FaComments />
                    </div>
                    <div className="stat-content">
                        <div className="stat-number">{stats.totalPosts}</div>
                        <div className="stat-label">Publicaciones</div>
                    </div>
                </div>
                
                <div className="stat-card guides">
                    <div className="stat-icon">
                        <FaBookOpen />
                    </div>
                    <div className="stat-content">
                        <div className="stat-number">{stats.totalGuides}</div>
                        <div className="stat-label">Guías Creadas</div>
                    </div>
                </div>
                
                <div className="stat-card active">
                    <div className="stat-icon">
                        <FaChartLine />
                    </div>
                    <div className="stat-content">
                        <div className="stat-number">{stats.activeUsers}</div>
                        <div className="stat-label">Usuarios Activos</div>
                    </div>
                </div>
            </div>
        </div>
    );
    
    const UsersSection = () => (
        <div className="community-section">
            <div className="section-header">
                <h3><FaUsers /> Explorar Usuarios ({filteredUsers.length})</h3>
                <div className="search-box">
                    <FaSearch />
                    <input
                        type="text"
                        placeholder="Buscar usuarios por alias o nombre..."
                        value={userSearchTerm}
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            
            {usersLoading ? (
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Cargando usuarios...</p>
                </div>
            ) : usersError ? (
                <div className="error-state">
                    <p>{usersError}</p>
                </div>
            ) : filteredUsers.length === 0 ? (
                <div className="empty-state">
                    <FaUserCircle size={48} />
                    <p>No se encontraron usuarios</p>
                </div>
            ) : (
                <div className="users-grid">
                    {filteredUsers.map(user => (
                        <div key={user._id || user.id} className="user-card">
                            <div className="user-avatar-container">
                                <img
                                    src={user.avatarUrl || '/default-avatar.svg'}
                                    alt={user.alias}
                                    className="user-avatar"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = '/default-avatar.svg';
                                    }}
                                />
                                {user.role === 'admin' && (
                                    <div className="admin-badge">
                                        <FaTrophy />
                                    </div>
                                )}
                            </div>
                            
                            <div className="user-info">
                                <h4 className="user-alias">@{user.alias}</h4>
                                <p className="user-name">{user.name || 'Sin nombre'}</p>
                                
                                <div className="user-stats">
                                    <span><FaComments /> {user.postsCount || 0}</span>
                                    <span><FaBookOpen /> {user.guidesCount || 0}</span>
                                    <span><FaHeart /> {user.favoritesCount || 0}</span>
                                </div>
                                
                                {user.description && (
                                    <p className="user-bio">{user.description.substring(0, 80)}...</p>
                                )}
                            </div>
                            
                            <div className="user-actions">
                                <button
                                    onClick={() => navigateToProfile(user._id || user.id)}
                                    className="btn btn-primary"
                                >
                                    <FaEye /> Ver Perfil
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
    
    const GamesSection = () => (
        <div className="community-section">
            <div className="section-header">
                <h3><FaGamepad /> Catálogo de Juegos ({filteredGames.length})</h3>
                <div className="games-filters">
                    <div className="search-box">
                        <FaSearch />
                        <input
                            type="text"
                            placeholder="Buscar juegos por título..."
                            value={gameSearchTerm}
                            onChange={(e) => setGameSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filter-select">
                        <FaFilter />
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
                </div>
            </div>
            
            {gamesLoading ? (
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Cargando juegos...</p>
                </div>
            ) : gamesError ? (
                <div className="error-state">
                    <p>{gamesError}</p>
                </div>
            ) : filteredGames.length === 0 ? (
                <div className="empty-state">
                    <FaGamepad size={48} />
                    <p>No se encontraron juegos</p>
                </div>
            ) : (
                <div className="games-grid">
                    {filteredGames.map(game => (
                        <div key={game._id || game.id} className="game-card">
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
                            </div>
                            
                            <div className="game-info">
                                <h4 className="game-title">{game.title || game.name}</h4>
                                <div className="game-genres">
                                    {Array.isArray(game.genre) ? game.genre.join(', ') : game.genre}
                                </div>
                                
                                {game.description && (
                                    <p className="game-description">
                                        {game.description.substring(0, 120)}...
                                    </p>
                                )}
                                
                                <div className="game-meta">
                                    {game.developer && (
                                        <span className="developer">{game.developer}</span>
                                    )}
                                    {game.releaseDate && (
                                        <span className="release-date">
                                            {new Date(game.releaseDate).getFullYear()}
                                        </span>
                                    )}
                                </div>
                                
                                {game.metacriticScore && (
                                    <div className={`score-badge ${
                                        game.metacriticScore >= 80 ? 'high' :
                                        game.metacriticScore >= 60 ? 'medium' : 'low'
                                    }`}>
                                        {game.metacriticScore}/100
                                    </div>
                                )}
                            </div>
                            
                            <div className="game-actions">
                                <button
                                    onClick={() => navigateToGame(game._id || game.id)}
                                    className="btn btn-primary"
                                >
                                    <FaEye /> Ver Detalles
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
    
    // Si está cargando autenticación, mostrar loading
    if (authLoading) {
        return (
            <div className="loading-page">
                <div className="loading-spinner"></div>
                <p>Cargando...</p>
            </div>
        );
    }
    
    return (
        <div className="community-page">
            <Header />
            
            <div className="community-container">
                <div className="community-header">
                    <h1>
                        <FaUsers /> Comunidad Play-Zone
                    </h1>
                    <p>Explora nuestra vibrante comunidad de gamers y descubre nuevos juegos</p>
                </div>
                
                <div className="community-tabs">
                    <button
                        className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        <FaChartLine /> Resumen
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        <FaUsers /> Usuarios
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'games' ? 'active' : ''}`}
                        onClick={() => setActiveTab('games')}
                    >
                        <FaGamepad /> Catálogo
                    </button>
                </div>
                
                <div className="community-content">
                    {activeTab === 'overview' && <StatsOverview />}
                    {activeTab === 'users' && <UsersSection />}
                    {activeTab === 'games' && <GamesSection />}
                </div>
            </div>
        </div>
    );
};

export default CommunityPage;