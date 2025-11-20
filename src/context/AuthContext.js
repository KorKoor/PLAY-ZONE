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
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {auth.isLoading ? <div>Cargando sesión...</div> : children}
        </AuthContext.Provider>
    );
};
