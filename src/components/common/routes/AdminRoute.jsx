// src/components/routes/AdminRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth'; // Verifica que esta ruta apunte a tu hook

const AdminRoute = () => {
  // 1. Obtenemos el usuario y el estado de carga desde el hook
  const { user, isLoading } = useAuth();

  // 2. Si está cargando, mostramos un mensaje y esperamos
  if (isLoading) {
    return <div>Verificando acceso de administrador...</div>;
  }

  // 3. LA REGLA DE ORO (una vez que no está cargando):
  // Si existe el usuario Y su rol es "admin", le dejamos pasar.
  if (user && user.role === 'admin') {
    return <Outlet />; // <--- ¡Pase usted, jefe!
  }

  // 5. Si no cumple, lo mandamos fuera
  return <Navigate to="/" replace />;
};

export default AdminRoute;
