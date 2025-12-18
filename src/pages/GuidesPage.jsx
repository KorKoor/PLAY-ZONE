// src/pages/GuidesPage.jsx

import React, { useState } from 'react';
import useGuides from '../hooks/useGuides';
import useAuth from '../hooks/useAuth'; // Importar hook de autenticación
import guideService from '../services/guideService'; // Importar el servicio
import GuideForm from '../components/guides/GuideForm';
import GuideCard from '../components/guides/GuideCard';
import Header from '../components/layout/Header';
import '../styles/guideStyles.css';
import { FaBookOpen, FaFilter, FaPlusCircle, FaSpinner } from 'react-icons/fa';

const GuidesPage = () => {


    const { 
        guides,
        isLoading,
        error,
        filters,
        applyFilters,
        fetchMore,
        handleToggleUseful,
        addNewGuide,
        removeGuide,
        updateGuideInList
    } = useGuides();

    const { user } = useAuth(); // Obtener el usuario actual

    // Mostrar todas las guías en la consola para depuración (después de la declaración de guides)
    React.useEffect(() => {
        if (guides && guides.length > 0) {
            // eslint-disable-next-line no-console
            console.log('📚 Guías recibidas:', JSON.stringify(guides, null, 2));
        }
    }, [guides]);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingGuide, setEditingGuide] = useState(null); // Estado para la guía en edición

    const handleSearch = (term) => {
        applyFilters({ search: term });
    };

    const handleSortChange = (e) => {
        applyFilters({ sortBy: e.target.value });
    };

    // Abre el formulario para crear una nueva guía
    const handleCreateClick = () => {
        setEditingGuide(null);
        setIsFormOpen(true);
    };

    // Abre el formulario para editar una guía existente
    const handleEditClick = (guide) => {
        setEditingGuide(guide);
        setIsFormOpen(true);
    };

    // Cierra el formulario
    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingGuide(null);
    };

    // Se llama cuando el formulario se envía con éxito
    const handleFormSuccess = (guide) => {
        if (editingGuide) {
            updateGuideInList(guide); // Actualiza la guía en la lista
        } else {
            addNewGuide(guide); // Añade la nueva guía a la lista
        }
        handleCloseForm();
    };
    
    // Manejador para eliminar una guía (Req. 3.6)
    const handleDeleteClick = async (guideId) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta guía? Esta acción es irreversible.')) {
            try {
                await guideService.deleteGuide(guideId);
                removeGuide(guideId); // Elimina la guía del estado local
            } catch (err) {
                alert('Error al eliminar la guía. Por favor, inténtalo de nuevo.');
                console.error(err);
            }
        }
    };

    return (
        <div className="guides-page-container">
            <Header onSearch={handleSearch} />

            <main className="guides-main-content">
                <header className="guides-header">
                    <h1><FaBookOpen /> Guías del Jugador</h1>
                    <button onClick={handleCreateClick} className="btn btn-primary" disabled={isLoading}>
                        <FaPlusCircle /> Crear Guía
                    </button>
                </header>

                <div className="guides-controls">
                    <div className="sort-controls">
                        <FaFilter />
                        <label htmlFor="sort-by">Ordenar por:</label>
                        <select id="sort-by" value={filters.sortBy} onChange={handleSortChange}>
                            <option value="date">Más Recientes</option>
                            <option value="popularity">Más Útiles</option>
                        </select>
                    </div>
                </div>

                <section className="guides-list-section">
                    {isLoading && guides.length === 0 && <div className="loading-message"><FaSpinner className="spinner" /> Cargando guías...</div>}
                    {error && <p className="error-message">{error}</p>}

                    <div className="guides-list">
                        {guides.map(guide => (
                            <GuideCard
                                key={guide._id}
                                guide={guide}
                                currentUser={user} // Pasar el usuario para verificar la autoría
                                onToggleUseful={handleToggleUseful}
                                onEdit={() => handleEditClick(guide)} // Pasar la función de edición
                                onDelete={() => handleDeleteClick(guide._id)} // Pasar la función de eliminación
                            />
                        ))}
                    </div>

                    {!isLoading && guides.length === 0 && !error && (
                        <div className="no-guides-message">
                            No se encontraron guías. Sé el primero en compartir tu conocimiento.
                        </div>
                    )}

                    {!isLoading && guides.length > 0 && (
                        <button onClick={fetchMore} className="btn btn-secondary btn-load-more">
                            Cargar Más Guías
                        </button>
                    )}
                </section>
            </main>

            {isFormOpen && (
                <div className="modal-overlay">
                    <GuideForm
                        guideToEdit={editingGuide}
                        onClose={handleCloseForm}
                        onSuccess={handleFormSuccess}
                    />
                </div>
            )}
        </div>
    );
};

export default GuidesPage;