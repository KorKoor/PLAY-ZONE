// src/components/posts/PostForm.jsx (CÓDIGO FINAL Y MEJORADO)
import React, { useState, useRef } from 'react';
import '../../styles/Post.css';
import postService from '../../services/postService';
import { FaStar, FaTimes, FaImage, FaSpinner, FaCheckCircle } from 'react-icons/fa';

const PostForm = ({ onClose, onSuccess }) => {

    const fileInputRef = useRef(null);

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
        setFormData(prev => ({ ...prev, rating: newRating }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validacion basica del lado del cliente (Limite 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError("El archivo es demasiado grande (maximo 5MB).");
                setImageFile(null);
                return;
            }
            // Verifica el tipo de archivo (aunque Multer lo hace, es mejor hacer la validacion aqui)
            if (!file.type.startsWith('image/')) {
                setError("Solo se permiten archivos de imagen.");
                setImageFile(null);
                return;
            }
            setImageFile(file);
            setError(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        // Validacion de requisitos
        if (!formData.gameTitle || formData.description.length < 10 || formData.rating === 0) {
            setError("Debes completar el titulo, dar una opinion minima (10 chars) y una calificacion.");
            setIsLoading(false);
            return;
        }

        try {
            // Usamos FormData para enviar los datos JSON y el archivo binario
            const data = new FormData();
            data.append('gameTitle', formData.gameTitle);
            data.append('description', formData.description);
            data.append('rating', formData.rating);

            // 'image' debe coincidir con el campo esperado por Multer/Express
            if (imageFile) {
                data.append('image', imageFile);
            }

            // Llama a POST /api/v1/posts
            const newPost = await postService.createPost(data);

            // Llama a la funcion prop que actualiza el feed en HomePage
            onSuccess(newPost);
        } catch (err) {
            setError(err.message || 'Error al publicar el post. Verifica la conexion con la API.');
        } finally {
            setIsLoading(false);
        }
    };

    // Renderizado de estrellas (UX)
    const renderStarInput = () => (
        <div className="rating-input">
            {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                    key={star}
                    className={`star-icon ${star <= formData.rating ? 'active' : ''}`}
                    onClick={() => handleRatingChange(star)}
                />
            ))}
        </div>
    );

    // Helper para spinner
    const Spinner = () => <FaSpinner className="spinner" />;

    return (
        <div className="post-form-card">
            <button onClick={onClose} className="btn-close-modal" aria-label="Cerrar formulario">
                <FaTimes />
            </button>
            <h2>✍️ Crear Nueva Publicacion</h2>
            <p className="form-subtitle">Comparte tu reseña, opinion y calificacion de un juego.</p>

            <form onSubmit={handleSubmit}>
                {error && <p className="error-message">{error}</p>}

                <div className="form-group">
                    <label htmlFor="gameTitle">Titulo del Videojuego</label>
                    <input
                        type="text"
                        id="gameTitle"
                        name="gameTitle"
                        value={formData.gameTitle}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* === ZONA DE IMAGEN MEJORADA === */}
                <div className="form-group upload-group">
                    <label>Imagen/Portada (Opcional)</label>

                    {/* Input de archivo real (oculto) */}
                    <input
                        type="file"
                        accept="image/jpeg, image/png, image/webp"
                        style={{ display: 'none' }}
                        onChange={handleImageChange}
                        ref={fileInputRef}
                    />

                    {/* Boton visual que activa el input de archivo */}
                    <button type="button"
                        onClick={() => fileInputRef.current.click()}
                        className="btn btn-secondary btn-upload-file">
                        <FaImage /> {imageFile ? 'Cambiar Imagen' : 'Seleccionar Imagen'}
                    </button>

                    {/* Feedback del archivo seleccionado */}
                    {imageFile && (
                        <p className="selected-file-name">
                            <FaCheckCircle /> {imageFile.name}
                        </p>
                    )}
                </div>
                {/* === FIN ZONA DE IMAGEN === */}

                <div className="form-group">
                    <label htmlFor="description">Tu Opinion/Descripcion</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        rows="5"
                        placeholder="Cuentanos que te parecio este juego, y porque lo calificaste asi."
                    ></textarea>
                </div>

                <div className="form-group rating-group">
                    <label>Calificacion (1-5 Estrellas)</label>
                    {renderStarInput()}
                </div>

                <button type="submit" disabled={isLoading} className="btn btn-primary btn-publish">
                    {isLoading ? <><Spinner /> Publicando...</> : 'Publicar en PLAY-ZONE'}
                </button>
            </form>
        </div>
    );
};

export default PostForm;