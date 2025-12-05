import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import userService from '../services/userService'; // Importamos el servicio
import UsersTable from '../components/admin/UsersTable'; // Importamos la tabla

const AdminDashboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        // Llamamos a la nueva función del servicio
        const response = await userService.getUsers();
        // Verificamos que la respuesta y data existan y sean un array
        if (response && Array.isArray(response.data)) {
          setUsers(response.data); // Guardamos solo el array de usuarios
        } else {
          // Si la estructura no es la esperada, lo registramos y dejamos la tabla vacía
          console.error("La respuesta de la API no tiene el formato esperado:", response);
          setUsers([]);
        }
        setError(null);
      } catch (err) {
        setError('No se pudo cargar la lista de usuarios. Inténtalo de nuevo más tarde.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []); // El array vacío asegura que se ejecute solo una vez

  return (
    <div className="container mt-5">
      <div className="card border-primary mb-3">
        <div className="card-header bg-primary text-white">
          Panel de Administración
        </div>
        <div className="card-body">
          <h2 className="card-title">¡Bienvenido, Jefe {user?.alias || user?.name}!</h2>
          <p className="card-text">Desde aquí puedes gestionar los usuarios de la plataforma.</p>
          <hr />
          
          {loading && <p>Cargando lista de usuarios...</p>}
          {error && <div className="alert alert-danger">{error}</div>}
          
          {!loading && !error && (
            <>
              <h4>Usuarios Registrados</h4>
              <UsersTable users={users} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;