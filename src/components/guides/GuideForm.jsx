// src/components/guides/GuideForm.jsx

import React, { useState } from 'react';
import guideService from '../../services/guideService';
import { FaTimes, FaSave, FaPlus, FaMinus, FaSpinner } from 'react-icons/fa';

const GuideForm = ({ onClose, onSuccess }) => {
    const [title, setTitle] = useState('');
    const [game, setGame] = useState('');
    const [description, setDescription] = useState('');
    // Estado para manejar la lista de pasos (Req. 3.2)
    const [steps, setSteps] = useState([{ stepNumber: 1, content: '' }]);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleStepChange = (index, value) => {
        const newSteps = steps.map((step, i) =>
            i === index ? { ...step, content: value } : step
        );
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
        setIsLoading(true);

        // Validación de contenido mínimo
        if (!title.trim() || !game.trim() || description.length < 30 || steps.some(step => !step.content.trim())) {
            setError("Por favor, completa el título, el juego, la descripción y asegúrate de que todos los pasos tengan contenido.");
            setIsLoading(false);
            return;
        }

        try {
            const guideData = {
                title,
                game,
                description,
                steps,
            };

            // Llama a POST /api/v1/guides (Req. 3.1)
            const newGuide = await guideService.createGuide(guideData);

            onSuccess(newGuide);
            onClose();
        } catch (err) {
            setError(err.message || 'Error al crear la guía. Verifica el contenido.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="guide-form-modal">
            <button onClick={onClose} className="btn-close-modal"><FaTimes /></button>
            <h2>✍️ Crear Nueva Guía</h2>
            <p className="form-subtitle">Detalla los pasos para ayudar a otros jugadores.</p>

            <form onSubmit={handleSubmit} className="guide-form">
                {error && <p className="error-message">{error}</p>}

                {/* Campos Principales */}
                <div className="form-group"><label>Título de la Guía</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
                <div className="form-group"><label>Juego al que Pertenece</label><input type="text" value={game} onChange={(e) => setGame(e.target.value)} required /></div>
                <div className="form-group"><label>Introducción/Descripción General</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="4" required /></div>

                {/* Pasos de la Guía (Array Dinámico) */}
                <h4 className="steps-title">Pasos ({steps.length})</h4>
                <div className="steps-list">
                    {steps.map((step, index) => (
                        <div key={index} className="step-item">
                            <label>Paso {index + 1}</label>
                            <textarea
                                value={step.content}
                                onChange={(e) => handleStepChange(index, e.target.value)}
                                rows="3"
                                required
                            />
                            {steps.length > 1 && (
                                <button type="button" onClick={() => handleRemoveStep(index)} className="btn-remove-step">
                                    <FaMinus />
                                </button>
                            )}
                        </div>
                    ))}
                    <button type="button" onClick={handleAddStep} className="btn-add-step">
                        <FaPlus /> Añadir Paso
                    </button>
                </div>

                <button type="submit" disabled={isLoading} className="btn btn-primary btn-publish">
                    {isLoading ? <FaSpinner className="spinner" /> : <FaSave />} Guardar Guía
                </button>
            </form>
        </div>
    );
};

export default GuideForm;