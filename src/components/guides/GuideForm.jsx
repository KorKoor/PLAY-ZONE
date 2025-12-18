// src/components/guides/GuideForm.jsx

import React, { useState, useEffect } from 'react';
import guideService from '../../services/guideService';
import gameService from '../../services/gameService';
import { FaTimes, FaSave, FaPlus, FaMinus, FaSpinner, FaEdit } from 'react-icons/fa';

const GuideForm = ({ guideToEdit, onClose, onSuccess }) => {
    const [title, setTitle] = useState('');
    const [game, setGame] = useState('');
    const [description, setDescription] = useState('');
    const [descriptionError, setDescriptionError] = useState(null);
    const [steps, setSteps] = useState([{ stepNumber: 1, content: '' }]);
    
    const [games, setGames] = useState([]);
    const [isLoadingGames, setIsLoadingGames] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const isEditMode = Boolean(guideToEdit);

    // Cargar catálogo de juegos
    useEffect(() => {
        const fetchGames = async () => {
            try {
                const gamesData = await gameService.getGames();
                setGames(gamesData);
            } catch (err) {
                console.error("No se pudo cargar el catálogo de juegos:", err);
                setError("No se pudo cargar el catálogo de juegos.");
            } finally {
                setIsLoadingGames(false);
            }
        };
        fetchGames();
    }, []);

    // Popular formulario si estamos en modo edición
    useEffect(() => {
        if (isEditMode) {
            setTitle(guideToEdit.title);
            setGame(guideToEdit.game);
            setDescription(guideToEdit.description);
            setSteps(guideToEdit.steps.length > 0 ? guideToEdit.steps : [{ stepNumber: 1, content: '' }]);
        }
    }, [guideToEdit, isEditMode]);

    const handleStepChange = (index, value) => {
        const newSteps = steps.map((step, i) => i === index ? { ...step, content: value } : step);
        setSteps(newSteps);
    };

    const handleAddStep = () => {
        setSteps([...steps, { stepNumber: steps.length + 1, content: '' }]);
    };

    const handleRemoveStep = (index) => {
        if (steps.length > 1) {
            setSteps(steps.filter((_, i) => i !== index).map((step, i) => ({ ...step, stepNumber: i + 1 })));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setDescriptionError(null); // Clear description specific error
        setIsLoading(true);

        let isValid = true;
        if (!title.trim()) {
            setError("El título de la guía es obligatorio.");
            isValid = false;
        }
        if (!game) {
            if (isValid) setError("El juego es obligatorio."); // Solo establece si no hay un error previo
            else setError(prev => prev + " El juego es obligatorio.");
            isValid = false;
        }
        if (description.length < 30) {
            setDescriptionError("La descripción debe tener al menos 30 caracteres.");
            isValid = false;
        }
        if (steps.some(step => !step.content.trim())) {
            if (isValid) setError("Todos los pasos deben tener contenido."); // Solo establece si no hay un error previo
            else setError(prev => prev + " Todos los pasos deben tener contenido.");
            isValid = false;
        }

        if (!isValid) {
            setIsLoading(false);
            return;
        }

        const guideData = { title, game, description, steps };

        try {
            let result;
            if (isEditMode) {
                // Llama a PUT /api/v1/guides/:id (Req. 3.6)
                result = await guideService.updateGuide(guideToEdit._id, guideData);
            } else {
                // Llama a POST /api/v1/guides (Req. 3.1)
                result = await guideService.createGuide(guideData);
            }
                        if (result) {
                onSuccess(result);
                onClose();
            } else {
                setError(`No se pudo ${isEditMode ? 'actualizar' : 'crear'} la guía. El servidor no devolvió datos válidos.`);
            }
        } catch (err) {
            setError(err.message || `Error al ${isEditMode ? 'actualizar' : 'crear'} la guía.`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="guide-form-modal">
            <button onClick={onClose} className="btn-close-modal"><FaTimes /></button>
            <h2>{isEditMode ? '✍️ Editar Guía' : '✍️ Crear Nueva Guía'}</h2>
            <p className="form-subtitle">{isEditMode ? 'Realiza los cambios necesarios en tu guía.' : 'Detalla los pasos para ayudar a otros jugadores.'}</p>

            <form onSubmit={handleSubmit} className="guide-form">
                {error && <p className="error-message">{error}</p>}

                <div className="form-group"><label>Título de la Guía</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
                
                <div className="form-group">
                    <label>Juego al que Pertenece</label>
                    <select value={game} onChange={(e) => setGame(e.target.value)} required disabled={isLoadingGames}>
                        <option value="">{isLoadingGames ? 'Cargando...' : 'Selecciona un juego'}</option>
                        {games.map(g => (
                            <option key={g._id || g.name} value={g.name}>{g.name}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Introducción/Descripción General</label>
                    <textarea value={description} onChange={(e) => {
                        setDescription(e.target.value);
                        if (descriptionError) setDescriptionError(null);
                    }} rows="4" required />
                    {descriptionError && <p className="error-message">{descriptionError}</p>}
                </div>

                <h4 className="steps-title">Pasos ({steps.length})</h4>
                <div className="steps-list">
                    {steps.map((step, index) => (
                        <div key={index} className="step-item">
                            <label>Paso {index + 1}</label>
                            <textarea value={step.content} onChange={(e) => handleStepChange(index, e.target.value)} rows="3" required />
                            {steps.length > 1 && (
                                <button type="button" onClick={() => handleRemoveStep(index)} className="btn-remove-step"><FaMinus /></button>
                            )}
                        </div>
                    ))}
                    <button type="button" onClick={handleAddStep} className="btn-add-step"><FaPlus /> Añadir Paso</button>
                </div>

                <button type="submit" disabled={isLoading} className="btn btn-primary btn-publish">
                    {isLoading ? <FaSpinner className="spinner" /> : (isEditMode ? <FaEdit /> : <FaSave />)}
                    {isEditMode ? ' Actualizar Guía' : ' Guardar Guía'}
                </button>
            </form>
        </div>
    );
};

export default GuideForm;