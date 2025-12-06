// src/services/adminService.js
import { get, post, put, del } from './httpService';

const adminService = {
    // === GESTIÓN DE REPORTES ===
    getReports: async (type = 'all', status = 'pending') => {
        try {
            const params = new URLSearchParams();
            if (type !== 'all') params.append('type', type);
            if (status !== 'all') params.append('status', status);
            
            const endpoint = `/admin/reports${params.toString() ? `?${params}` : ''}`;
            return await get(endpoint);
        } catch (error) {
            console.error('Error al obtener reportes:', error);
            throw error;
        }
    },

    approveReport: async (reportId) => {
        try {
            return await put(`/admin/reports/${reportId}/approve`);
        } catch (error) {
            console.error('Error al aprobar reporte:', error);
            throw error;
        }
    },

    rejectReport: async (reportId, reason = '') => {
        try {
            return await put(`/admin/reports/${reportId}/reject`, { reason });
        } catch (error) {
            console.error('Error al rechazar reporte:', error);
            throw error;
        }
    },

    // === GESTIÓN DE USUARIOS ===
    banUser: async (userId, reason = '') => {
        try {
            return await put(`/admin/users/${userId}/ban`, { reason });
        } catch (error) {
            console.error('Error al banear usuario:', error);
            throw error;
        }
    },

    unbanUser: async (userId) => {
        try {
            return await put(`/admin/users/${userId}/unban`);
        } catch (error) {
            console.error('Error al desbanear usuario:', error);
            throw error;
        }
    },

    deleteUser: async (userId) => {
        try {
            return await del(`/admin/users/${userId}`);
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            throw error;
        }
    },

    changeUserRole: async (userId, newRole) => {
        try {
            return await put(`/admin/users/${userId}/role`, { role: newRole });
        } catch (error) {
            console.error('Error al cambiar rol de usuario:', error);
            throw error;
        }
    },

    // === GESTIÓN DE CATÁLOGO ===
    getGames: async (page = 1, limit = 20, search = '') => {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
            });
            if (search) params.append('search', search);
            
            return await get(`/admin/games?${params}`);
        } catch (error) {
            console.error('Error al obtener juegos:', error);
            throw error;
        }
    },

    createGame: async (gameData) => {
        try {
            return await post('/admin/games', gameData);
        } catch (error) {
            console.error('Error al crear juego:', error);
            throw error;
        }
    },

    updateGame: async (gameId, gameData) => {
        try {
            return await put(`/admin/games/${gameId}`, gameData);
        } catch (error) {
            console.error('Error al actualizar juego:', error);
            throw error;
        }
    },

    deleteGame: async (gameId) => {
        try {
            return await del(`/admin/games/${gameId}`);
        } catch (error) {
            console.error('Error al eliminar juego:', error);
            throw error;
        }
    },

    // === ESTADÍSTICAS GENERALES ===
    getDashboardStats: async () => {
        try {
            return await get('/admin/dashboard/stats');
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            throw error;
        }
    },

    getActivityLogs: async (page = 1, limit = 50) => {
        try {
            return await get(`/admin/logs?page=${page}&limit=${limit}`);
        } catch (error) {
            console.error('Error al obtener logs de actividad:', error);
            throw error;
        }
    }
};

export default adminService;