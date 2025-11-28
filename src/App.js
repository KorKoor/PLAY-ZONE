// src/App.jsx
import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// Nota: Asumimos que ThemeProvider y ThemeContext existen
import { ThemeProvider, ThemeContext } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
// 🚀 NUEVA IMPORTACIÓN NECESARIA 🚀
import GuidesPage from './pages/GuidesPage';
import ProtectedRoute from './components/common/routes/ProtectedRoute';

// Importar estilos
import './styles/GlobalStyles.css';
import './styles/AuthStyles.css';
import './styles/HomeStyles.css';
import './styles/ProfileStyles.css';

function AppContent() {
    // Nota: El tema no es necesario para el router, pero se mantiene por estructura
    const { theme } = useContext(ThemeContext);
    return (
        <div className="App" data-theme={theme}>
            <Routes>
                {/* 1. Rutas de Autenticación (Públicas) */}
                <Route path="/login" element={<AuthPage />} />
                <Route path="/register" element={<AuthPage />} />

                {/* 2. Rutas Protegidas (Requieren Login) */}
                <Route element={<ProtectedRoute />}>

                    {/* Ruta Principal: Feed (Requisito 4.3) */}
                    <Route path="/home" element={<HomePage />} />

                    {/* Ruta de Perfil (Requisito 1.8) */}
                    <Route path="/profile/:userId" element={<ProfilePage />} />

                    {/* 🚀 FIX CLAVE: RUTA DE GUÍAS (Requisito 3.3) 🚀 */}
                    <Route path="/guides" element={<GuidesPage />} />

                    {/* Ruta de Favoritos (Requisito 2.11) */}
                    <Route path="/favorites" element={<div>Página de Favoritos (Próximo Módulo)</div>} />

                    {/* Manejo de Rutas de Guía Individual (Ej: /guides/ver/123) */}
                    <Route path="/guides/:guideId" element={<div>Vista Detalle de Guía</div>} />

                    {/* Ruta Raíz (Redirige a /home si está logueado) */}
                    <Route path="/" element={<Navigate to="/home" replace />} />

                </Route>

                {/* 3. Catch-all para 404 (Opcional) */}
                <Route path="*" element={<div>404: Página No Encontrada</div>} />

            </Routes>
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <ThemeProvider>
                <BrowserRouter>
                    <AppContent />
                </BrowserRouter>
            </ThemeProvider>
        </AuthProvider>
    );
}

export default App;