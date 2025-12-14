import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// 🚨 Importación de ThemeProvider ELIMINADA (ya no se usa el contexto de tema)
import { AuthProvider } from './context/AuthContext';
// 🚨 Hook de tema ELIMINADO (ya no se consume el tema)

// Importaciones de Páginas
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import GuidesPage from './pages/GuidesPage';
import GuideDetailPage from './pages/GuideDetailPage';
import FavoritesPage from './pages/FavoritesPage';
import CommunityPage from './pages/CommunityPage';
import GameCatalogPage from './pages/GameCatalogPage';
import GameDetailPage from './pages/GameDetailPage';
import AdminDashboard from './pages/AdminDashboard';
import PostDetailPage from './pages/PostDetailPage';
import SearchPage from './pages/SearchPage';

// Importaciones de Componentes de Rutas
import ProtectedRoute from './components/common/routes/ProtectedRoute';
import AdminRoute from './components/common/routes/AdminRoute';

// Importar estilos (Asegúrate de que GlobalStyles.css ahora FUERZA el Modo Oscuro)
import './styles/GlobalStyles.css';
import './styles/AuthStyles.css';
import './styles/HomeStyles.css';
import './styles/ProfileStyles.css';
import './styles/SearchPage.css';

/**
 * Componente que contiene la lógica de enrutamiento.
 * Ahora es más simple ya que no necesita consumir el contexto de tema.
 */
function AppContent() {
    return (
        // El fondo del Modo Oscuro se aplica mediante el GlobalStyles.css
        // que afecta al <body> y el CSS de los componentes que usan variables.
        <div className="App">
            <Routes>
                {/* Rutas de Autenticación */}
                <Route path="/login" element={<AuthPage />} />
                <Route path="/register" element={<AuthPage />} />
                <Route path="/auth" element={<Navigate to="/login" replace />} />

                {/* Ruta Protegida de Admin */}
                <Route element={<AdminRoute />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                </Route>

                {/* Rutas Protegidas (Requieren autenticación) */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/community" element={<CommunityPage />} />
                    <Route path="/games" element={<GameCatalogPage />} />
                    <Route path="/games/:gameId" element={<GameDetailPage />} />
                    <Route path="/posts/:postId" element={<PostDetailPage />} />
                    <Route path="/profile/:userId" element={<ProfilePage />} />
                    <Route path="/guides" element={<GuidesPage />} />
                    <Route path="/favorites" element={<FavoritesPage />} />
                    <Route path="/guides/:guideId" element={<GuideDetailPage />} />
                    <Route path="/" element={<Navigate to="/home" replace />} />
                </Route>

                {/* 404 */}
                <Route path="*" element={<div>404: Página No Encontrada</div>} />
            </Routes>
        </div>
    );
}

/**
 * Componente principal que define los contextos y el router.
 */
function App() {
    return (
        <AuthProvider>
            {/* 🚨 ThemeProvider ha sido ELIMINADO ya que el tema es fijo y global. */}
            <BrowserRouter>
                <AppContent />
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;