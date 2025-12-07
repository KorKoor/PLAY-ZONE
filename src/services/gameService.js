// src/services/gameService.js
import { get, post, put, del } from './httpService';

const gameService = {
    // Obtener todos los juegos para el catálogo (público)
    getGames: () => {
        return get('/games');
    },

    // Obtener un juego específico por ID (público)
    getGameById: (id) => {
        return get(`/games/${id}`);
    },

    // Crear un nuevo juego (solo admin)
    createGame: (gameData) => {
        console.log('🎮 gameService.createGame - Datos enviados:', gameData);
        return post('/games', gameData);
    },

    // Actualizar un juego existente (solo admin)
    updateGame: (id, gameData) => {
        return put(`/games/${id}`, gameData);
    },

    // Eliminar un juego (solo admin - soft delete)
    deleteGame: (id) => {
        return del(`/games/${id}`);
    }
};

export default gameService;
