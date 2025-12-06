// src/components/common/routes/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth'; // Import default, no destructuring

const ProtectedRoute = () => {
    // 1. Obtener el estado de la sesión
    const { isLoggedIn, isLoading } = useAuth();

    // 2. Si aún estamos cargando (ej. verificando el token), mostramos un loader
    if (isLoading) {
        return <div className="loading-screen">Verificando sesión...</div>;
    }

    // 3. Si el usuario NO está logueado, lo redirigimos a la página de login.
    if (!isLoggedIn) {
        return <Navigate to="/auth" replace />;
    }

    // 4. Si el usuario SÍ está logueado, renderizamos el contenido de la ruta hija
    return <Outlet />;
};

export default ProtectedRoute;