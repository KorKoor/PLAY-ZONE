// src/components/common/routes/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '../../../context/AuthContext'; // Importamos nuestro contexto

const ProtectedRoute = () => {
    // 1. Obtener el estado de la sesión
    const { isLoggedIn, isLoading } = useAuthContext();

    // 2. Si aún estamos cargando (ej. verificando el token), mostramos un loader
    if (isLoading) {
        return <div className="loading-screen">Verificando sesión...</div>;
    }

    // 3. Si el usuario NO está logueado, lo redirigimos a la página de login.
    if (!isLoggedIn) {
        // Usamos Navigate de React Router para redirigir
        // replace: true evita que el usuario regrese a esta página protegida con el botón 'atrás'
        return <Navigate to="/login" replace />;
    }

    // 4. Si el usuario SÍ está logueado, renderizamos el contenido de la ruta hija
    // Outlet se usa para renderizar los elementos anidados de la ruta protegida (ej. Home, Profile)
    return <Outlet />;
};

export default ProtectedRoute;