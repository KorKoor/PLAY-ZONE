// src/hooks/useGuides.js

import { useState, useEffect, useCallback } from 'react';
import guideService from '../services/guideService';

const GUIDES_PER_PAGE = 10;

const useGuides = () => {
    const [guides, setGuides] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // Estados para ordenamiento y busqueda
    const [filters, setFilters] = useState({
        sortBy: 'date', // 'date' o 'popularity'
        search: ''
    });

    const fetchGuides = useCallback(async (reset = false, newFilters = {}) => {
        const currentFilters = { ...filters, ...newFilters };
        const currentPage = reset ? 1 : page;

        if (!hasMore && !reset) return;

        setIsLoading(true);
        setError(null);

        try {
            const params = {
                ...currentFilters,
                page: currentPage,
                limit: GUIDES_PER_PAGE
            };

            const data = await guideService.getAllGuides(params);

            setGuides(prevGuides => reset ? data.guides : [...prevGuides, ...data.guides]);
            setHasMore(data.guides.length === GUIDES_PER_PAGE);

            if (reset) {
                setPage(2);
            } else {
                setPage(currentPage + 1);
            }

        } catch (err) {
            setError(err.message || "Fallo al cargar las guias.");
        } finally {
            setIsLoading(false);
        }
    }, [filters, page, hasMore]);


    useEffect(() => {
        fetchGuides(true);
    }, [filters, fetchGuides]);

    const applyFilters = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
        setPage(1);
        setGuides([]);
        setHasMore(true);
    };

    const handleToggleUseful = async (guideId, currentIsUseful) => {
        setGuides(currentGuides =>
            currentGuides.map(guide =>
                guide._id === guideId ? {
                    ...guide,
                    isUseful: !currentIsUseful,
                    usefulCount: currentIsUseful ? guide.usefulCount - 1 : guide.usefulCount + 1
                } : guide
            )
        );
        try {
            await guideService.toggleUseful(guideId);
        } catch (err) {
            setError("Fallo al registrar la marca de util.");
            setGuides(currentGuides =>
                currentGuides.map(guide =>
                    guide._id === guideId ? {
                        ...guide,
                        isUseful: currentIsUseful,
                        usefulCount: currentIsUseful ? guide.usefulCount + 1 : guide.usefulCount - 1
                    } : guide
                )
            );
        }
    };

        const addNewGuide = (newGuide) => {
        if (newGuide) {
            setGuides(prev => [newGuide, ...prev]);
        }
    };

    const removeGuide = (guideId) => {
        setGuides(prev => prev.filter(guide => guide._id !== guideId));
    };

        const updateGuideInList = (updatedGuide) => {
        if (updatedGuide) {
            setGuides(prev => prev.map(guide => 
                guide._id === updatedGuide._id ? updatedGuide : guide
            ));
        }
    };

    return {
        guides,
        isLoading,
        error,
        filters,
        applyFilters,
        fetchMore: () => fetchGuides(false),
        handleToggleUseful,
        addNewGuide,
        removeGuide,
        updateGuideInList,
    };
};

export default useGuides;
