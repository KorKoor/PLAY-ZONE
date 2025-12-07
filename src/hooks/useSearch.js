// src/hooks/useSearch.js
import { useState, useEffect, useCallback } from 'react';
import searchService from '../services/searchService';
import userService from '../services/userService';
import gameService from '../services/gameService';
import postService from '../services/postService';
import guideService from '../services/guideService';

const useSearch = () => {
    // Estados principales
    const [results, setResults] = useState({
        users: [],
        games: [],
        posts: [],
        guides: []
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Estado para rastrear la fuente de la búsqueda (backend/fallback)
    const [searchSources, setSearchSources] = useState({
        users: 'pending',
        games: 'pending',
        posts: 'pending',
        guides: 'pending'
    });
    
    // Estados de paginación por tipo
    const [pagination, setPagination] = useState({
        users: { page: 1, totalPages: 1, total: 0, hasMore: false },
        games: { page: 1, totalPages: 1, total: 0, hasMore: false },
        posts: { page: 1, totalPages: 1, total: 0, hasMore: false },
        guides: { page: 1, totalPages: 1, total: 0, hasMore: false }
    });
    
    // Estados de filtros
    const [filters, setFilters] = useState({
        type: 'all', // 'all', 'users', 'games', 'posts', 'guides'
        sortBy: 'relevance', // 'relevance', 'date', 'name'
        sortOrder: 'desc', // 'asc', 'desc'
        category: '',
        difficulty: '',
        genre: ''
    });
    
    const [searchQuery, setSearchQuery] = useState('');
    const [availableFilters, setAvailableFilters] = useState({
        categories: [],
        difficulties: [],
        genres: [],
        platforms: []
    });

    // Cargar filtros disponibles al montar el componente
    useEffect(() => {
        loadAvailableFilters();
    }, []);

    const loadAvailableFilters = async () => {
        try {
            const data = await searchService.getAvailableFilters();
            setAvailableFilters(data);
        } catch (err) {
            console.error('Error loading available filters:', err);
        }
    };

    // Función principal de búsqueda
    const performSearch = useCallback(async (query, newFilters = {}, resetResults = true) => {
        console.log('🔍 performSearch called:', { query, newFilters, resetResults });
        
        if (!query.trim()) {
            console.log('📝 Query vacía, limpiando resultados');
            setResults({ users: [], games: [], posts: [], guides: [] });
            setPagination({
                users: { page: 1, totalPages: 1, total: 0, hasMore: false },
                games: { page: 1, totalPages: 1, total: 0, hasMore: false },
                posts: { page: 1, totalPages: 1, total: 0, hasMore: false },
                guides: { page: 1, totalPages: 1, total: 0, hasMore: false }
            });
            return;
        }

        setLoading(true);
        setError(null);
        
        const currentFilters = { ...filters, ...newFilters };
        console.log('🎛️ Filtros aplicados:', currentFilters);
        
        try {
            if (currentFilters.type === 'all') {
                console.log('🌐 Búsqueda global en todos los tipos');
                // Búsqueda global - obtener resultados de todos los tipos
                await Promise.all([
                    searchByType('users', query, currentFilters, resetResults),
                    searchByType('games', query, currentFilters, resetResults),
                    searchByType('posts', query, currentFilters, resetResults),
                    searchByType('guides', query, currentFilters, resetResults)
                ]);
            } else {
                console.log('🎯 Búsqueda específica por tipo:', currentFilters.type);
                // Búsqueda específica por tipo
                await searchByType(currentFilters.type, query, currentFilters, resetResults);
            }
        } catch (err) {
            console.error('❌ Error in search:', err);
            setError('Error al realizar la búsqueda. Intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    // Función auxiliar para buscar por tipo específico
    const searchByType = async (type, query, searchFilters, resetResults = true) => {
        const page = resetResults ? 1 : pagination[type].page + 1;
        const limit = 10;
        
        console.log(`🔍 searchByType: ${type}`, { query, page, limit, searchFilters });
        
        try {
            let response;
            
            switch (type) {
                case 'users':
                    console.log('👥 Buscando usuarios...');
                    try {
                        response = await searchService.searchUsers(query, page, limit);
                        setSearchSources(prev => ({ ...prev, users: 'backend' })); // Backend used
                        console.log('✅ searchUsers response:', response);
                        // Adaptar respuesta del formato { success: true, users: [...], pagination: {...} }
                        response = {
                            data: response.users || [],
                            total: response.pagination?.total || 0,
                            totalPages: response.pagination?.totalPages || 1,
                            currentPage: response.pagination?.currentPage || 1
                        };
                    } catch (error) {
                        console.log('⚠️ searchUsers falló, usando fallback:', error.message);
                        // Fallback al servicio de usuarios existente
                        try {
                            const fallbackResponse = await userService.getAllUsers(query);
                            // Adaptar respuesta al formato esperado
                            response = {
                                data: Array.isArray(fallbackResponse) ? fallbackResponse : (fallbackResponse?.users || []),
                                total: Array.isArray(fallbackResponse) ? fallbackResponse.length : (fallbackResponse?.total || 0),
                                totalPages: 1,
                                currentPage: 1
                            };
                            setSearchSources(prev => ({ ...prev, users: 'fallback' })); // Fallback used
                            console.log('🔄 Fallback users response:', response);
                        } catch (fallbackError) {
                            console.log('❌ Users fallback también falló:', fallbackError);
                            setSearchSources(prev => ({ ...prev, users: 'error_fallback' })); // Fallback error
                            response = { data: [], total: 0, totalPages: 1, currentPage: 1 };
                        }
                    }
                    break;
                case 'games':
                    console.log('🎮 Buscando juegos...');
                    try {
                        response = await searchService.searchGames(query, page, limit);
                        setSearchSources(prev => ({ ...prev, games: 'backend' })); // Backend used
                        console.log('✅ searchGames response:', response);
                        // Adaptar respuesta si el backend devuelve un array directamente
                        if (Array.isArray(response)) {
                            response = {
                                data: response,
                                total: response.length,
                                totalPages: Math.ceil(response.length / limit),
                                currentPage: page
                            };
                        }
                    } catch (error) {
                        console.log('⚠️ searchGames falló, usando fallback:', error.message);
                        // Fallback al servicio de juegos existente
                        try {
                            const gamesResponse = await gameService.getGames();
                            const allGames = Array.isArray(gamesResponse) ? gamesResponse : 
                                            (gamesResponse?.games || gamesResponse?.data || []);
                            
                            // Filtrar juegos que coincidan con la búsqueda
                            const filteredGames = allGames.filter(game => 
                                (game.title || game.name || '').toLowerCase().includes(query.toLowerCase()) ||
                                (game.developer || '').toLowerCase().includes(query.toLowerCase()) ||
                                (game.description || '').toLowerCase().includes(query.toLowerCase())
                            );
                            
                            response = {
                                data: filteredGames,
                                total: filteredGames.length,
                                totalPages: 1,
                                currentPage: 1
                            };
                            setSearchSources(prev => ({ ...prev, games: 'fallback' })); // Fallback used
                            console.log('🔄 Fallback games response:', response);
                        } catch (fallbackError) {
                            console.log('❌ Games fallback también falló:', fallbackError);
                            setSearchSources(prev => ({ ...prev, games: 'error_fallback' })); // Fallback error
                            response = { data: [], total: 0, totalPages: 1, currentPage: 1 };
                        }
                    }
                    break;
                case 'posts':
                    console.log('📝 Buscando posts...');
                    try {
                        response = await searchService.searchPosts(query, page, limit);
                        setSearchSources(prev => ({ ...prev, posts: 'backend' })); // Backend used
                        console.log('✅ searchPosts response:', response);
                        // Adaptar respuesta del formato { success: true, posts: [...], pagination: {...} }
                        response = {
                            data: response.posts || [],
                            total: response.pagination?.total || response.posts?.length || 0,
                            totalPages: response.pagination?.totalPages || 1,
                            currentPage: response.pagination?.currentPage || 1
                        };
                    } catch (error) {
                        console.log('⚠️ searchPosts falló, usando fallback:', error.message);
                        // Fallback al servicio de posts existente
                        try {
                            const fallbackResponse = await postService.searchPosts(query);
                            // Adaptar respuesta si es necesario
                            if (!fallbackResponse.data) {
                                response = {
                                    data: Array.isArray(fallbackResponse) ? fallbackResponse : [],
                                    total: Array.isArray(fallbackResponse) ? fallbackResponse.length : 0,
                                    totalPages: 1,
                                    currentPage: 1
                                };
                            }
                            setSearchSources(prev => ({ ...prev, posts: 'fallback' })); // Fallback used
                            console.log('🔄 Fallback posts response:', response);
                        } catch (postError) {
                            console.log('❌ Posts fallback también falló:', postError);
                            setSearchSources(prev => ({ ...prev, posts: 'error_fallback' })); // Fallback error
                            response = { data: [], total: 0, totalPages: 1, currentPage: 1 };
                        }
                    }
                    break;
                case 'guides':
                    console.log('📚 Buscando guías...');
                    try {
                        response = await searchService.searchGuides(query, page, limit, {
                            category: searchFilters.category,
                            difficulty: searchFilters.difficulty,
                            sortBy: searchFilters.sortBy
                        });
                        setSearchSources(prev => ({ ...prev, guides: 'backend' })); // Backend used
                        console.log('✅ searchGuides response:', response);
                        // Adaptar respuesta del formato { success: true, guides: [...], pagination: {...} }
                        response = {
                            data: response.guides || [],
                            total: response.pagination?.total || response.guides?.length || 0,
                            totalPages: response.pagination?.totalPages || 1,
                            currentPage: response.pagination?.currentPage || 1
                        };
                    } catch (error) {
                        console.log('⚠️ searchGuides falló, usando fallback:', error.message);
                        // Fallback al servicio de guías existente
                        try {
                            const fallbackResponse = await guideService.getAllGuides(page, limit, {
                                search: query,
                                category: searchFilters.category,
                                difficulty: searchFilters.difficulty,
                                sortBy: searchFilters.sortBy
                            });
                            
                            // Adaptar respuesta del formato existente
                            if (fallbackResponse.guides) {
                                response = {
                                    data: fallbackResponse.guides,
                                    total: fallbackResponse.total || fallbackResponse.guides.length,
                                    totalPages: fallbackResponse.totalPages || 1,
                                    currentPage: fallbackResponse.currentPage || 1
                                };
                            }
                            setSearchSources(prev => ({ ...prev, guides: 'fallback' })); // Fallback used
                            console.log('🔄 Fallback guides response:', response);
                        } catch (guideError) {
                            console.log('❌ Guides fallback también falló:', guideError);
                            setSearchSources(prev => ({ ...prev, guides: 'error_fallback' })); // Fallback error
                            response = { data: [], total: 0, totalPages: 1, currentPage: 1 };
                        }
                    }
                    break;
                default:
                    return;
            }
            
            const { data = [], total = 0, totalPages = 1, currentPage = 1 } = response;
            console.log(`📊 Datos recibidos para ${type}:`, { 
                dataLength: data.length, 
                totalItems: total, 
                totalPages, 
                currentPage 
            });
            
            setResults(prevResults => {
                const newResults = {
                    ...prevResults,
                    [type]: resetResults ? data : [...prevResults[type], ...data]
                };
                console.log(`✅ Nuevos resultados de estado para ${type}:`, newResults[type].length, 'elementos');
                return newResults;
            });
            
            setPagination(prevPag => ({
                ...prevPag,
                [type]: {
                    page: currentPage,
                    totalPages,
                    total,
                    hasMore: currentPage < totalPages
                }
            }));
            
        } catch (err) {
            console.error(`❌ Error searching ${type}:`, err);
            // En caso de error, mantener los resultados existentes si no es reset
            if (resetResults) {
                setResults(prevResults => ({
                    ...prevResults,
                    [type]: []
                }));
                setPagination(prevPag => ({
                    ...prevPag,
                    [type]: {
                        page: 1,
                        totalPages: 1,
                        total: 0,
                        hasMore: false
                    }
                }));
            }
        }
    };

    // Cargar más resultados para un tipo específico
    const loadMore = useCallback(async (type) => {
        if (!searchQuery.trim() || !pagination[type].hasMore || loading) {
            return;
        }
        
        await searchByType(type, searchQuery, filters, false);
    }, [searchQuery, filters, pagination, loading]);

    // Aplicar filtros
    const applyFilters = useCallback((newFilters) => {
        setFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
        if (searchQuery.trim()) {
            performSearch(searchQuery, newFilters, true);
        }
    }, [searchQuery, performSearch]);

    // Limpiar resultados
    const clearResults = useCallback(() => {
        setResults({ users: [], games: [], posts: [], guides: [] });
        setPagination({
            users: { page: 1, totalPages: 1, total: 0, hasMore: false },
            games: { page: 1, totalPages: 1, total: 0, hasMore: false },
            posts: { page: 1, totalPages: 1, total: 0, hasMore: false },
            guides: { page: 1, totalPages: 1, total: 0, hasMore: false }
        });
        setError(null);
        setSearchQuery('');
        setSearchSources({ // Reset search sources
            users: 'pending',
            games: 'pending',
            posts: 'pending',
            guides: 'pending'
        });
    }, []);

    // Obtener conteo total de resultados
    const getTotalResults = useCallback(() => {
        return pagination.users.total + pagination.games.total + 
               pagination.posts.total + pagination.guides.total;
    }, [pagination]);

    return {
        // Estados
        results,
        loading,
        error,
        pagination,
        filters,
        searchQuery,
        availableFilters,
        searchSources, // Add searchSources to the returned object
        
        // Funciones
        performSearch,
        loadMore,
        applyFilters,
        clearResults,
        setSearchQuery,
        getTotalResults
    };
};

export default useSearch;