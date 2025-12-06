// src/components/routes/AdminRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import { isUserAdmin } from '../../../config/adminConfig';

const AdminRoute = () => {
  // 1. Obtenemos el usuario y el estado de carga desde el hook
  const { user, isLoading } = useAuth();

  // 2. Si está cargando, mostramos un mensaje y esperamos
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh',
        fontSize: '1.1rem',
        color: '#6b7280'
      }}>
        Verificando acceso de administrador...
      </div>
    );
  }

  // 3. Verificar que el usuario existe
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 4. Verificar que no esté baneado
  if (user.isBanned) {
    return <Navigate to="/" replace />;
  }

  // 5. Verificar si el usuario tiene permisos de administrador
  if (isUserAdmin(user)) {
    return <Outlet />; // ✅ Usuario autorizado como admin
  }

  // 6. Si no es admin, redirigir al home
  return <Navigate to="/" replace />;
};

export default AdminRoute;
