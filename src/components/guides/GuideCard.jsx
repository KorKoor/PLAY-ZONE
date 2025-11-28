// src/components/guides/GuideCard.jsx

import React from 'react';
import { FaUserCircle, FaClock, FaThumbsUp, FaComment, FaAngleRight, FaEdit, FaTrash } from 'react-icons/fa';
import '../../styles/GuideCard.css';
import { useAuthContext } from '../../context/AuthContext';

const GuideCard = ({ guide, onToggleUseful, onViewDetails, onDelete, onEdit }) => {

    // Asumimos que guide.authorId está poblado con { alias, avatarUrl, _id }
    const { user } = useAuthContext();
    const isAuthor = user && user.id === guide.authorId._id;
    const isAdmin = user && user.role === 'admin';

    const isUseful = guide.isUseful || false;

    const formatDate = (dateString) => {
        if (!dateString) return 'Fecha Desconocida';
        return new Date(dateString).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <article className="guide-card">
            <header className="guide-header">
                {/* Requisito 3.2: Título y juego */}
                <h3 className="guide-title">{guide.title}</h3>
                <span className="guide-game-tag">Juego: {guide.game}</span>
            </header>

            <div className="guide-meta">
                {/* Requisito 3.2: Autor y fecha */}
                <div className="author-info" onClick={() => console.log(`Navegar a /profile/${guide.authorId._id}`)}>
                    <img
                        src={guide.authorId?.avatarUrl || '/default-avatar.png'}
                        alt={guide.authorId?.alias}
                        className="author-avatar-small"
                    />
                    <span>{guide.authorId?.alias}</span>
                </div>
                <div className="date-info">
                    <FaClock />
                    <span>{formatDate(guide.createdAt)}</span>
                </div>
            </div>

            <p className="guide-description">
                {guide.description.substring(0, 150)}...
            </p>

            <div className="guide-stats-footer">
                {/* Requisito 3.8: Botón Útil */}
                <button
                    onClick={() => onToggleUseful(guide._id, isUseful)}
                    className={`btn-useful-toggle ${isUseful ? 'useful-active' : ''}`}
                >
                    <FaThumbsUp /> {guide.usefulCount} Útil
                </button>

                {/* Requisito 3.5: Comentarios */}
                <span className="stat-item"><FaComment /> {guide.commentsCount}</span>

                {/* Botón para ver detalles - FIX: Se corrige el tag de cierre */}
                <button onClick={() => onViewDetails(guide._id)} className="btn-details">
                    Ver Guía <FaAngleRight />
                </button>
            </div>

            {/* Opciones de Edición/Eliminación (Req. 3.6, 4.6) */}
            {(isAuthor || isAdmin) && (
                <div className="guide-admin-options">
                    {isAuthor && <button onClick={() => onEdit(guide)} className="btn-icon" title="Editar"><FaEdit /></button>}
                    <button onClick={() => onDelete(guide._id)} className="btn-icon delete-btn" title="Eliminar"><FaTrash /></button>
                </div>
            )}
        </article>
    );
};

export default GuideCard;