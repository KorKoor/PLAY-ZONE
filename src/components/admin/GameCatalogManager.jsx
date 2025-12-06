// src/components/admin/GameCatalogManager.jsx
import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaGamepad, FaEye, FaSave, FaTimes } from 'react-icons/fa';
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
    genre: '',
    developer: '',
    publisher: '',
    releaseDate: '',
    imageUrl: '',
    platforms: [],
    tags: [],
    metacriticScore: '',
    steamUrl: '',
    officialUrl: ''
  });

  const gamesPerPage = 10;
  const genres = [
    'Acción', 'Aventura', 'RPG', 'Estrategia', 'Simulación', 'Deportes',
    'Carreras', 'Puzzle', 'Terror', 'Shooter', 'Plataformas', 'Indie'
  ];
  const platforms = ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch', 'Mobile'];

  useEffect(() => {
    fetchGames();
  }, [currentPage, searchTerm]);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const response = await adminService.getGames(currentPage, gamesPerPage, searchTerm);
      setGames(Array.isArray(response?.data?.games) ? response.data.games : []);
      setTotalPages(response?.data?.totalPages || 1);
      setError(null);
    } catch (err) {
      setError('Error al cargar los juegos');
      setGames([]); // Asegurar que games sea siempre un array
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
      genre: '',
      developer: '',
      publisher: '',
      releaseDate: '',
      imageUrl: '',
      platforms: [],
      tags: [],
      metacriticScore: '',
      steamUrl: '',
      officialUrl: ''
    });
    setShowModal(true);
  };

  const handleEditGame = (game) => {
    setEditingGame(game);
    setFormData({
      title: game.title || '',
      description: game.description || '',
      genre: game.genre || '',
      developer: game.developer || '',
      publisher: game.publisher || '',
      releaseDate: game.releaseDate ? game.releaseDate.split('T')[0] : '',
      imageUrl: game.imageUrl || '',
      platforms: game.platforms || [],
      tags: game.tags || [],
      metacriticScore: game.metacriticScore || '',
      steamUrl: game.steamUrl || '',
      officialUrl: game.officialUrl || ''
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
        return gamesArray.filter(game => game._id !== gameId && game.id !== gameId);
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
      const gameData = {
        ...formData,
        metacriticScore: formData.metacriticScore ? parseInt(formData.metacriticScore) : null
      };

      if (editingGame) {
        const gameId = editingGame._id || editingGame.id;
        const response = await adminService.updateGame(gameId, gameData);
        setGames((prevGames) => {
          const gamesArray = Array.isArray(prevGames) ? prevGames : [];
          return gamesArray.map(game => 
            (game._id === gameId || game.id === gameId) ? response.data : game
          );
        });
        alert('Juego actualizado exitosamente');
      } else {
        const response = await adminService.createGame(gameData);
        setGames((prevGames) => {
          const gamesArray = Array.isArray(prevGames) ? prevGames : [];
          return [response.data, ...gamesArray];
        });
        alert('Juego creado exitosamente');
      }

      setShowModal(false);
      setEditingGame(null);
    } catch (err) {
      console.error('Error saving game:', err);
      alert('Error al guardar el juego');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
              games.map(game => (
                <div key={game._id || game.id} className="game-card">
                  <div className="game-image">
                    <img
                      src={game.imageUrl || '/default-game.jpg'}
                      alt={game.title}
                      onError={(e) => {
                        e.target.src = '/default-game.jpg';
                      }}
                    />
                  </div>
                  
                  <div className="game-info">
                    <h3 className="game-title">{game.title}</h3>
                    <p className="game-genre">{game.genre}</p>
                    <p className="game-developer">por {game.developer}</p>
                    
                    {game.metacriticScore && (
                      <div className={`score-badge ${
                        game.metacriticScore >= 80 ? 'high' :
                        game.metacriticScore >= 60 ? 'medium' : 'low'
                      }`}>
                        {game.metacriticScore}
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
                  <label htmlFor="genre">Género</label>
                  <select
                    id="genre"
                    name="genre"
                    value={formData.genre}
                    onChange={handleInputChange}
                  >
                    <option value="">Seleccionar género</option>
                    {genres.map(genre => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Descripción</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="developer">Desarrollador</label>
                  <input
                    type="text"
                    id="developer"
                    name="developer"
                    value={formData.developer}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="publisher">Publicador</label>
                  <input
                    type="text"
                    id="publisher"
                    name="publisher"
                    value={formData.publisher}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="releaseDate">Fecha de Lanzamiento</label>
                  <input
                    type="date"
                    id="releaseDate"
                    name="releaseDate"
                    value={formData.releaseDate}
                    onChange={handleInputChange}
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
                <label>Plataformas</label>
                <div className="checkbox-group">
                  {platforms.map(platform => (
                    <label key={platform} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.platforms.includes(platform)}
                        onChange={(e) => handleArrayChange('platforms', platform, e.target.checked)}
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