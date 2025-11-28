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

    // Estados para ordenamiento y búsqueda (Req. 3.4, 3.7)
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

            // Llama a guideService.getGuides(params)
            const data = await guideService.getGuides(params);

            setGuides(prevGuides => reset ? data.guides : [...prevGuides, ...data.guides]);
            setHasMore(data.guides.length === GUIDES_PER_PAGE);

            if (reset) {
                setPage(2); // Inicia la paginacion en la pagina 2
            } else if (!reset) {
                setPage(currentPage + 1);
            }

        } catch (err) {
            setError(err.message || "Fallo al cargar las guías.");
        } finally {
            setIsLoading(false);
        }
    }, [filters, page, hasMore]);


    // Efecto principal para cargar la data o aplicar filtros
    useEffect(() => {
        fetchGuides(true); // Carga inicial o al cambiar filtros
    }, [filters, fetchGuides]);

    // Función para manejar la búsqueda o el ordenamiento (Req. 3.4, 3.7)
    const applyFilters = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
        // Forzamos el reset de paginación al aplicar nuevos filtros
        setPage(1);
        setGuides([]);
        setHasMore(true);
    };

    // Lógica para marcar/quitar "útil" (Req. 3.8)
    const handleToggleUseful = async (guideId, currentIsUseful) => {
        // Optimistic UI Update
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
            // Llama a POST /api/v1/guides/:guideId/useful
            await guideService.toggleUseful(guideId);
        } catch (err) {
            setError("Fallo al registrar la marca de útil.");
            // Revertir el estado si falla
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

    // Función para insertar la guía recién creada (usada por el GuideForm)
    const addNewGuide = (newGuide) => {
        setGuides(prev => [newGuide, ...prev]);
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
        // (update, delete y getById irían en otros hooks o servicios)
    };
};

export default useGuides;