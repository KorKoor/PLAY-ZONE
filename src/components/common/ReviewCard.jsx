// src/components/common/ReviewCard.jsx
import React from 'react';
import { FaStar, FaUserCircle, FaCalendarAlt } from 'react-icons/fa';
import useAuth from '../../hooks/useAuth'; // Para verificar si el usuario es el autor
import '../../styles/ReviewCard.css'; // Asumiendo que crearé este archivo CSS

const ReviewCard = ({ review, onEdit, onDelete }) => {
    const { user } = useAuth();
    const isAuthor = user && user._id === (review.authorId?._id || review.authorId);

    // Función para renderizar estrellas según el rating
    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <FaStar
                    key={i}
                    className={i <= rating ? 'star-filled' : 'star-empty'}
                />
            );
        }
        return stars;
    };

    return (
        <div className="review-card">
            <div className="review-header">
                <div className="reviewer-info">
                    <img
                        src={review.authorId?.avatarUrl || '/default-avatar.png'}
                        alt={review.authorId?.alias || 'Usuario Anónimo'}
                        className="reviewer-avatar"
                        onError={(e) => { e.target.onerror = null; e.target.src = '/default-avatar.png'; }}
                    />
                    <span className="reviewer-name">{review.authorId?.alias || 'Usuario Anónimo'}</span>
                </div>
                <div className="review-rating">
                    {renderStars(review.rating)}
                </div>
            </div>
            <div className="review-body">
                <p className="review-comment">{review.comment}</p>
                <div className="review-meta">
                    <span className="review-date">
                        <FaCalendarAlt /> {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                    {isAuthor && (
                        <div className="review-actions">
                            {onEdit && <button onClick={() => onEdit(review)} className="edit-review-btn">Editar</button>}
                            {onDelete && <button onClick={() => onDelete(review._id)} className="delete-review-btn">Eliminar</button>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReviewCard;
