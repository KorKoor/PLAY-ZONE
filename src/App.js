// src/App.jsx
import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, ThemeContext } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
// ⚠️ NUEVA IMPORTACIÓN ⚠️
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/common/routes/ProtectedRoute';

// Importar estilos
import './styles/GlobalStyles.css';
import './styles/AuthStyles.css';
import './styles/HomeStyles.css';
// ⚠️ NUEVA IMPORTACIÓN DE ESTILOS ⚠️
import './styles/ProfileStyles.css';

function AppContent() {
    const { theme } = useContext(ThemeContext);
    return (
        <div className="App" data-theme={theme}>
            <Routes>
                {/* 3. Rutas de Autenticación (Públicas) */}
                <Route path="/login" element={<AuthPage />} />
                <Route path="/register" element={<AuthPage />} />

                {/* 4. Rutas Protegidas (Requieren Login) */}
                <Route element={<ProtectedRoute />}>
                    {/* Ruta Principal: Home / Feed (Requisito 4.3) */}
                    <Route path="/home" element={<HomePage />} />

                    {/* 🚀 RUTA DE PERFIL (Requisito 1.8) 🚀 */}
                    <Route path="/profile/:userId" element={<ProfilePage />} />

                    {/* Aquí irían las demás rutas protegidas: /guides, etc. */}
                </Route>

                {/* 5. Ruta Raíz */}
                <Route
                    path="/"
                    element={<Navigate to="/home" replace />}
                />
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