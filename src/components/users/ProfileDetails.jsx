// src/components/users/ProfileDetails.jsx
import React from 'react';
// Importamos FaCalendarAlt y FaStar para mostrar más estadisticas
import { FaUsers, FaUserPlus, FaGamepad, FaHeart, FaCalendarAlt, FaStar, FaHome } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

// Funcion utilitaria para formatear la fecha
const formatDate = (dateString) => {
    if (!dateString) return 'Desconocida';
    // Usamos 'en-US' (inglés) para evitar problemas de codificacion en el navegador
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};



const ProfileDetails = ({ profile, children }) => {
    const navigate = useNavigate();

    const displayAlias = profile.alias ? `@${profile.alias}` : 'Jugador Desconocido';

    // Verificacion de arrays para evitar errores de renderizado
    const favoriteCount = profile.favoritePosts ? profile.favoritePosts.length : 0;

    return (
        <div className="profile-details-card">
            <header className="profile-header">
                <img
                    src={profile.avatarUrl || '/default-avatar.svg'}
                    alt={`Avatar de ${profile.alias}`}
                    className="profile-avatar"
                    onError={(e) => {
                        if (e.target.src !== '/default-avatar.svg') {
                            e.target.onerror = null;
                            e.target.src = '/default-avatar.svg';
                        }
                    }}
                />
                <div className="header-info">
                    <h2 className="profile-alias">{displayAlias}</h2>
                    <p className="profile-name">{profile.name || 'Sin nombre registrado'}</p>

                    {/* Contadores y Estadisticas */}
                    <div className="profile-stats">
                        <span title="Seguidores"><FaUsers /> {profile.followersCount || 0} Seguidores</span>
                        <span title="Siguiendo"><FaUserPlus /> {profile.followingCount || 0} Siguiendo</span>
                        <span title="Publicaciones"><FaGamepad /> {profile.postsCount || 0} Posts</span>
                        {/* 🚀 Miembro Desde (Datos completados) 🚀 */}
                        <span title="Miembro Desde"><FaCalendarAlt /> Miembro desde: {formatDate(profile.createdAt)}</span>
                    </div>
                </div>

                {/* Botón en esquina superior derecha para volver al HomePage */}
                <button
                    className="btn-home-top-right"
                    onClick={() => navigate('/home')}
                    title="Volver al HomePage"
                >
                    <FaHome /> Home
                </button>
            </header>

            <div className="profile-body">
                <div className="profile-actions">
                    {children}
                </div>

                <div className="profile-bio">
                    <h3>Biografia</h3>
                    <p>{profile.description || 'Este jugador aun no ha escrito una biografia.'}</p>
                </div>

                <div className="profile-prefs">
                    {/* Consolas Favoritas */}
                    {profile.consoles && profile.consoles.length > 0 && (
                        <div className="pref-section">
                            <h4>Consolas Favoritas</h4>
                            <div className="tag-list">
                                {profile.consoles.map(c => <span key={c} className="tag tag-console">{c}</span>)}
                            </div>
                        </div>
                    )}
                    {/* Generos Favoritos */}
                    {profile.genres && profile.genres.length > 0 && (
                        <div className="pref-section">
                            <h4>Generos Favoritos</h4>
                            <div className="tag-list">
                                {profile.genres.map(g => <span key={g} className="tag tag-genre">{g}</span>)}
                            </div>
                        </div>
                    )}
                    {/* Interacciones (Posts Favoritos - Requisito 2.11) */}
                    {favoriteCount > 0 && (
                        <div className="pref-section">
                            <h4>Interacciones</h4>
                            <div className="tag-list">
                                <span className="tag tag-favorite"><FaHeart /> {favoriteCount} Posts Favoritos</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {/* Nota: Las secciones de Posts y Guías se renderizan en ProfilePage.jsx */}
        </div>
    );
};

export default ProfileDetails;