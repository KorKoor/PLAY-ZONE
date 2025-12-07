// src/components/layout/Header.jsx
﻿
﻿import React, { useState } from 'react';
import './Header.css';
﻿// ⚠️ CORRECCIÓN: Añadir FaHeart y FaUserShield a la importación ⚠️
﻿import { FaSearch, FaBell, FaUserCircle, FaSignOutAlt, FaTachometerAlt, FaBookOpen, FaHeart, FaSun, FaMoon, FaUserShield } from 'react-icons/fa';
import useAuth from '../../hooks/useAuth';
﻿import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import useAdmin from '../../hooks/useAdmin';
import SearchSuggestions from '../common/SearchSuggestions';

const Header = () => {
    const { user, logout } = useAuth();
    const { isAdmin } = useAdmin();
    
    // Extraer el usuario real del objeto envuelto
    const actualUser = user?.user || user;
    
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { theme, toggleTheme } = useContext(ThemeContext);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
            setSearchTerm('');
            setShowSearchSuggestions(false);
        }
    };

    const handleSearchInputChange = (value) => {
        setSearchTerm(value);
        setShowSearchSuggestions(value.length > 0);
    };

    const handleSuggestionSelect = (suggestion) => {
        setSearchTerm('');
        setShowSearchSuggestions(false);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setShowSearchSuggestions(false);
    };
﻿
﻿    const handleLogout = () => {
﻿        logout();
﻿        navigate('/login');
﻿    };
﻿
﻿    return (
﻿        <header className="app-header">
﻿            <div className="header-content-wrapper">
﻿
﻿                {/* Logo y Navegación Principal (Izquierda) */}
﻿                <div className="header-left">
﻿                    <span
﻿                        className="app-logo"
﻿                        onClick={() => navigate('/home')}
﻿                        title="Ir al inicio"
﻿                    >
﻿                        PLAY-ZONE
﻿                    </span>
﻿
﻿                    <nav className="header-nav-links">
﻿                        <button onClick={() => navigate('/guides')} className="nav-link-btn" title="Guías del Jugador">
﻿                            <FaBookOpen /> Guías
﻿                        </button>
﻿                        <button onClick={() => navigate('/games')} className="nav-link-btn" title="Catálogo de Juegos">
﻿                            🎮 Juegos
﻿                        </button>
﻿                        <button onClick={() => navigate('/community')} className="nav-link-btn" title="Comunidad y Jugadores Activos">
﻿                            <FaTachometerAlt /> Comunidad
﻿                        </button>
﻿                    </nav>
﻿                </div>
﻿
﻿                {/* Barra de Búsqueda (Central, más prominente) */}
﻿                <div className="search-bar-container">
                    <form onSubmit={handleSearchSubmit} className="search-bar">
﻿                        <input
﻿                            type="text"
﻿                            placeholder="Buscar juegos, guías o jugadores..."
﻿                            value={searchTerm}
﻿                            onChange={(e) => handleSearchInputChange(e.target.value)}
                            onFocus={() => setShowSearchSuggestions(searchTerm.length > 0)}
                            onBlur={(e) => {
                                // Delay para permitir clicks en sugerencias
                                setTimeout(() => setShowSearchSuggestions(false), 200);
                            }}
﻿                        />
﻿                        <button type="submit" className="search-btn" title="Buscar"><FaSearch /></button>
﻿                    </form>

                    {showSearchSuggestions && (
                        <SearchSuggestions
                            searchTerm={searchTerm}
                            onSelect={handleSuggestionSelect}
                            onClear={handleClearSearch}
                        />
                    )}
                </div>
﻿
                {/* Perfil e Interacciones (Derecha) */}
                <div className="header-right">

                    <button className="icon-btn" title="Notificaciones"><FaBell /></button>

                    <button onClick={toggleTheme} className="icon-btn theme-toggle-btn" title="Cambiar tema">
                        {theme === 'light' ? <FaMoon /> : <FaSun />}
                    </button>﻿                    {/* Contenedor del Menú de Usuario (con Dropdown) */}
﻿                    <div className="user-menu-container">
                        <button
                            className="user-profile-btn"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            title={`Menú de ${actualUser?.alias || 'Usuario'}`}
                        >
                            <img
                                src={actualUser?.avatarUrl || '/default-avatar.svg'}
                                alt={actualUser?.alias || 'Usuario'}
                                className="user-avatar-small"
                            />
                            <span className="user-alias-header">{actualUser?.alias}</span>
﻿                        </button>
﻿
﻿                        {isMenuOpen && (
﻿                            <div className="user-dropdown-menu">
                                {/* Al hacer clic en Perfil, navegamos a la ruta dinámica */}
                                <button onClick={() => {
                                    const userId = actualUser?._id || actualUser?.id;
                                    
                                    if (userId) {
                                        navigate(`/profile/${userId}`);
                                    }
                                    setIsMenuOpen(false);
                                }}><FaUserCircle /> Mi Perfil</button>
                                <button onClick={() => { 
                                    setIsMenuOpen(false); 
                                    navigate('/favorites'); 
                                }}><FaHeart /> Favoritos</button>﻿                                {/* ENLACE DE ADMIN CONDICIONAL */}
﻿                                {isAdmin && (
﻿                                    <button onClick={() => { navigate('/admin'); setIsMenuOpen(false); }}><FaUserShield /> Panel Admin</button>
﻿                                )}﻿                                <button onClick={handleLogout} className="logout-btn"><FaSignOutAlt /> Cerrar Sesión</button>
﻿                            </div>
﻿                        )}
﻿                    </div>
﻿                </div>
﻿            </div>
﻿        </header>
﻿    );
﻿};
﻿
﻿export default Header;
﻿