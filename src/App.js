import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
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
import ProtectedRoute from './components/common/routes/ProtectedRoute';
import AdminRoute from './components/common/routes/AdminRoute';

// Importar estilos
import './styles/GlobalStyles.css';
import './styles/AuthStyles.css';
import './styles/HomeStyles.css';
import './styles/ProfileStyles.css';

function AppContent() {
    return (
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

                {/* Rutas Protegidas */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/home" element={<HomePage />} />
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