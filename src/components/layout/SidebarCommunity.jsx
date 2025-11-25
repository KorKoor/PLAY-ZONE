// src/components/layout/SidebarCommunity.jsx
import React from 'react';
import useActiveUsers from '../../hooks/useActiveUsers'; // Hook para obtener los usuarios activos
import userService from '../../services/userService'; // Servicio para la acción de follow
import { FaUserPlus, FaUserCircle, FaSpinner, FaUserMinus, FaGamepad } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext'; // Para obtener el user logueado y su following list
// ⚠️ NECESARIO: Importar los estilos CSS específicos de la sidebar si los tienes ⚠️
// import '../../styles/SidebarCommunity.css'; 

const SidebarCommunity = () => {
    // Asumimos que activeUsers incluye el array 'following' en el currentUser
    const { activeUsers, isLoading, error, fetchActiveUsers } = useActiveUsers();
    const navigate = useNavigate();
    const { user: currentUser } = useAuthContext();

    // Función para manejar el seguimiento (Requisito 1.7)
    const handleFollow = async (player) => {
        const targetId = player._id || player.id; // ID del jugador objetivo

        try {
            // 1. Optimistic UI Update (Actualizar el estado del botón inmediatamente)
            // Ya que el hook useActiveUsers no maneja el estado de following globalmente, 
            // la mejor practica aqui es actualizar la API y luego forzar el refresco de la lista.
            await userService.followUser(targetId);

            // 2. Forzar el refresco para actualizar el estado del botón Seguir/Dejar de Seguir
            fetchActiveUsers();

        } catch (error) {
            console.error('Error al procesar el seguimiento:', error);
            // Opcional: Mostrar un error temporal en la UI
        }
    };

    // Función de navegación para el perfil
    const handleNavigateToProfile = (playerId) => {
        // Redirigir a la ruta dinámica del perfil
        navigate(`/profile/${playerId}`);
    };

    return (
        <aside className="sidebar-community">
            <div className="sidebar-card">
                <h3>🔥 Jugadores Mas Activos</h3>
                <p className="card-subtitle">Sigue a los que mas contenido comparten (Req. 4.4).</p>

                {/* Feedback de Carga y Error */}
                {isLoading && <div className="loading-state"><FaSpinner className="spinner" /> Cargando jugadores...</div>}
                {error && <p className="error-message">{error}</p>}

                {/* Mensaje si no hay jugadores activos */}
                {!isLoading && activeUsers.length === 0 && (
                    <div className="no-content-message">
                        <FaUserCircle size={30} />
                        <p>Se el primer jugador activo en publicar guias o posts.</p>
                    </div>
                )}

                {/* Lista de Jugadores Activos */}
                <ul className="active-players-list">
                    {activeUsers.map(player => {
                        // El hook useActiveUsers debe adjuntar el estado de 'isFollowing' 
                        // o lo calculamos localmente si el currentUser.following esta disponible
                        const isFollowing = player.isFollowing || false;
                        const isSelf = currentUser && (currentUser._id === player._id || currentUser.id === player._id);

                        return (
                            // ⚠️ CORRECCIÓN DE SINTAXIS Y KEY: Usar el _id de MongoDB ⚠️
                            <li key={player._id || player.id} className="player-item">

                                {/* NAVEGACION: Avatar clickeable */}
                                <img
                                    src={player.avatarUrl || '/default-avatar.png'}
                                    alt={player.alias}
                                    className="player-avatar"
                                    onClick={() => handleNavigateToProfile(player._id || player.id)}
                                />
                                <div className="player-details">
                                    {/* NAVEGACION: Alias clickeable */}
                                    <span
                                        className="player-alias clickable-alias"
                                        onClick={() => handleNavigateToProfile(player._id || player.id)}
                                    >
                                        {player.alias}
                                    </span>
                                    {/* Mostrar postsCount y followersCount si la API los envia */}
                                    <span className="player-score"><FaGamepad size={12} /> Posts: {player.postsCount || 0}</span>
                                </div>

                                {/* BOTON DE SEGUIMIENTO FUNCIONAL (Solo para otros usuarios) */}
                                {!isSelf && (
                                    <button
                                        onClick={() => handleFollow(player)}
                                        className={`btn-follow ${isFollowing ? 'unfollow-btn' : 'follow-btn'}`}
                                    >
                                        {/* ⚠️ CORRECCIÓN DE SINTAXIS JSX (el error anterior) ⚠️ */}
                                        {isFollowing ?
                                            (<><FaUserMinus /> Dejar de Seguir</>) :
                                            (<><FaUserPlus /> Seguir</>)
                                        }
                                    </button>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </div>

            <div className="sidebar-card">
                <h3>⭐ Guias Destacadas</h3>
                <p className="card-subtitle">Encuentra las guias mas votadas de la semana.</p>
            </div>
        </aside>
    );
};

export default SidebarCommunity;