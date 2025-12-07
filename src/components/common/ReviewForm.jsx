// src/components/common/ReviewForm.jsx
import React, { useState, useEffect } from 'react';
import { FaStar, FaRegStar, FaSpinner } from 'react-icons/fa';
import reviewService from '../../services/reviewService';
import '../../styles/ReviewForm.css'; // Asumiendo que crearé este archivo CSS

const ReviewForm = ({ gameId, existingReview, onReviewSubmitted, onCancel }) => {
    const [rating, setRating] = useState(existingReview?.rating || 0);
    const [comment, setComment] = useState(existingReview?.comment || '');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (existingReview) {
            setRating(existingReview.rating);
            setComment(existingReview.comment);
        }
    }, [existingReview]);

    const handleRatingChange = (newRating) => {
        setRating(newRating);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        if (rating === 0) {
            setError('Por favor, selecciona una calificación.');
            setIsLoading(false);
            return;
        }

        if (comment.trim().length < 5) {
            setError('El comentario debe tener al menos 5 caracteres.');
            setIsLoading(false);
            return;
        }

        try {
            let response;
            const reviewData = { rating, comment };

            if (existingReview) {
                response = await reviewService.updateReview(existingReview._id, reviewData);
            } else {
                response = await reviewService.createReview(gameId, reviewData);
            }
            onReviewSubmitted(response.review); // Pasar la reseña recién creada/actualizada
            setRating(0);
            setComment('');
        } catch (err) {
            console.error('Error submitting review:', err);
            setError(err.message || 'Error al enviar la reseña.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="review-form-container">
            <h3>{existingReview ? 'Editar Reseña' : 'Escribir Reseña'}</h3>
            <form onSubmit={handleSubmit} className="review-form">
                <div className="rating-input">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <span
                            key={star}
                            className={`star ${star <= rating ? 'filled' : ''}`}
                            onClick={() => handleRatingChange(star)}
                        >
                            {star <= rating ? <FaStar /> : <FaRegStar />}
                        </span>
                    ))}
                </div>
                <textarea
                    placeholder="Escribe tu reseña..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows="5"
                    maxLength="500"
                ></textarea>
                {error && <p className="error-message">{error}</p>}
                <div className="form-actions">
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? <FaSpinner className="spinner" /> : (existingReview ? 'Guardar Cambios' : 'Enviar Reseña')}
                    </button>
                    <button type="button" onClick={onCancel} className="cancel-btn" disabled={isLoading}>
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ReviewForm;
