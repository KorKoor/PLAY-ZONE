// src/components/admin/UserManagement.jsx
import React, { useState, useEffect } from 'react';
import userService from '../../services/userService';
import UsersTable from './UsersTable'; // Importamos el nuevo componente de tabla
import styles from './UserManagement.module.css'; 

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Efecto para cargar los usuarios al montar el componente
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const data = await userService.getAllUsers();
                setUsers(data);
                setError(null);
            } catch (err) {
                setError('No se pudo cargar la lista de usuarios. Inténtalo de nuevo más tarde.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    if (loading) {
        return <p>Cargando usuarios...</p>;
    }

    if (error) {
        return <p className={styles.error}>{error}</p>;
    }

    return (
        <div className={styles.userManagementContainer}>
            <h3>Gestión de Usuarios</h3>
            <p>Total de usuarios registrados: {users.length}</p>
            <UsersTable users={users} />
        </div>
    );
};

export default UserManagement;
