// src/components/posts/PostForm.jsx
import React, { useState } from 'react';
import postService from '../../services/postService';
import { FaStar, FaTimes, FaImage } from 'react-icons/fa';

const PostForm = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        gameTitle: '',
        description: '',
        rating: 0,
    });
    const [imageFile, setImageFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRatingChange = (newRating) => {
        setFormData({ ...formData, rating: newRating });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        if (!formData.gameTitle || formData.description.length < 10 || formData.rating === 0) {
            setError("Debes completar el título, dar una opinión mínima (10 chars) y una calificación.");
            setIsLoading(false);
            return;
        }

        try {
            const data = new FormData();
            data.append('gameTitle', formData.gameTitle);
            data.append('description', formData.description);
            data.append('rating', formData.rating);
            if (imageFile) {
                data.append('image', imageFile);
            }

            const newPost = await postService.createPost(data);
            onSuccess(newPost);
        } catch (err) {
            setError(err.message || 'Error al publicar el post. Verifica que la imagen sea válida.');
        } finally {
            setIsLoading(false);
        }
    };

    // Renderizado de estrellas con clases correctas
    const renderStarInput = () => (
        <div className="rating-input">
            {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                    key={star}
                    className={`star ${star <= formData.rating ? 'active' : ''}`}
                    onClick={() => handleRatingChange(star)}
                />
            ))}
        </div>
    );

    return (
        <div className="post-form-card">
            <button onClick={onClose} className="btn-close-modal" aria-label="Cerrar formulario">
                <FaTimes />
            </button>
            <h2>✍️ Crear Nueva Publicación</h2>
            <p>Comparte tu reseña, opinión y calificación de un juego.</p>

            <form onSubmit={handleSubmit}>
                {error && <p className="error-message">{error}</p>}

                <div className="form-group">
                    <label>Título del Videojuego</label>
                    <input
                        type="text"
                        name="gameTitle"
                        value={formData.gameTitle}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Imagen/Portada</label>
                    <label className="upload-image-btn">
                        <FaImage /> Seleccionar Imagen
                        <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleImageChange}
                        />
                    </label>
                    {imageFile && <p className="selected-file">📂 {imageFile.name}</p>}
                </div>

                <div className="form-group">
                    <label>Tu Opinión/Descripción</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        rows="4"
                    ></textarea>
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
