// src/hooks/useComments.js
import { useState, useEffect, useCallback } from 'react';
import guideService from '../services/guideService';

const useComments = (guideId) => {
    const [comments, setComments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchComments = useCallback(async () => {
        if (!guideId) return;
        setIsLoading(true);
        setError(null);
        try {
            const fetchedComments = await guideService.getGuideComments(guideId);
            setComments(fetchedComments);
        } catch (err) {
            setError('No se pudieron cargar los comentarios.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [guideId]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const addComment = async (content) => {
        if (!guideId || !content.trim()) return;
        try {
            const newComment = await guideService.addGuideComment(guideId, content);
            setComments(prevComments => [newComment, ...prevComments]);
        } catch (err) {
            setError('Error al publicar el comentario.');
            console.error(err);
            // Re-throw the error if you want the component to be able to catch it
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
