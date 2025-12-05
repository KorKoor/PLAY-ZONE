// src/components/admin/UsersTable.jsx
import React from 'react';

const UsersTable = ({ users }) => {
  // Verificación de seguridad: si 'users' no es un array, usamos uno vacío para evitar errores.
  const validUsers = Array.isArray(users) ? users : [];

  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover">
        <thead className="thead-dark">
          <tr>
            <th scope="col">Nombre</th>
            <th scope="col">Alias</th>
            <th scope="col">Email</th>
            <th scope="col">Rol</th>
          </tr>
        </thead>
        <tbody>
          {validUsers.length > 0 ? (
            validUsers.map((user) => (
              <tr key={user._id || user.id}>
                <td>{user.name || 'N/A'}</td>
                <td>{user.alias}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`badge ${user.role === 'admin' ? 'bg-primary' : 'bg-secondary'}`}>
                    {user.role}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center">No se encontraron usuarios.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UsersTable;