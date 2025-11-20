// src/pages/ProfilePage.jsx
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import useProfile from '../hooks/useProfile';
import { useAuthContext } from '../context/AuthContext';
import userService from '../services/userService'; // ⚠️ NECESARIO PARA handleToggleFollow
import PostCard from '../components/posts/PostCard'; // Para renderizar publicaciones
import ProfileDetails from '../components/users/ProfileDetails'; // Componente de presentación
import ProfileEditModal from '../components/users/ProfileEditModal'; // Modal de edición
import { FaEdit, FaSpinner, FaUserPlus, FaUserMinus } from 'react-icons/fa';

const ProfilePage = () => {
    const { userId } = useParams();
    const { user: currentUser } = useAuthContext();
    const { profile, isLoading, error, fetchProfile, updateProfile } = useProfile(userId);
    const [isEditing, setIsEditing] = useState(false);

    const isCurrentUserProfile = currentUser && currentUser.id === userId;

    if (isLoading) {
        return (
            <div className="profile-loading-screen">
                <FaSpinner className="spinner" size={40} /> Cargando perfil...
            </div>
        );
    }

    if (error || !profile) {
        return <div className="error-message page-center">Error: {error || "Perfil no encontrado."}</div>;
    }

    // Función para manejar el seguimiento (Requisito 1.7)
    const handleToggleFollow = async () => {
        try {
            await userService.followUser(profile._id);
            fetchProfile();
        } catch (err) {
            console.error("Fallo al seguir/dejar de seguir:", err);
        }
    };

    return (
        <div className="profile-page-container">

            <ProfileDetails profile={profile}>
                <div className="profile-actions-bar">
                    {isCurrentUserProfile && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="btn btn-secondary edit-btn"
                        >
                            <FaEdit /> Editar Perfil
                        </button>
                    )}

                    {!isCurrentUserProfile && (
                        <button
                            onClick={handleToggleFollow}
                            className={`btn ${profile.isFollowing ? 'btn-unfollow' : 'btn-primary'}`}
                        >
                            {/* 🚀 CORRECCIÓN DEL ERROR DE SINTAXIS 🚀 */}
                            {profile.isFollowing ?
                                (<><FaUserMinus /> Dejar de Seguir</>) :
                                (<><FaUserPlus /> Seguir</>)
                            }
                        </button>
                    )}
                </div>
            </ProfileDetails>

            {/* Contenido: Publicaciones y Guías (Requisito 1.8) */}
            <div className="profile-content-section">
                <h3 className="section-title">Publicaciones Recientes ({profile.postsCount || 0})</h3>

                <div className="recent-posts-list">
                    {/* Nota: Necesitas el componente PostCard para que esto funcione */}
                    {profile.recentPosts && profile.recentPosts.length > 0 ? (
                        profile.recentPosts.map(post => (
                            <PostCard key={post._id} post={post} />
                        ))
                    ) : (
                        <div className="no-content-message">
                            Este jugador aún no ha creado ninguna publicación.
                        </div>
                    )}
                </div>

                <h3 className="section-title">Guías Recientes ({profile.guidesCount || 0})</h3>
                {/* Aquí iría el mapeo de profile.recentGuides */}
            </div>

            {/* Modal de Edición (Req. 1.3, 1.10) */}
            {isEditing && (
                <ProfileEditModal
                    user={profile}
                    onClose={() => setIsEditing(false)}
                    onSuccess={fetchProfile}
                    updateProfileHook={updateProfile}
                />
            )}
        </div>
    );
};

export default ProfilePage;