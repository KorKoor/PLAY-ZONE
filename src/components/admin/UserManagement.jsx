// src/components/admin/UserManagement.jsx
import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaBan, FaUser, FaTrash, FaEdit, FaEye } from 'react-icons/fa';
import userService from '../../services/userService';
import adminService from '../../services/adminService';
import { useAuthContext } from '../../context/AuthContext'; // Importar contexto
import UsersTable from './UsersTable';
import UserDetailsModal from './UserDetailsModal';
import './UserManagement.css';

const UserManagement = () => {
    const { user: currentUser, checkUserStatus } = useAuthContext(); // Obtener usuario actual
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [users, searchTerm, roleFilter, statusFilter]);

    // Verificar si el usuario actual fue baneado cuando se actualiza la lista
    useEffect(() => {
        if (!currentUser || !Array.isArray(users) || users.length === 0) return;
        
        const currentUserId = currentUser.id || currentUser._id;
        const userInList = users.find(u => (u._id === currentUserId || u.id === currentUserId));
        
        if (userInList && userInList.isBanned && !currentUser.isBanned) {
            // El usuario actual fue baneado, verificar estado
            setTimeout(() => {
                checkUserStatus();
            }, 1000);
        }
    }, [users, currentUser, checkUserStatus]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await userService.getAllUsers();
            const userData = response.data || response || [];
            setUsers(Array.isArray(userData) ? userData : []);
            setError(null);
        } catch (err) {
            setError('No se pudo cargar la lista de usuarios. Inténtalo de nuevo más tarde.');
            console.error('Error fetching users:', err);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const filterUsers = () => {
        let filtered = users;

        // Filtro por término de búsqueda
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(user => 
                user.name?.toLowerCase().includes(search) ||
                user.alias?.toLowerCase().includes(search) ||
                user.email?.toLowerCase().includes(search)
            );
        }

        // Filtro por rol
        if (roleFilter !== 'all') {
            filtered = filtered.filter(user => user.role === roleFilter);
        }

        // Filtro por estado
        if (statusFilter !== 'all') {
            if (statusFilter === 'active') {
                filtered = filtered.filter(user => !user.isBanned);
            } else if (statusFilter === 'banned') {
                filtered = filtered.filter(user => user.isBanned);
            }
        }

        setFilteredUsers(filtered);
    };

    const handleBanUser = async (userId, reason = '') => {
        if (!window.confirm('¿Estás seguro de que quieres banear a este usuario?')) {
            return;
        }

        try {
            await adminService.banUser(userId, reason);
            
            setUsers(users.map(user => 
                user._id === userId || user.id === userId
                    ? { ...user, isBanned: true, banReason: reason }
                    : user
            ));

            // Verificar si se baneó al usuario actual
            const currentUserId = currentUser?.id || currentUser?._id;
            if (userId === currentUserId) {
                alert('Te has baneado a ti mismo. Serás desconectado.');
                setTimeout(() => {
                    checkUserStatus();
                }, 2000);
            } else {
                alert('Usuario baneado exitosamente');
            }
        } catch (err) {
            console.error('Error banning user:', err);
            
            // Mensaje más descriptivo basado en el tipo de error
            let errorMessage = 'Error al banear usuario';
            if (err.message.includes('403')) {
                errorMessage = 'No se puede banear: El usuario puede ser un administrador o no tienes permisos suficientes';
            } else if (err.message.includes('404')) {
                errorMessage = 'Usuario no encontrado';
            } else if (err.message.includes('400')) {
                errorMessage = 'Datos de ban inválidos';
            }
            
            alert(errorMessage);
        }
    };

    const handleUnbanUser = async (userId) => {
        if (!window.confirm('¿Estás seguro de que quieres desbanear a este usuario?')) {
            return;
        }

        try {
            await adminService.unbanUser(userId);
            setUsers(users.map(user => 
                user._id === userId || user.id === userId
                    ? { ...user, isBanned: false, banReason: null }
                    : user
            ));
            alert('Usuario desbaneado exitosamente');
        } catch (err) {
            console.error('Error unbanning user:', err);
            
            // Mensaje más descriptivo basado en el tipo de error
            let errorMessage = 'Error al desbanear usuario';
            if (err.message.includes('403')) {
                errorMessage = 'No se puede desbanear: Permisos insuficientes';
            } else if (err.message.includes('404')) {
                errorMessage = 'Usuario no encontrado';
            }
            
            alert(errorMessage);
        }
    };

    const handleDeleteUser = async (userId) => {
        const confirmText = 'ELIMINAR';
        const userInput = prompt(
            `¿Estás seguro de que quieres ELIMINAR permanentemente a este usuario?\n\n` +
            `Esta acción NO se puede deshacer. Todos los datos del usuario se perderán.\n\n` +
            `Escribe "${confirmText}" para confirmar:`
        );

        if (userInput !== confirmText) {
            return;
        }

        try {
            await adminService.deleteUser(userId);
            setUsers(users.filter(user => 
                user._id !== userId && user.id !== userId
            ));
            alert('Usuario eliminado exitosamente');
        } catch (err) {
            console.error('Error deleting user:', err);
            alert('Error al eliminar usuario');
        }
    };

    const handleChangeRole = async (userId, newRole) => {
        if (!window.confirm(`¿Cambiar el rol del usuario a "${newRole}"?`)) {
            return;
        }

        try {
            await adminService.changeUserRole(userId, newRole);
            setUsers(users.map(user => 
                user._id === userId || user.id === userId
                    ? { ...user, role: newRole }
                    : user
            ));
            alert('Rol cambiado exitosamente');
        } catch (err) {
            console.error('Error changing role:', err);
            alert('Error al cambiar rol');
        }
    };

    const handleViewUser = (user) => {
        setSelectedUser(user);
        setShowModal(true);
    };

    const getStats = () => {
        return {
            total: users.length,
            active: users.filter(u => !u.isBanned).length,
            banned: users.filter(u => u.isBanned).length,
            admins: users.filter(u => u.role === 'admin').length
        };
    };

    const stats = getStats();

    return (
        <div className="user-management">
            <div className="management-header">
                <h2>Gestión de Usuarios</h2>
                <p>Administra los usuarios registrados en la plataforma</p>
            </div>

            <div className="user-stats">
                <div className="stat-card total">
                    <div className="stat-number">{stats.total}</div>
                    <div className="stat-label">Total Usuarios</div>
                </div>
                <div className="stat-card active">
                    <div className="stat-number">{stats.active}</div>
                    <div className="stat-label">Activos</div>
                </div>
                <div className="stat-card banned">
                    <div className="stat-number">{stats.banned}</div>
                    <div className="stat-label">Baneados</div>
                </div>
                <div className="stat-card admins">
                    <div className="stat-number">{stats.admins}</div>
                    <div className="stat-label">Administradores</div>
                </div>
            </div>

            <div className="user-controls">
                <div className="search-section">
                    <div className="search-box">
                        <FaSearch />
                        <input
                            type="text"
                            placeholder="Buscar usuarios por nombre, alias o email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="filter-section">
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">Todos los roles</option>
                        <option value="user">Usuarios</option>
                        <option value="admin">Administradores</option>
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">Todos los estados</option>
                        <option value="active">Activos</option>
                        <option value="banned">Baneados</option>
                    </select>
                </div>
            </div>

            {loading && (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Cargando usuarios...</p>
                </div>
            )}

            {error && (
                <div className="alert alert-error">
                    {error}
                    <button onClick={fetchUsers} className="retry-btn">
                        Reintentar
                    </button>
                </div>
            )}

            {!loading && !error && (
                <div className="users-table-container">
                    {filteredUsers.length === 0 ? (
                        <div className="no-users">
                            <FaUser size={48} />
                            <h3>No se encontraron usuarios</h3>
                            <p>No hay usuarios que coincidan con los filtros aplicados.</p>
                        </div>
                    ) : (
                        <UsersTable 
                            users={filteredUsers}
                            onBanUser={handleBanUser}
                            onUnbanUser={handleUnbanUser}
                            onDeleteUser={handleDeleteUser}
                            onChangeRole={handleChangeRole}
                            onViewUser={handleViewUser}
                        />
                    )}
                </div>
            )}

            {showModal && selectedUser && (
                <UserDetailsModal
                    user={selectedUser}
                    onClose={() => {
                        setShowModal(false);
                        setSelectedUser(null);
                    }}
                    onBan={handleBanUser}
                    onUnban={handleUnbanUser}
                    onDelete={handleDeleteUser}
                    onChangeRole={handleChangeRole}
                />
            )}
        </div>
    );
};

export default UserManagement;
