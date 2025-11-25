// src/components/posts/CommentForm.jsx

import React, { useState } from 'react';
import { FaPaperPlane, FaSpinner } from 'react-icons/fa';

// Recibe la funcion para añadir comentario (del hook usePosts) y el ID del post
const CommentForm = ({ postId, onCommentAdded }) => {
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsLoading(true);
        setError(null);

        try {
            // Llama a la funcion prop que ejecuta usePosts.addComment(postId, content)
            const result = await onCommentAdded(postId, content);

            // Si tiene exito, limpia el formulario
            if (result) {
                setContent('');
            }
        } catch (err) {
            // Muestra el error de la API si falla
            setError(err.message || "Fallo al publicar el comentario.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="comment-form-container">
            {error && <p className="error-message comment-error">{error}</p>}
            <form onSubmit={handleSubmit} className="comment-form">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Escribe tu comentario..."
                    rows="2"
                    disabled={isLoading}
                />
                <button type="submit" disabled={isLoading || !content.trim()}>
                    {isLoading ? <FaSpinner className="spinner" /> : <FaPaperPlane />}
                </button>
            </form>
        </div>
    );
};

export default CommentForm;