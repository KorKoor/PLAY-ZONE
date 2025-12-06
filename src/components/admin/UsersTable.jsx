// src/components/admin/UsersTable.jsx
import React, { useState } from 'react';
import { FaBan, FaCheck, FaTrash, FaEye, FaEdit, FaUserShield, FaUser } from 'react-icons/fa';
import './UsersTable.css';

const UsersTable = ({ 
  users, 
  onBanUser, 
  onUnbanUser, 
  onDeleteUser, 
  onChangeRole, 
  onViewUser 
}) => {
  const [actionLoading, setActionLoading] = useState({});

  const validUsers = Array.isArray(users) ? users : [];

  const handleAction = async (action, userId, ...args) => {
    setActionLoading(prev => ({ ...prev, [userId]: true }));
    try {
      await action(userId, ...args);
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getUserId = (user) => user._id || user.id;

  return (
    <div className="users-table-wrapper">
      <div className="table-responsive">
        <table className="users-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {validUsers.length > 0 ? (
              validUsers.map((user) => {
                const userId = getUserId(user);
                const isLoading = actionLoading[userId];
                
                return (
                  <tr key={userId} className={user.isBanned ? 'banned-user' : ''}>
                    <td>
                      <div className="user-info">
                        <img
                          src={user.avatarUrl || '/default-avatar.svg'}
                          alt={user.alias}
                          className="user-avatar"
                        />
                        <div className="user-details">
                          <div className="user-name">{user.name || 'N/A'}</div>
                          <div className="user-alias">@{user.alias}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="user-email">{user.email}</span>
                    </td>
                    <td>
                      <div className="role-container">
                        <span className={`role-badge ${user.role}`}>
                          {user.role === 'admin' ? <FaUserShield /> : <FaUser />}
                          {user.role}
                        </span>
                        <select
                          className="role-select"
                          value={user.role}
                          onChange={(e) => handleAction(onChangeRole, userId, e.target.value)}
                          disabled={isLoading}
                        >
                          <option value="user">Usuario</option>
                          <option value="admin">Administrador</option>
                        </select>
                      </div>
                    </td>
                    <td>
                      <div className="status-container">
                        <span className={`status-badge ${user.isBanned ? 'banned' : 'active'}`}>
                          {user.isBanned ? 'Baneado' : 'Activo'}
                        </span>
                        {user.isBanned && user.banReason && (
                          <div className="ban-reason" title={user.banReason}>
                            Motivo: {user.banReason.substring(0, 30)}...
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="join-date">{formatDate(user.createdAt)}</span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn view"
                          onClick={() => onViewUser(user)}
                          title="Ver detalles"
                          disabled={isLoading}
                        >
                          <FaEye />
                        </button>
                        
                        {user.isBanned ? (
                          <button
                            className="action-btn unban"
                            onClick={() => handleAction(onUnbanUser, userId)}
                            title="Desbanear usuario"
                            disabled={isLoading}
                          >
                            <FaCheck />
                          </button>
                        ) : (
                          <button
                            className="action-btn ban"
                            onClick={() => {
                              const reason = prompt('Motivo del ban (opcional):');
                              if (reason !== null) {
                                handleAction(onBanUser, userId, reason);
                              }
                            }}
                            title="Banear usuario"
                            disabled={isLoading}
                          >
                            <FaBan />
                          </button>
                        )}
                        
                        <button
                          className="action-btn delete"
                          onClick={() => handleAction(onDeleteUser, userId)}
                          title="Eliminar usuario permanentemente"
                          disabled={isLoading}
                        >
                          <FaTrash />
                        </button>
                      </div>
                      
                      {isLoading && (
                        <div className="action-loading">
                          <div className="loading-dot"></div>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="no-users-message">
                  No se encontraron usuarios.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersTable;