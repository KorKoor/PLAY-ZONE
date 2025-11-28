// src/components/layout/SidebarCommunity.jsx - MEJORADO

import React, { useState } from 'react';
import useActiveUsers from '../../hooks/useActiveUsers';
import userService from '../../services/userService';
import { FaUserPlus, FaUserCircle, FaSpinner, FaUserMinus, FaGamepad, FaBookOpen } from 'react-icons/fa'; // Importado FaBookOpen
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import '../../styles/SidebarCommunity.css';

const SidebarCommunity = () => {
    const { activeUsers, isLoading, error, fetchActiveUsers } = useActiveUsers();
    const navigate = useNavigate();
    // ⚠️ Asumimos que currentUser tiene el array `following` (array de IDs) ⚠️
    const { user: currentUser } = useAuthContext();
    // Estado local para manejar el loading de seguimiento de un usuario específico
    const [followLoadingId, setFollowLoadingId] = useState(null);

    // Función para manejar el seguimiento (Requisito 1.7)
    const handleFollow = async (player) => {
        const targetId = player._id || player.id;
        setFollowLoadingId(targetId); // 1. Inicia el loading en este jugador

        try {
            await userService.followUser(targetId);

            // 2. Forzamos el refresco de la lista y el AuthContext (idealmente)
            fetchActiveUsers();

        } catch (error) {
            console.error('Error al procesar el seguimiento:', error);
            // TODO: Añadir manejo de errores visibles al usuario (e.g., toast)
        } finally {
            setFollowLoadingId(null); // 3. Detiene el loading
        }
    };

    // Función de navegación para el perfil
    const handleNavigateToProfile = (playerId) => {
        navigate(`/profile/${playerId}`);
    };

    return (
        <aside className="sidebar-community">
            <div className="sidebar-card">
                <h3>🔥 Jugadores Más Activos</h3>
                <p className="card-subtitle">Sigue a los que más contenido comparten (Req. 4.4).</p>

                {/* Feedback de Carga y Error */}
                {isLoading && <div className="loading-state"><FaSpinner className="spinner" /> Cargando jugadores...</div>}
                {error && <p className="error-message">{error}</p>}

                {/* Mensaje si no hay jugadores activos */}
                {!isLoading && activeUsers.length === 0 && !error && (
                    <div className="no-content-message">
                        <FaUserCircle size={30} />
                        <p>Sé el primer jugador activo en publicar guías o posts.</p>
                    </div>
                )}

                {/* Lista de Jugadores Activos */}
                <ul className="active-players-list">
                    {activeUsers.map(player => {
                        const playerId = player._id || player.id;

                        // 🚀 MEJORA: Cálculo más robusto de isFollowing
                        const isFollowing = currentUser?.following?.includes(playerId) || player.isFollowing || false;

                        const isSelf = currentUser && (currentUser._id === playerId || currentUser.id === playerId);
                        const isPlayerLoading = followLoadingId === playerId;

                        return (
                            <li key={playerId} className="player-item">

                                {/* Avatar clickeable con manejo de error de imagen */}
                                <img
                                    src={player.avatarUrl || '/default-avatar.svg'}
                                    alt={player.alias}
                                    className="player-avatar"
                                    onClick={() => handleNavigateToProfile(playerId)}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = '/default-avatar.svg';
                                    }}
                                />
                                {/* Detalles del Jugador (Clickeable) */}
                                <div
                                    className="player-details"
                                    onClick={() => handleNavigateToProfile(playerId)}
                                >
                                    <span className="player-alias clickable-alias">
                                        {player.alias}
                                    </span>
                                    {/* Posts Count */}
                                    <span className="player-score"><FaGamepad size={12} /> Posts: {player.postsCount || 0}</span>
                                </div>

                                {/* BOTON DE SEGUIMIENTO FUNCIONAL (Solo para otros usuarios) */}
                                {!isSelf && (
                                    <button
                                        onClick={() => handleFollow(player)}
                                        className={`btn-follow ${isFollowing ? 'unfollow-btn' : 'follow-btn'}`}
                                        disabled={isPlayerLoading} // Deshabilitar durante la llamada API
                                    >
                                        {isPlayerLoading ? (
                                            <FaSpinner className="spinner-small" />
                                        ) : isFollowing ? (
                                            <><FaUserMinus /> Dejar de Seguir</>
                                        ) : (
                                            <><FaUserPlus /> Seguir</>
                                        )}
                                    </button>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </div>

            {/* SECCION DE GUIAS DESTACADAS (Módulo 3) - Ahora con botón de navegación */}
            <div className="sidebar-card guides-highlight-card">
                <h3>⭐ Guías Destacadas</h3>
                <p className="card-subtitle">Encuentra las guías más votadas de la semana.</p>
                <button
                    onClick={() => navigate('/guides')}
                    className="btn btn-primary btn-full-width"
                >
                    <FaBookOpen /> Explorar Guías
                </button>
            </div>
        </aside>
    );
};

export default SidebarCommunity;