// src/components/common/routes/ProtectedRoute.jsx
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';

const ProtectedRoute = () => {
    // 1. Obtener el estado de la sesión
    const { isLoggedIn, isLoading, user, logout, checkUserStatus } = useAuth();
    const [isCheckingBan, setIsCheckingBan] = useState(false);

    // 2. Verificar estado de ban cuando el componente se monta o el usuario cambia
    useEffect(() => {
        const verifyUserStatus = async () => {
            if (isLoggedIn && user && !isLoading) {
                setIsCheckingBan(true);
                
                // Verificar si el usuario está baneado
                if (user.isBanned) {
                    const banMessage = user.banReason 
                        ? `Tu cuenta ha sido suspendida. Motivo: ${user.banReason}`
                        : 'Tu cuenta ha sido suspendida.';
                    
                    alert(banMessage);
                    logout();
                    setIsCheckingBan(false);
                    return;
                }

                // Verificar estado actualizado del usuario
                try {
                    await checkUserStatus();
                } catch (error) {
                    console.error('Error verificando estado del usuario en ProtectedRoute:', error);
                }
                
                setIsCheckingBan(false);
            }
        };

        verifyUserStatus();
    }, [isLoggedIn, user?.id, user?.isBanned, isLoading, checkUserStatus, logout]); // Incluir user como dependencia

    // 3. Si aún estamos cargando o verificando ban, mostramos un loader
    if (isLoading || isCheckingBan) {
        return <div className="loading-screen">Verificando sesión...</div>;
    }

    // 4. Si el usuario NO está logueado, lo redirigimos a la página de login.
    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    // 5. Si el usuario SÍ está logueado y no está baneado, renderizamos el contenido de la ruta hija
    return <Outlet />;
};

export default ProtectedRoute;