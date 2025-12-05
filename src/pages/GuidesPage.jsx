// src/pages/GuidesPage.jsx

import React, { useState } from 'react';
import useGuides from '../hooks/useGuides'; // Hook para la lógica de guias
import GuideForm from '../components/guides/GuideForm'; // Formulario modal
import GuideCard from '../components/guides/GuideCard'; // Componente de tarjeta
import Header from '../components/layout/Header'; // Header ya existente
import '../styles/guideStyles.css';
import { FaBookOpen, FaFilter, FaPlusCircle, FaSpinner, FaSearch } from 'react-icons/fa'; // Iconos

const GuidesPage = () => {
    // Extraer lógica y estados del custom hook
    const {
        guides,
        isLoading,
        error,
        filters,
        applyFilters,
        fetchMore,
        handleToggleUseful // Funcion para marcar como util (Req. 3.8)
    } = useGuides();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Manejadores de Filtro y Ordenamiento
    const handleSortChange = (e) => {
        applyFilters({ sortBy: e.target.value });
    };

    // Maneja la busqueda enviada desde el Header
    const handleSearch = (term) => {
        applyFilters({ search: term });
    };

    // Llama al hook que maneja la inserción de la nueva guia
    const handleGuideCreated = (newGuide) => {
        // En una app real, addNewGuide se implementaria en el hook useGuides
        // Para fines de esta implementacion, forzamos un reset al feed
        applyFilters({});
        setIsFormOpen(false);
    };

    const handleViewDetails = (guideId) => {
        // Logica para navegar a la pagina de detalle de la guia (Ej: /guides/123)
        console.log(`Navegar a la guia de detalle: /guides/${guideId}`);
        // navigate(`/guides/${guideId}`); 
    };


    return (
        <div className="guides-page-container">
            {/* El Header ya incluye la barra de búsqueda y la navegación */}
            <Header onSearch={handleSearch} />

            <main className="guides-main-content">
                <header className="guides-header">
                    <h1><FaBookOpen /> Guías del Jugador</h1>
                    <button onClick={() => setIsFormOpen(true)} className="btn btn-primary" disabled={isLoading}>
                        <FaPlusCircle /> Crear Guía
                    </button>
                </header>

                {/* Controles de Filtro y Ordenamiento (Req. 3.7) */}
                <div className="guides-controls">
                    <div className="sort-controls">
                        <FaFilter />
                        <label htmlFor="sort-by">Ordenar por:</label>
                        <select id="sort-by" value={filters.sortBy} onChange={handleSortChange}>
                            <option value="date">Más Recientes</option>
                            <option value="popularity">Más Útiles</option>
                        </select>
                    </div>
                    {/* Placeholder para barra de busqueda local si el Header no es suficiente */}
                    {/* <div className="local-search-control"><FaSearch /> <input type="text" placeholder="Buscar en guias..." /></div> */}
                </div>

                {/* Listado de Guías */}
                <section className="guides-list-section">
                    {isLoading && guides.length === 0 && <div className="loading-message"><FaSpinner className="spinner" /> Cargando guías...</div>}
                    {error && <p className="error-message">{error}</p>}

                    <div className="guides-list">
                        {/* ⚠️ Mapeo de Guías (Req. 3.3) ⚠️ */}
                        {guides.map(guide => (
                            <GuideCard
                                key={guide._id}
                                guide={guide}
                                onToggleUseful={handleToggleUseful} // Pasa la funcion de interaccion
                                onViewDetails={handleViewDetails} // Pasa la funcion de navegacion
                            />
                        ))}
                    </div>

                    {/* Mensaje de No Contenido */}
                    {!isLoading && guides.length === 0 && !error && (
                        <div className="no-guides-message">
                            No se encontraron guías. Sé el primero en compartir tu conocimiento.
                        </div>
                    )}

                    {/* Botón de Cargar Más (Paginación) */}
                    {!isLoading && guides.length > 0 && (
                        <button onClick={fetchMore} className="btn btn-secondary btn-load-more">
                            Cargar Más Guías
                        </button>
                    )}
                </section>
            </main>

            {/* Modal de Creación */}
            {isFormOpen && (
                <div className="modal-overlay">
                    <GuideForm onClose={() => setIsFormOpen(false)} onSuccess={handleGuideCreated} />
                </div>
            )}
        </div>
    );
};

export default GuidesPage;