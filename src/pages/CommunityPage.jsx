// src/pages/CommunityPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/layout/Header';
import userService from '../services/userService';
import gameService from '../services/gameService';
import postService from '../services/postService';
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
    FaFilter,
    FaTimes,
    FaExternalLinkAlt
} from 'react-icons/fa';
import '../styles/CommunityPage.css';

const CommunityPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
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
    
    // Estados para comentario específico
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [selectedComment, setSelectedComment] = useState(null);
    const [commentLoading, setCommentLoading] = useState(false);
    const [commentError, setCommentError] = useState(null);
    
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

    // Efecto para detectar comentario específico en la URL
    useEffect(() => {
        const hash = location.hash;
        if (hash.startsWith('#comment-')) {
            const commentId = hash.replace('#comment-', '');
            loadSpecificComment(commentId);
        }
    }, [location.hash]);

    // Helper function para extraer nombre del usuario del comentario
    const extractUserName = (comment) => {
        console.log('[CommunityPage] Extrayendo nombre de usuario...');
        
        const possibleSources = [
            { source: 'author.alias', value: comment.author?.alias },
            { source: 'author.username', value: comment.author?.username },
            { source: 'author.name', value: comment.author?.name },
            { source: 'user.alias', value: comment.user?.alias },
            { source: 'user.username', value: comment.user?.username },
            { source: 'user.name', value: comment.user?.name },
            { source: 'createdBy.alias', value: comment.createdBy?.alias },
            { source: 'createdBy.username', value: comment.createdBy?.username },
            { source: 'createdBy.name', value: comment.createdBy?.name },
            { source: 'authorName', value: comment.authorName },
            { source: 'userName', value: comment.userName },
            { source: 'ownerName', value: comment.ownerName },
            { source: 'userAlias', value: comment.userAlias },
            { source: 'authorAlias', value: comment.authorAlias }
        ];
        
        // Primero buscar nombres directos
        for (const { source, value } of possibleSources) {
            console.log(`[CommunityPage] Checking ${source}:`, value);
            if (value && typeof value === 'string' && value.trim()) {
                console.log(`[CommunityPage] ✅ Found user name in ${source}:`, value);
                return value;
            }
        }
        
        // Si no encontramos nombre directo, buscar en objetos de usuario
        const userObjects = [
            { source: 'userId object', obj: comment.userId },
            { source: 'authorId object', obj: comment.authorId },
            { source: 'author object', obj: comment.author },
            { source: 'user object', obj: comment.user },
            { source: 'createdBy object', obj: comment.createdBy }
        ];
        
        for (const { source, obj } of userObjects) {
            if (obj && typeof obj === 'object') {
                console.log(`[CommunityPage] Found ${source}:`, obj);
                
                // Buscar nombre en el objeto
                const nameInObject = obj.alias || obj.username || obj.name || obj.displayName;
                if (nameInObject && typeof nameInObject === 'string') {
                    console.log(`[CommunityPage] ✅ Found user name in ${source}:`, nameInObject);
                    return nameInObject;
                }
                
                // Si es solo un ID string/number
                const idInObject = obj._id || obj.id;
                if (idInObject && (typeof idInObject === 'string' || typeof idInObject === 'number')) {
                    console.log(`[CommunityPage] ✅ Using ID from ${source}:`, idInObject);
                    return `Usuario #${idInObject}`;
                }
            }
        }
        
        // Fallback final
        console.log('[CommunityPage] ❌ No user name found, using fallback');
        return 'Usuario desconocido';
    };

    // Helper function para extraer foto del usuario del comentario
    const extractUserPhoto = (comment) => {
        console.log('[CommunityPage] Extrayendo foto de usuario...');
        
        const possiblePhotoSources = [
            { source: 'author.profileImage', value: comment.author?.profileImage },
            { source: 'author.avatar', value: comment.author?.avatar },
            { source: 'author.photo', value: comment.author?.photo },
            { source: 'author.image', value: comment.author?.image },
            { source: 'user.profileImage', value: comment.user?.profileImage },
            { source: 'user.avatar', value: comment.user?.avatar },
            { source: 'user.photo', value: comment.user?.photo },
            { source: 'user.image', value: comment.user?.image },
            { source: 'createdBy.profileImage', value: comment.createdBy?.profileImage },
            { source: 'createdBy.avatar', value: comment.createdBy?.avatar },
            { source: 'createdBy.photo', value: comment.createdBy?.photo },
            { source: 'createdBy.image', value: comment.createdBy?.image },
            { source: 'profileImage', value: comment.profileImage },
            { source: 'avatar', value: comment.avatar },
            { source: 'userPhoto', value: comment.userPhoto },
            { source: 'authorPhoto', value: comment.authorPhoto }
        ];
        
        // Buscar foto en objetos también
        const userObjects = [
            { source: 'userId object', obj: comment.userId },
            { source: 'authorId object', obj: comment.authorId },
            { source: 'author object', obj: comment.author },
            { source: 'user object', obj: comment.user },
            { source: 'createdBy object', obj: comment.createdBy }
        ];
        
        // Buscar fotos directas
        for (const { source, value } of possiblePhotoSources) {
            console.log(`[CommunityPage] Checking photo ${source}:`, value);
            if (value && typeof value === 'string' && value.trim()) {
                console.log(`[CommunityPage] ✅ Found user photo in ${source}:`, value);
                return value;
            }
        }
        
        // Buscar fotos en objetos
        for (const { source, obj } of userObjects) {
            if (obj && typeof obj === 'object') {
                const photoInObject = obj.profileImage || obj.avatar || obj.photo || obj.image;
                if (photoInObject && typeof photoInObject === 'string' && photoInObject.trim()) {
                    console.log(`[CommunityPage] ✅ Found user photo in ${source}:`, photoInObject);
                    return photoInObject;
                }
            }
        }
        
        console.log('[CommunityPage] ❌ No user photo found');
        return null;
    };

    const loadCommunityData = async () => {
        await Promise.all([
            loadUsers(),
            loadGames(),
            loadStats()
        ]);
    };

    // Función para cargar un comentario específico
    const loadSpecificComment = async (commentId) => {
        try {
            setCommentLoading(true);
            setCommentError(null);
            
            console.log('[CommunityPage] Buscando comentario:', commentId);
            
            // Obtener el comentario desde el endpoint implementado
            const response = await postService.getCommentById(commentId);
            const comment = response.data || response;
            
            if (comment) {
                // Debug: Ver la estructura completa del comentario
                console.log('[CommunityPage] Estructura completa del comentario:', comment);
                console.log('[CommunityPage] Información del autor:', comment.author || comment.user || comment.authorId);
                console.log('[CommunityPage] Propiedades del objeto comentario:', Object.keys(comment));
                
                // Debug: Intentar todas las posibles ubicaciones del autor
                console.log('[CommunityPage] comment.author:', comment.author);
                console.log('[CommunityPage] comment.user:', comment.user);
                console.log('[CommunityPage] comment.createdBy:', comment.createdBy);
                console.log('[CommunityPage] comment.userId:', comment.userId);
                console.log('[CommunityPage] comment.authorId:', comment.authorId);
                console.log('[CommunityPage] comment.owner:', comment.owner);
                
                setSelectedComment(comment);
                setShowCommentModal(true);
                console.log('[CommunityPage] Comentario encontrado:', comment);
            } else {
                throw new Error('Comentario no encontrado');
            }
        } catch (error) {
            console.error('[CommunityPage] Error cargando comentario:', error);
            setCommentError('No se pudo cargar el comentario. Puede haber sido eliminado o no existe.');
            setShowCommentModal(true);
        } finally {
            setCommentLoading(false);
        }
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

            {/* Modal para mostrar comentario específico */}
            {showCommentModal && (
                <div className="comment-modal-overlay" onClick={() => {
                    setShowCommentModal(false);
                    setSelectedComment(null);
                    setCommentError(null);
                    // Limpiar el hash de la URL
                    window.history.replaceState(null, '', window.location.pathname);
                }}>
                    <div className="comment-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="comment-modal-header">
                            <h3>💬 Comentario Reportado</h3>
                            <button 
                                className="close-btn" 
                                onClick={() => {
                                    setShowCommentModal(false);
                                    setSelectedComment(null);
                                    setCommentError(null);
                                    window.history.replaceState(null, '', window.location.pathname);
                                }}
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className="comment-modal-body">
                            {commentLoading ? (
                                <div className="loading-state">
                                    <div className="spinner"></div>
                                    <p>Cargando comentario...</p>
                                </div>
                            ) : commentError ? (
                                <div className="error-state">
                                    <div className="error-icon">❌</div>
                                    <h4>Comentario no disponible</h4>
                                    <p>{commentError}</p>
                                    <div className="error-help">
                                        <p><strong>Posibles razones:</strong></p>
                                        <ul>
                                            <li>El comentario fue eliminado</li>
                                            <li>El post que contenía el comentario fue eliminado</li>
                                            <li>No tienes permisos para ver este contenido</li>
                                            <li>El ID del comentario no es válido</li>
                                        </ul>
                                    </div>
                                </div>
                            ) : selectedComment ? (
                                <div className="comment-display">
                                    <div className="comment-info">
                                        <div className="comment-author">
                                            {(() => {
                                                const userPhoto = extractUserPhoto(selectedComment);
                                                return userPhoto ? (
                                                    <img 
                                                        src={userPhoto} 
                                                        alt="Avatar del usuario"
                                                        className="user-avatar"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            e.target.nextSibling.style.display = 'block';
                                                        }}
                                                    />
                                                ) : null;
                                            })()}
                                            <FaUserCircle className="user-avatar-fallback" style={{ 
                                                display: extractUserPhoto(selectedComment) ? 'none' : 'block'
                                            }} />
                                            <div className="user-info">
                                                <span className="user-name">
                                                    {extractUserName(selectedComment)}
                                                </span>
                                                <span className="comment-date">
                                                    {selectedComment.createdAt ? 
                                                        new Date(selectedComment.createdAt).toLocaleDateString('es-ES', {
                                                            day: 'numeric',
                                                            month: 'long', 
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        }) : 'Fecha no disponible'
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="comment-content">
                                        <h4>Contenido del comentario:</h4>
                                        <div className="comment-text">
                                            {selectedComment.text || selectedComment.content || 'Texto no disponible'}
                                        </div>
                                    </div>

                                    {selectedComment.postTitle && (
                                        <div className="comment-context">
                                            <h4>Contexto:</h4>
                                            <div className="context-info">
                                                <FaBookOpen />
                                                <span>Comentario en: "{selectedComment.postTitle}"</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="comment-actions">
                                        {selectedComment.postId && (
                                            <button 
                                                className="btn btn-primary"
                                                onClick={() => {
                                                    navigate(`/posts/${selectedComment.postId}`);
                                                }}
                                            >
                                                <FaExternalLinkAlt /> Ver Post Completo
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommunityPage;