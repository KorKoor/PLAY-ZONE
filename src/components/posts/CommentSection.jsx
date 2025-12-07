// src/components/posts/CommentSection.jsx
import React, { useState } from 'react';
import useComments from '../../hooks/useComments';
import { FaPaperPlane, FaSpinner } from 'react-icons/fa';
import '../../styles/CommentSection.css';

const CommentSection = ({ postId, guideId, postCommentsCount, addComment: parentAddComment }) => {
    // Determinar el tipo de contenido y el ID
    const contentType = postId ? 'post' : 'guide';
    const contentId = postId || guideId;
    
    const { comments, isLoading, error, addComment } = useComments(contentId, contentType);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setIsSubmitting(true);
        setSubmitError(null);
        try {
            await addComment(newComment);
            setNewComment('');
            
            // Si hay una función parent para agregar comentario (para posts), llamarla también
            if (parentAddComment && contentType === 'post') {
                parentAddComment(contentId, newComment);
            }
        } catch (err) {
            setSubmitError(err.message || 'Fallo al enviar el comentario.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Fecha Desconocida';
        return new Date(dateString).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="comment-section">
            <h4>Comentarios</h4>
            
            <form onSubmit={handleSubmit} className="comment-form">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Escribe un comentario..."
                    rows="3"
                    disabled={isSubmitting}
                />
                <button type="submit" disabled={isSubmitting || !newComment.trim()}>
                    {isSubmitting ? <FaSpinner className="spinner" /> : <FaPaperPlane />}
                    <span>Publicar</span>
                </button>
            </form>
            {submitError && <p className="error-message">{submitError}</p>}

            <div className="comment-list">
                {isLoading && <div className="loading-message">Cargando comentarios...</div>}
                {error && <div className="error-message">{error}</div>}

                {!isLoading && comments.length === 0 && (
                    <p>No hay comentarios todavía. ¡Sé el primero en comentar!</p>
                )}

                {comments.map(comment => (
                    <div key={comment._id} className="comment-item">
                        <div className="comment-author">
                            <img
                                src={comment.author?.avatarUrl || '/default-avatar.png'}
                                alt={comment.author?.alias}
                                className="author-avatar-small"
                            />
                            <strong>{comment.author?.alias || 'Usuario Anónimo'}</strong>
                        </div>
                        <p className="comment-content">{comment.content}</p>
                        <span className="comment-date">{formatDate(comment.createdAt)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CommentSection;
