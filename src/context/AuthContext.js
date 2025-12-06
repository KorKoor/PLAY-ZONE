// src/context/AuthContext.js
import React, { createContext, useContext } from 'react';
import useAuth from '../hooks/useAuth';

const AuthContext = createContext();

export const useAuthContext = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const auth = useAuth();

    const contextValue = {
        user: auth.user,
        setUser: auth.setUser,   // 👈 ahora sí exponemos setUser
        isLoggedIn: auth.isLoggedIn,
        isLoading: auth.isLoading,
        login: auth.login,
        logout: auth.logout,
        checkUserStatus: auth.checkUserStatus, // Para verificar estado manualmente
    };

    // Si el usuario está baneado, mostrar mensaje y desloguearlo
    if (auth.user && auth.user.isBanned) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                padding: '2rem',
                textAlign: 'center',
                background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                color: '#991b1b'
            }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>🚫 Cuenta Suspendida</h1>
                <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem', maxWidth: '500px' }}>
                    Tu cuenta ha sido suspendida y no puedes acceder a la plataforma.
                </p>
                {auth.user.banReason && (
                    <p style={{ fontSize: '1rem', fontStyle: 'italic', marginBottom: '2rem', maxWidth: '400px' }}>
                        <strong>Motivo:</strong> {auth.user.banReason}
                    </p>
                )}
                <button
                    onClick={() => {
                        auth.logout();
                        window.location.reload();
                    }}
                    style={{
                        padding: '0.75rem 2rem',
                        background: '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        fontWeight: 600
                    }}
                >
                    Cerrar Sesión
                </button>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={contextValue}>
            {auth.isLoading ? <div>Cargando sesión...</div> : children}
        </AuthContext.Provider>
    );
};
