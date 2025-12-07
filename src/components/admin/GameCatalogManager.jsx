// src/components/admin/GameCatalogManager.jsx
import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaGamepad, FaSave, FaTimes } from 'react-icons/fa';
import adminService from '../../services/adminService';
import './GameCatalogManager.css';

const GameCatalogManager = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: [],
    developer: '',
    publisher: '',
    releaseDate: '',
    rating: '',
    price: '',
    imageUrl: '',
    trailerUrl: '',
    platform: [],
    tags: [],
    metacriticScore: '',
    featured: false
  });

  const gamesPerPage = 10;
  const genres = [
    'Acción', 'Aventura', 'RPG', 'Estrategia', 'Simulación', 'Deportes',
    'Carreras', 'Puzzle', 'Terror', 'Shooter', 'Plataformas', 'Indie', 'Mundo Abierto'
  ];
  const platforms = ['PC', 'PlayStation 5', 'PlayStation 4', 'Xbox Series X/S', 'Xbox One', 'Nintendo Switch', 'Mobile', 'VR'];
  const ratings = ['E', 'E10+', 'T', 'M', 'AO', 'RP'];

  useEffect(() => {
    fetchGames();
  }, [currentPage, searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchGames = async () => {
    try {
      setLoading(true);
      const response = await adminService.getGames(currentPage, gamesPerPage, searchTerm);
      
      // Asegurar que games sea siempre un array válido
      const gamesData = response?.data?.games || response?.games || response?.data || response || [];
      const validGames = Array.isArray(gamesData) ? gamesData.filter(game => game && typeof game === 'object') : [];
      
      setGames(validGames);
      setTotalPages(response?.data?.totalPages || response?.totalPages || 1);
      setError(null);
    } catch (err) {
      setError('Error al cargar los juegos');
      setGames([]);
      console.error('Error fetching games:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchGames();
  };

  const handleCreateGame = () => {
    setEditingGame(null);
    setFormData({
      title: '',
      description: '',
      genre: [],
      developer: '',
      publisher: '',
      releaseDate: '',
      rating: '',
      price: '',
      imageUrl: '',
      trailerUrl: '',
      platform: [],
      tags: [],
      metacriticScore: '',
      featured: false
    });
    setShowModal(true);
  };

  const handleEditGame = (game) => {
    setEditingGame(game);
    setFormData({
      title: game.title || '',
      description: game.description || '',
      genre: Array.isArray(game.genre) ? game.genre : (game.genre ? [game.genre] : []),
      developer: game.developer || '',
      publisher: game.publisher || '',
      releaseDate: game.releaseDate ? game.releaseDate.split('T')[0] : '',
      rating: game.rating || '',
      price: game.price || '',
      imageUrl: game.imageUrl || '',
      trailerUrl: game.trailerUrl || '',
      platform: Array.isArray(game.platform) ? game.platform : (game.platforms || []),
      tags: Array.isArray(game.tags) ? game.tags : [],
      metacriticScore: game.metacriticScore ? String(game.metacriticScore) : '',
      featured: Boolean(game.featured)
    });
    setShowModal(true);
  };

  const handleDeleteGame = async (gameId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este juego?')) {
      return;
    }

    try {
      await adminService.deleteGame(gameId);
      setGames((prevGames) => {
        const gamesArray = Array.isArray(prevGames) ? prevGames : [];
        return gamesArray.filter(game => 
          game && (game._id !== gameId && game.id !== gameId)
        );
      });
      alert('Juego eliminado exitosamente');
    } catch (err) {
      console.error('Error deleting game:', err);
      alert('Error al eliminar el juego');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Validar campos obligatorios
      if (!formData.title || !formData.title.trim()) {
        alert('El título del juego es obligatorio');
        return;
      }
      if (!formData.description || !formData.description.trim()) {
        alert('La descripción del juego es obligatoria');
        return;
      }
      if (!Array.isArray(formData.genre) || formData.genre.length === 0) {
        alert('Debe seleccionar al menos un género');
        return;
      }
      if (!Array.isArray(formData.platform) || formData.platform.length === 0) {
        alert('Debe seleccionar al menos una plataforma');
        return;
      }
      if (!formData.developer || !formData.developer.trim()) {
        alert('El desarrollador es obligatorio');
        return;
      }
      if (!formData.publisher || !formData.publisher.trim()) {
        alert('El publicador es obligatorio');
        return;
      }
      if (!formData.releaseDate) {
        alert('La fecha de lanzamiento es obligatoria');
        return;
      }
      if (!formData.rating) {
        alert('La clasificación por edad es obligatoria');
        return;
      }

      const gameData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        genre: formData.genre,
        platform: formData.platform,
        developer: formData.developer.trim(),
        publisher: formData.publisher.trim(),
        releaseDate: formData.releaseDate,
        rating: formData.rating,
        ...(formData.price && { price: parseFloat(formData.price) }),
        ...(formData.imageUrl?.trim() && { imageUrl: formData.imageUrl.trim() }),
        ...(formData.trailerUrl?.trim() && { trailerUrl: formData.trailerUrl.trim() }),
        ...(Array.isArray(formData.tags) && formData.tags.length > 0 && { tags: formData.tags }),
        ...(formData.metacriticScore && { metacriticScore: parseInt(formData.metacriticScore) }),
        featured: Boolean(formData.featured),
        isActive: true
      };
      
      // Debug: Mostrar datos que se van a enviar
      console.log('Datos del juego a enviar:', gameData);

      if (editingGame) {
        const gameId = editingGame._id || editingGame.id;
        const response = await adminService.updateGame(gameId, gameData);
        const updatedGame = response?.data || response;
        
        setGames((prevGames) => {
          const gamesArray = Array.isArray(prevGames) ? prevGames : [];
          return gamesArray.map(game => 
            (game && (game._id === gameId || game.id === gameId)) ? updatedGame : game
          ).filter(game => game && typeof game === 'object');
        });
        alert('Juego actualizado exitosamente');
      } else {
        const response = await adminService.createGame(gameData);
        const newGame = response?.data || response;
        
        setGames((prevGames) => {
          const gamesArray = Array.isArray(prevGames) ? prevGames : [];
          return newGame ? [newGame, ...gamesArray] : gamesArray;
        });
        alert('Juego creado exitosamente');
      }

      setShowModal(false);
      setEditingGame(null);
    } catch (err) {
      console.error('Error saving game:', err);
      console.error('Error details:', err.message);
      
      // Mostrar error más específico al usuario
      let errorMessage = 'Error al guardar el juego';
      if (err.message.includes('400')) {
        errorMessage = 'Error de validación: Verifica que todos los campos requeridos estén completos y tengan el formato correcto';
      }
      
      alert(errorMessage + '\n\nDetalles técnicos: ' + err.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (value || '')
    }));
  };

  const handleArrayChange = (name, value, checked) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked 
        ? [...prev[name], value]
        : prev[name].filter(item => item !== value)
    }));
  };

  const handleTagsChange = (e) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData(prev => ({
      ...prev,
      tags
    }));
  };

  return (
    <div className="game-catalog-manager">
      <div className="catalog-header">
        <h2>Gestión de Catálogo de Juegos</h2>
        <p>Administra el catálogo central de videojuegos</p>
      </div>

      <div className="catalog-controls">
        <div className="search-section">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-box">
              <FaSearch />
              <input
                type="text"
                placeholder="Buscar juegos por título, género o desarrollador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button type="submit" className="search-btn">Buscar</button>
          </form>
        </div>

        <button className="add-game-btn" onClick={handleCreateGame}>
          <FaPlus /> Agregar Juego
        </button>
      </div>

        <div className="games-stats">
          <div className="stat-item">
            <FaGamepad />
            <span className="stat-number">{Array.isArray(games) ? games.length : 0}</span>
            <span className="stat-label">Juegos en esta página</span>
          </div>
        </div>      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando juegos...</p>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={fetchGames} className="retry-btn">
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="games-grid">
            {!Array.isArray(games) || games.length === 0 ? (
              <div className="no-games">
                <FaGamepad size={48} />
                <h3>No se encontraron juegos</h3>
                <p>No hay juegos que coincidan con la búsqueda actual.</p>
              </div>
            ) : (
              games.filter(game => game && (game._id || game.id)).map((game, index) => (
                <div key={game._id || game.id} className="game-card">
                  <div className="game-image">
                    <img
                      src={game.imageUrl || '/default-game.jpg'}
                      alt={game.name || game.title || 'Sin título'}
                      onError={(e) => {
                        e.target.src = '/default-game.jpg';
                      }}
                    />
                  </div>
                  
                  <div className="game-info">
                    <h3 className="game-title">{game.title || game.name || 'Sin título'}</h3>
                    <p className="game-genre">{Array.isArray(game.genre) ? game.genre.join(', ') : game.genre || 'Sin género'}</p>
                    <p className="game-developer">por {game.developer || 'Desarrollador desconocido'}</p>
                    
                    {game.price && (
                      <p className="game-price">
                        <strong>Precio:</strong> ${game.price}
                      </p>
                    )}
                    
                    {game.rating && (
                      <p className="game-rating">
                        <strong>Clasificación:</strong> {game.rating}
                      </p>
                    )}
                    
                    {game.featured && (
                      <span className="featured-badge">⭐ Destacado</span>
                    )}
                    
                    {game.metacriticScore && (
                      <div className={`score-badge ${
                        game.metacriticScore >= 80 ? 'high' :
                        game.metacriticScore >= 60 ? 'medium' : 'low'
                      }`}>
                        Metacritic: {game.metacriticScore}
                      </div>
                    )}
                  </div>

                  <div className="game-actions">
                    <button
                      className="action-btn edit"
                      onClick={() => handleEditGame(game)}
                      title="Editar juego"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDeleteGame(game._id || game.id)}
                      title="Eliminar juego"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                ))
            )}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="page-btn"
              >
                Anterior
              </button>
              
              <span className="page-info">
                Página {currentPage} de {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="page-btn"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="game-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingGame ? 'Editar Juego' : 'Agregar Nuevo Juego'}</h3>
              <button onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="game-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="title">Título *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Géneros *</label>
                  <div className="checkbox-group">
                    {genres.map(genre => (
                      <label key={genre} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.genre.includes(genre)}
                          onChange={(e) => handleArrayChange('genre', genre, e.target.checked)}
                        />
                        {genre}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Descripción *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="developer">Desarrollador *</label>
                  <input
                    type="text"
                    id="developer"
                    name="developer"
                    value={formData.developer}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="publisher">Publicador *</label>
                  <input
                    type="text"
                    id="publisher"
                    name="publisher"
                    value={formData.publisher}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="releaseDate">Fecha de Lanzamiento *</label>
                  <input
                    type="date"
                    id="releaseDate"
                    name="releaseDate"
                    value={formData.releaseDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="metacriticScore">Puntuación Metacritic</label>
                  <input
                    type="number"
                    id="metacriticScore"
                    name="metacriticScore"
                    value={formData.metacriticScore}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Clasificación por Edad *</label>
                <div className="radio-group">
                  {ratings.map(rating => (
                    <label key={rating} className="radio-label">
                      <input
                        type="radio"
                        name="rating"
                        value={rating}
                        checked={formData.rating === rating}
                        onChange={handleInputChange}
                      />
                      {rating}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="imageUrl">URL de Imagen</label>
                  <input
                    type="url"
                    id="imageUrl"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="trailerUrl">URL del Trailer</label>
                  <input
                    type="url"
                    id="trailerUrl"
                    name="trailerUrl"
                    value={formData.trailerUrl}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Plataformas</label>
                <div className="checkbox-group">
                  {platforms.map(platform => (
                    <label key={platform} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.platform.includes(platform)}
                        onChange={(e) => handleArrayChange('platform', platform, e.target.checked)}
                      />
                      {platform}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="tags">Tags (separados por comas)</label>
                <input
                  type="text"
                  id="tags"
                  value={formData.tags.join(', ')}
                  onChange={handleTagsChange}
                  placeholder="multijugador, cooperativo, online..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="price">Precio</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleInputChange}
                    />
                    Juego destacado
                  </label>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="steamUrl">URL de Steam</label>
                  <input
                    type="url"
                    id="steamUrl"
                    name="steamUrl"
                    value={formData.steamUrl}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="officialUrl">Sitio Oficial</label>
                  <input
                    type="url"
                    id="officialUrl"
                    name="officialUrl"
                    value={formData.officialUrl}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowModal(false)} className="cancel-btn">
                  <FaTimes /> Cancelar
                </button>
                <button type="submit" className="save-btn">
                  <FaSave /> {editingGame ? 'Actualizar' : 'Crear'} Juego
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameCatalogManager;