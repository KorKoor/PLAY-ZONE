// src/hooks/useComments.js
import { useState, useEffect, useCallback } from 'react';
import postService from '../services/postService';
import guideService from '../services/guideService';

const useComments = (contentId, contentType = 'post') => {
    const [comments, setComments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchComments = useCallback(async () => {
        if (!contentId) {
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            let fetchedComments;
            
            if (contentType === 'guide') {
                fetchedComments = await guideService.getGuideComments(contentId);
            } else {
                fetchedComments = await postService.getComments?.(contentId) || [];
            }
            
            setComments(Array.isArray(fetchedComments) ? fetchedComments : fetchedComments?.comments || fetchedComments?.data || []);
        } catch (err) {
            setError('No se pudieron cargar los comentarios.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [contentId, contentType]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const addComment = async (content) => {
        if (!contentId || !content.trim()) return;
        try {
            let newComment;
            
            if (contentType === 'guide') {
                // Para guías, usar la API real del backend
                const response = await guideService.addGuideComment(contentId, content);
                newComment = response?.data || response;
                setComments(prevComments => [newComment, ...prevComments]);
            } else {
                // Para posts, usar el servicio existente
                newComment = await postService.addComment?.(contentId, content);
                if (newComment) {
                    setComments(prevComments => [newComment, ...prevComments]);
                }
            }
        } catch (err) {
            setError('Error al publicar el comentario.');
            console.error(err);
            throw err;
        }
    };

    return {
        comments,
        isLoading,
        error,
        addComment,
        refetch: fetchComments
    };
};

export default useComments;
