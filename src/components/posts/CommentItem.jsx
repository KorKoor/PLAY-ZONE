// src/components/posts/CommentItem.jsx
import React, { useState } from 'react';
import ReportModal from '../common/ReportModal';
import { FaFlag } from 'react-icons/fa';
import useAuth from '../../hooks/useAuth';

const DefaultAvatar = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="40px" height="40px" style={{ color: '#cccccc' }}>
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
);

const CommentItem = ({ comment }) => {
    const [isReportModalOpen, setReportModalOpen] = useState(false);
    const { user } = useAuth();

    const handleReportClick = () => {
        setReportModalOpen(true);
    };

    const handleCloseModal = () => {
        setReportModalOpen(false);
    };

    // Determinar el objeto de autor a mostrar, ya sea 'author' o 'authorId'
    const displayAuthor = comment.author || comment.authorId;

    // No mostrar el botón de reportar si el comentario es del propio usuario
    const isOwnComment = user?.id && displayAuthor?._id && user.id === displayAuthor._id;


    return (
        <div className="comment-item">
            {displayAuthor?.avatarUrl ? (
                <img
                    src={displayAuthor.avatarUrl}
                    alt={displayAuthor.alias}
                    className="comment-author-avatar"
                />
            ) : (
                <div className="comment-author-avatar">
                    <DefaultAvatar />
                </div>
            )}
            <div className="comment-body">
                <span className="comment-author-alias">{displayAuthor?.alias}</span>
                <p className="comment-content">{comment.content}</p>
                <span className="comment-date">{new Date(comment.createdAt).toLocaleDateString()}</span>
            </div>
            {!isOwnComment && (
                <div className="comment-actions">
                    <button 
                        onClick={handleReportClick} 
                        className="report-button" 
                        title="Reportar comentario"
                    >
                        <FaFlag />
                    </button>
                </div>
            )}

            {isReportModalOpen && (
                <>
                    {console.log("[CommentItem] Enviando a ReportModal: contentId =", comment._id, "contentType = comment")}
                    <ReportModal
                        isOpen={isReportModalOpen}
                        onClose={handleCloseModal}
                        contentId={comment._id}
                        contentType="comment"
                        contentTitle={`Comentario: ${comment.text?.substring(0, 50)}...`}
                        reportedUser={displayAuthor?.alias}
                        reportedUserId={displayAuthor?._id}
                        onReportSubmitted={(data) => {
                            console.log("[CommentItem] Reporte enviado:", data);
                            // Agregar el texto del comentario a los datos adicionales
                            data.additional_data = {
                                comment_text: comment.text,
                                post_title: comment.postTitle || 'Post no especificado'
                            };
                        }}
                    />
                </>
            )}
        </div>
    );
};

export default CommentItem;