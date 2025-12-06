// src/components/routes/AdminRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import { isUserAdmin } from '../../../config/adminConfig';

const AdminRoute = () => {
  // 1. Obtenemos el usuario y el estado de carga desde el hook
  const { user, isLoading } = useAuth();

  console.log('🛡️ AdminRoute - Debug:');
  console.log('  - hasUser:', !!user);
  console.log('  - userEmail:', user?.email);
  console.log('  - isLoading:', isLoading);
  console.log('  - isAdmin:', user ? isUserAdmin(user) : false);
  console.log('  - user object:', user);

  // 2. Si está cargando, mostramos un mensaje y esperamos
  if (isLoading) {
    console.log('⏳ AdminRoute: Loading...');
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
    console.log('❌ AdminRoute: No user, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  // 4. Verificar que no esté baneado
  if (user.isBanned) {
    console.log('❌ AdminRoute: User banned, redirecting to home');
    return <Navigate to="/" replace />;
  }

  // 5. Verificar si el usuario tiene permisos de administrador
  if (isUserAdmin(user)) {
    console.log('✅ AdminRoute: User is admin, allowing access');
    return <Outlet />; // ✅ Usuario autorizado como admin
  }

  // 6. Si no es admin, redirigir al home
  console.log('❌ AdminRoute: User not admin, redirecting to home');
  return <Navigate to="/" replace />;
};

export default AdminRoute;
