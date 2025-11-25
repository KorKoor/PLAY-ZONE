// src/components/layout/Header.jsx

import React, { useState } from 'react';
// ⚠️ CORRECCIÓN: Añadir FaHeart a la importación ⚠️
import { FaSearch, FaBell, FaUserCircle, FaSignOutAlt, FaTachometerAlt, FaBookOpen, FaHeart, FaSun, FaMoon } from 'react-icons/fa';
import { useAuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';

const Header = () => {
    const { user, logout } = useAuthContext();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { theme, toggleTheme } = useContext(ThemeContext);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
            setSearchTerm('');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="app-header">
            <div className="header-content-wrapper">

                {/* Logo y Navegación Principal (Izquierda) */}
                <div className="header-left">
                    <span
                        className="app-logo"
                        onClick={() => navigate('/home')}
                        title="Ir al inicio"
                    >
                        PLAY-ZONE
                    </span>

                    <nav className="header-nav-links">
                        <button onClick={() => navigate('/guides')} className="nav-link-btn" title="Guías del Jugador">
                            <FaBookOpen /> Guías
                        </button>
                        <button onClick={() => navigate('/community')} className="nav-link-btn" title="Comunidad y Jugadores Activos">
                            <FaTachometerAlt /> Comunidad
                        </button>
                    </nav>
                </div>

                {/* Barra de Búsqueda (Central, más prominente) */}
                <form onSubmit={handleSearchSubmit} className="search-bar">
                    <input
                        type="text"
                        placeholder="Buscar juegos, guías o jugadores..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button type="submit" className="search-btn" title="Buscar"><FaSearch /></button>
                </form>

                {/* Perfil e Interacciones (Derecha) */}
                <div className="header-right">

                    <button className="icon-btn" title="Notificaciones"><FaBell /></button>

                    <button onClick={toggleTheme} className="icon-btn theme-toggle-btn" title="Cambiar tema">
                        {theme === 'light' ? <FaMoon /> : <FaSun />}
                    </button>

                    {/* Contenedor del Menú de Usuario (con Dropdown) */}
                    <div className="user-menu-container">
                        <button
                            className="user-profile-btn"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            title={`Menú de ${user.alias}`}
                        >
                            <img
                                src={user.avatarUrl || '/default-avatar.svg'}
                                alt={user.alias}
                                className="user-avatar-small"
                            />
                            <span className="user-alias-header">{user.alias}</span>
                        </button>

                        {isMenuOpen && (
                            <div className="user-dropdown-menu">
                                {/* Al hacer clic en Perfil, navegamos a la ruta dinámica */}
                                <button onClick={() => navigate(`/profile/${user.id}`)}><FaUserCircle /> Mi Perfil</button>
                                {/* 🎯 FaHeart ahora está importado y funciona */}
                                <button onClick={() => navigate('/favorites')}><FaHeart /> Favoritos</button>
                                <button onClick={handleLogout} className="logout-btn"><FaSignOutAlt /> Cerrar Sesión</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;