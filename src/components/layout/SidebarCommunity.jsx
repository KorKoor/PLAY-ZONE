// src/components/layout/SidebarCommunity.jsx
import React from 'react';
import useActiveUsers from '../../hooks/useActiveUsers';
import { FaUserPlus, FaUserCircle, FaSpinner } from 'react-icons/fa';
// import { useNavigate } from 'react-router-dom'; // Se usaría para navegar al perfil

const SidebarCommunity = () => {
    const { activeUsers, isLoading, error } = useActiveUsers();
    // const navigate = useNavigate();

    const handleFollow = (playerId) => {
        // Aquí iría la llamada a userService.followUser(playerId) (Requisito 1.7)
        console.log(`Siguiendo/Dejando de seguir al jugador ID: ${playerId}`);
    };

    return (
        <aside className="sidebar-community">
            <div className="sidebar-card">
                <h3>🔥 Jugadores Más Activos</h3>
                <p className="card-subtitle">Sigue a los que más contenido comparten (Req. 4.4).</p>

                {isLoading && <div className="loading-state"><FaSpinner className="spinner" /> Cargando jugadores...</div>}

                {error && <p className="error-message">{error}</p>}

                {/* Mensaje si no hay jugadores activos */}
                {!isLoading && activeUsers.length === 0 && (
                    <div className="no-content-message">
                        <FaUserCircle size={30} />
                        <p>Sé el primer jugador activo en publicar guías o posts.</p>
                    </div>
                )}

                <ul className="active-players-list">
                    {activeUsers.map(player => (
                        <li key={player.id} className="player-item">
                            <img src={player.avatarUrl || '/default-avatar.png'} alt={player.alias} className="player-avatar" />
                            <div className="player-details">
                                <span
                                    className="player-alias clickable-alias"
                                // onClick={() => navigate(`/profile/${player.id}`)}
                                >
                                    {player.alias}
                                </span>
                                <span className="player-score">Posts: {player.postsCount || 0}</span>
                            </div>
                            <button
                                onClick={() => handleFollow(player.id)}
                                className="btn-follow"
                            >
                                <FaUserPlus /> Seguir
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Sección de Publicidad/Guías Destacadas (Opcional) */}
            <div className="sidebar-card">
                <h3>⭐ Guías Destacadas</h3>
                <p className="card-subtitle">Encuentra las guías más votadas de la semana.</p>
            </div>
        </aside>
    );
};

export default SidebarCommunity;