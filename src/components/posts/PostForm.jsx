// src/components/posts/PostForm.jsx
import React, { useState } from 'react';
import postService from '../../services/postService';
import { FaStar, FaTimes } from 'react-icons/fa';

const PostForm = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        gameTitle: '',
        imageUrl: '',
        description: '',
        rating: 0,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRatingChange = (newRating) => {
        setFormData({ ...formData, rating: newRating });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        // Validación básica (Requisito 2.2)
        if (!formData.gameTitle || formData.description.length < 10 || formData.rating === 0) {
            setError("Debes completar el título, dar una opinión mínima (10 chars) y una calificación.");
            setIsLoading(false);
            return;
        }

        try {
            // Llama al servicio de creación (Requisito 2.1)
            const newPost = await postService.createPost(formData);

            onSuccess(newPost); // Cierra el modal e inserta el post en el feed
        } catch (err) {
            setError(err.message || 'Error al publicar el post. Verifica que la imagen sea válida.');
        } finally {
            setIsLoading(false);
        }
    };

    // Renderizado de estrellas para la calificación
    const renderStarInput = () => (
        <div className="rating-input">
            {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                    key={star}
                    className={star <= formData.rating ? 'star-filled' : 'star-empty'}
                    onClick={() => handleRatingChange(star)}
                />
            ))}
        </div>
    );

    return (
        <div className="post-form-card">
            <button onClick={onClose} className="btn-close-modal"><FaTimes /></button>
            <h2>✍️ Crear Nueva Publicación</h2>
            <p>Comparte tu reseña, opinión y calificación de un juego (Requisito 2.2).</p>

            <form onSubmit={handleSubmit}>
                {error && <p className="error-message">{error}</p>}

                <div className="form-group"><label>Título del Videojuego</label><input type="text" name="gameTitle" value={formData.gameTitle} onChange={handleChange} required /></div>

                <div className="form-group"><label>URL de Imagen/Portada</label><input type="url" name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="Ej: https://ejemplo.com/imagen.jpg" /></div>

                <div className="form-group">
                    <label>Tu Opinión/Descripción</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} required rows="4"></textarea>
                </div>

                <div className="form-group">
                    <label>Calificación (1-5 Estrellas)</label>
                    {renderStarInput()}
                </div>

                <button type="submit" disabled={isLoading} className="btn btn-primary">
                    {isLoading ? 'Publicando...' : 'Publicar en PLAY-ZONE'}
                </button>
            </form>
        </div>
    );
};

export default PostForm;