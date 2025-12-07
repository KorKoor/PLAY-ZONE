// src/components/common/SearchSuggestions.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaUser, FaGamepad, FaFileAlt, FaBookOpen, FaTimes } from 'react-icons/fa';
import searchService from '../../services/searchService';
import './SearchSuggestions.css';

const SearchSuggestions = ({ searchTerm, onSelect, onClear }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const navigate = useNavigate();
    const suggestionRefs = useRef([]);

    useEffect(() => {
        if (searchTerm.length < 2) {
            setSuggestions([]);
            return;
        }

        const fetchSuggestions = async () => {
            setLoading(true);
            try {
                const response = await searchService.getSearchSuggestions(searchTerm);
                setSuggestions(response.suggestions || []);
            } catch (error) {
                console.error('Error fetching suggestions:', error);
                // Crear sugerencias básicas como fallback
                const basicSuggestions = [
                    { type: 'users', text: searchTerm, id: null },
                    { type: 'games', text: searchTerm, id: null },
                    { type: 'posts', text: searchTerm, id: null },
                    { type: 'guides', text: searchTerm, id: null }
                ];
                setSuggestions(basicSuggestions);
            } finally {
                setLoading(false);
            }
        };

        const debounceTimer = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(debounceTimer);
    }, [searchTerm]);

    const handleKeyDown = (e) => {
        if (suggestions.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev => 
                    prev < suggestions.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => 
                    prev > 0 ? prev - 1 : suggestions.length - 1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && suggestions[selectedIndex]) {
                    handleSuggestionClick(suggestions[selectedIndex]);
                } else {
                    handleSearchAll();
                }
                break;
            case 'Escape':
                onClear();
                break;
        }
    };

    const handleSuggestionClick = (suggestion) => {
        onSelect(suggestion.text);
        
        // Navegar directamente si es un resultado específico
        switch (suggestion.type) {
            case 'user':
                navigate(`/profile/${suggestion.id}`);
                break;
            case 'game':
                navigate(`/games/${suggestion.id}`);
                break;
            case 'post':
                navigate(`/posts/${suggestion.id}`);
                break;
            case 'guide':
                navigate(`/guides/${suggestion.id}`);
                break;
            default:
                navigate(`/search?q=${encodeURIComponent(suggestion.text)}&type=${suggestion.type || 'all'}`);
        }
    };

    const handleSearchAll = () => {
        navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
        onClear();
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'user':
                return <FaUser />;
            case 'game':
                return <FaGamepad />;
            case 'post':
                return <FaFileAlt />;
            case 'guide':
                return <FaBookOpen />;
            default:
                return <FaSearch />;
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'user':
                return 'Usuario';
            case 'game':
                return 'Juego';
            case 'post':
                return 'Publicación';
            case 'guide':
                return 'Guía';
            default:
                return 'Búsqueda';
        }
    };

    if (searchTerm.length < 2) return null;

    return (
        <div className="search-suggestions">
            {loading && (
                <div className="suggestion-loading">
                    <FaSearch className="spinner" />
                    <span>Buscando...</span>
                </div>
            )}

            {!loading && suggestions.length > 0 && (
                <div className="suggestions-list">
                    {/* Opción para buscar todo */}
                    <div 
                        className={`suggestion-item search-all ${selectedIndex === -1 ? 'selected' : ''}`}
                        onClick={handleSearchAll}
                        ref={el => suggestionRefs.current[-1] = el}
                    >
                        <div className="suggestion-icon">
                            <FaSearch />
                        </div>
                        <div className="suggestion-content">
                            <span className="suggestion-text">
                                Buscar "<strong>{searchTerm}</strong>" en todo
                            </span>
                            <span className="suggestion-type">Búsqueda completa</span>
                        </div>
                    </div>

                    <div className="suggestions-divider"></div>

                    {/* Sugerencias específicas */}
                    {suggestions.map((suggestion, index) => (
                        <div
                            key={`${suggestion.type}-${suggestion.id}-${index}`}
                            className={`suggestion-item ${selectedIndex === index ? 'selected' : ''}`}
                            onClick={() => handleSuggestionClick(suggestion)}
                            ref={el => suggestionRefs.current[index] = el}
                        >
                            <div className="suggestion-icon">
                                {getTypeIcon(suggestion.type)}
                            </div>
                            <div className="suggestion-content">
                                <span className="suggestion-text">
                                    {suggestion.text}
                                </span>
                                <span className="suggestion-type">
                                    {getTypeLabel(suggestion.type)}
                                    {suggestion.subtitle && ` • ${suggestion.subtitle}`}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && suggestions.length === 0 && (
                <div className="no-suggestions">
                    <div className="suggestion-item search-all" onClick={handleSearchAll}>
                        <div className="suggestion-icon">
                            <FaSearch />
                        </div>
                        <div className="suggestion-content">
                            <span className="suggestion-text">
                                Buscar "<strong>{searchTerm}</strong>"
                            </span>
                            <span className="suggestion-type">
                                No se encontraron sugerencias
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Instrucciones de teclado */}
            <div className="search-shortcuts">
                <span>↵ buscar</span>
                <span>↑↓ navegar</span>
                <span>esc cerrar</span>
            </div>
        </div>
    );
};

export default SearchSuggestions;