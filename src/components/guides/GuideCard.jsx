// src/components/guides/GuideCard.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaClock, FaThumbsUp, FaComment, FaAngleRight, FaEdit, FaTrash, FaFlag } from 'react-icons/fa';
import '../../styles/GuideCard.css';
import CommentSection from '../posts/CommentSection'; // Importar la nueva sección de comentarios
import ReportModal from '../common/ReportModal';

const GuideCard = ({ guide, currentUser, onToggleUseful, onEdit, onDelete, isUsefulToggleDisabled }) => {
    const navigate = useNavigate();
    const [showComments, setShowComments] = useState(false); // Estado para mostrar/ocultar comentarios
    const [showReportModal, setShowReportModal] = useState(false); // Estado para modal de reporte

    const isAuthor = currentUser && currentUser.id === guide.authorId._id;
    const isAdmin = currentUser && currentUser.role === 'admin';
    const isUseful = guide.isUseful || false;

    const handleViewGuide = () => {
        navigate(`/guides/${guide._id}`);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Fecha Desconocida';
        return new Date(dateString).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    // Manejar reporte
    const handleReportClick = () => {
        setShowReportModal(true);
    };

    const handleReportClose = () => {
        setShowReportModal(false);
    };

    return (
        <article className="guide-card">
            <header className="guide-header">
                <h3 className="guide-title">{guide.title}</h3>
                <span className="guide-game-tag">Juego: {guide.game}</span>
            </header>

            <div className="guide-meta">
                <div className="author-info">
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
                {guide.description ? `${guide.description.substring(0, 150)}${guide.description.length > 150 ? '...' : ''}` : 'No hay descripción disponible.'}
            </p>

            <div className="guide-stats-footer">
                <button
                    onClick={onToggleUseful ? () => onToggleUseful(guide._id, isUseful) : undefined}
                    className={`btn-useful-toggle ${isUseful ? 'useful-active' : ''}`}
                    disabled={isUsefulToggleDisabled}
                >
                    <FaThumbsUp /> {guide.usefulCount} Útil
                </button>

                {/* Convertido en un botón para mostrar/ocultar comentarios */}
                <button onClick={() => setShowComments(!showComments)} className="stat-item-btn">
                    <FaComment /> {guide.commentsCount} Comentarios
                </button>

                <button onClick={handleViewGuide} className="btn-details">
                    Ver Guía <FaAngleRight />
                </button>

                {/* Botón de reportar para usuarios que no son autores */}
                {!isAuthor && currentUser && (
                    <button onClick={handleReportClick} className="btn-report" title="Reportar guía">
                        <FaFlag />
                    </button>
                )}
            </div>

            {(isAuthor || isAdmin) && (
                <div className="guide-admin-options">
                    {isAuthor && <button onClick={onEdit} className="btn-icon" title="Editar"><FaEdit /></button>}
                    <button onClick={onDelete} className="btn-icon delete-btn" title="Eliminar"><FaTrash /></button>
                </div>
            )}
            
            {/* Renderizado condicional de la sección de comentarios (Req. 3.5) */}
            {showComments && (
                <div className="guide-card-comments-wrapper">
                    <CommentSection guideId={guide._id} />
                </div>
            )}

            {/* MODAL DE REPORTE */}
            {showReportModal && (
                <ReportModal
                    isOpen={showReportModal}
                    onClose={handleReportClose}
                    contentId={guide._id}
                    contentType="guide"
                    contentTitle={guide.title}
                    reportedUser={guide.authorId?.alias || 'Usuario desconocido'}
                    reportedUserId={guide.authorId?._id || null}
                />
            )}
        </article>
    );
};

export default GuideCard;
