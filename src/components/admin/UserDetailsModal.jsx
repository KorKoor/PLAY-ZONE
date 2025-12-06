// src/components/admin/UserDetailsModal.jsx
import React from 'react';
import { FaTimes, FaBan, FaCheck, FaTrash, FaUserShield, FaUser, FaEnvelope, FaCalendar, FaGamepad, FaComment, FaBookOpen } from 'react-icons/fa';
import './UserDetailsModal.css';

const UserDetailsModal = ({ user, onClose, onBan, onUnban, onDelete, onChangeRole }) => {
  if (!user) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUserId = () => user._id || user.id;

  const handleBan = () => {
    const reason = prompt('Motivo del ban (opcional):');
    if (reason !== null) {
      onBan(getUserId(), reason);
      onClose();
    }
  };

  const handleUnban = () => {
    if (window.confirm('¿Desbanear a este usuario?')) {
      onUnban(getUserId());
      onClose();
    }
  };

  const handleDelete = () => {
    const confirmText = 'ELIMINAR';
    const userInput = prompt(
      `¿Estás seguro de que quieres ELIMINAR permanentemente a este usuario?\n\n` +
      `Esta acción NO se puede deshacer.\n\n` +
      `Escribe "${confirmText}" para confirmar:`
    );

    if (userInput === confirmText) {
      onDelete(getUserId());
      onClose();
    }
  };

  const handleRoleChange = (newRole) => {
    if (window.confirm(`¿Cambiar el rol de ${user.alias} a "${newRole}"?`)) {
      onChangeRole(getUserId(), newRole);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="user-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Detalles del Usuario</h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-content">
          <div className="user-profile-section">
            <div className="user-avatar-large">
              <img
                src={user.avatarUrl || '/default-avatar.svg'}
                alt={user.alias}
              />
              <div className={`status-indicator ${user.isBanned ? 'banned' : 'active'}`}>
                {user.isBanned ? '🚫' : '✅'}
              </div>
            </div>

            <div className="user-main-info">
              <h3>{user.name || 'Sin nombre'}</h3>
              <p className="user-alias">@{user.alias}</p>
              <div className={`role-display ${user.role}`}>
                {user.role === 'admin' ? <FaUserShield /> : <FaUser />}
                {user.role === 'admin' ? 'Administrador' : 'Usuario'}
              </div>
            </div>
          </div>

          <div className="user-details-grid">
            <div className="detail-section">
              <h4>Información de Contacto</h4>
              <div className="detail-item">
                <FaEnvelope />
                <span className="detail-label">Email:</span>
                <span className="detail-value">{user.email}</span>
              </div>
            </div>

            <div className="detail-section">
              <h4>Información de la Cuenta</h4>
              <div className="detail-item">
                <FaCalendar />
                <span className="detail-label">Registro:</span>
                <span className="detail-value">{formatDate(user.createdAt)}</span>
              </div>
              <div className="detail-item">
                <FaCalendar />
                <span className="detail-label">Última actividad:</span>
                <span className="detail-value">{formatDate(user.lastActivity)}</span>
              </div>
            </div>

            {user.isBanned && (
              <div className="detail-section ban-info">
                <h4>Información del Ban</h4>
                <div className="detail-item">
                  <span className="detail-label">Fecha del ban:</span>
                  <span className="detail-value">{formatDate(user.banDate)}</span>
                </div>
                {user.banReason && (
                  <div className="detail-item">
                    <span className="detail-label">Motivo:</span>
                    <span className="detail-value ban-reason">{user.banReason}</span>
                  </div>
                )}
              </div>
            )}

            <div className="detail-section">
              <h4>Estadísticas de Actividad</h4>
              <div className="stats-grid">
                <div className="stat-item">
                  <FaComment />
                  <span className="stat-number">{user.postsCount || 0}</span>
                  <span className="stat-label">Publicaciones</span>
                </div>
                <div className="stat-item">
                  <FaBookOpen />
                  <span className="stat-number">{user.guidesCount || 0}</span>
                  <span className="stat-label">Guías</span>
                </div>
                <div className="stat-item">
                  <FaGamepad />
                  <span className="stat-number">{user.gamesCount || 0}</span>
                  <span className="stat-label">Juegos Favoritos</span>
                </div>
              </div>
            </div>
          </div>

          {user.bio && (
            <div className="detail-section">
              <h4>Biografía</h4>
              <p className="user-bio">{user.bio}</p>
            </div>
          )}
        </div>

        <div className="modal-actions">
          <div className="role-actions">
            <label htmlFor="role-select">Cambiar Rol:</label>
            <select
              id="role-select"
              value={user.role}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="role-select-modal"
            >
              <option value="user">Usuario</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div className="user-actions">
            {user.isBanned ? (
              <button className="action-btn unban" onClick={handleUnban}>
                <FaCheck /> Desbanear Usuario
              </button>
            ) : (
              <button className="action-btn ban" onClick={handleBan}>
                <FaBan /> Banear Usuario
              </button>
            )}

            <button className="action-btn delete" onClick={handleDelete}>
              <FaTrash /> Eliminar Usuario
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;