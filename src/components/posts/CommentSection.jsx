// src/components/posts/CommentSection.jsx

import React, { useState, useEffect } from 'react';
import postService from '../../services/postService';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';
import { FaSpinner, FaComments } from 'react-icons/fa';
import '../../styles/CommentSection.css'; 

// Recibe postId y la funcion addComment del hook usePosts
const CommentSection = ({ postId, postCommentsCount, addComment }) => {
    const [comments, setComments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Cargar la lista inicial de comentarios
    const fetchComments = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Llama a GET /api/v1/posts/:postId/comments (Requisito 2.6)
            const data = await postService.getComments(postId);
            setComments(data.comments);
        } catch (err) {
            setError("Fallo al cargar los comentarios.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [postId]);

    // Funcion que se pasa al CommentForm para actualizar el estado local
    const handleNewComment = async (id, content) => {
        // Llama a la logica de usePosts para actualizar el contador global
        const newComment = await addComment(id, content);

        // Añade el comentario recien creado al array local
        if (newComment) {
            setComments(prev => [...prev, newComment]);
            return true;
        }
        return false;
    };

    return (
        <div className="comments-section-container">
            <h4 className="section-title-comments">
                <FaComments /> Comentarios ({postCommentsCount})
            </h4>

            {/* Formulario de creación (Requisito 2.5) */}
            <CommentForm postId={postId} onCommentAdded={handleNewComment} />

            <div className="comments-list">
                {isLoading && <div className="comments-loading"><FaSpinner className="spinner" /> Cargando...</div>}
                {error && <p className="error-message">{error}</p>}

                {/* Mapeo de la lista de comentarios */}
                {!isLoading && comments.length === 0 && (
                    <p className="no-comments-message">Se el primero en comentar.</p>
                )}

                {comments.map(comment => (
                    <CommentItem key={comment._id} comment={comment} />
                ))}
            </div>
        </div>
    );
};

export default CommentSection;