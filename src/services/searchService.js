// src/services/searchService.js
import { get } from './httpService';
import gameService from './gameService';
import postService from './postService';
import guideService from './guideService';
import userService from './userService';

const searchService = {
    // Búsqueda global en todo el contenido
    globalSearch: async (query, filters = {}) => {
        const params = new URLSearchParams();
        
        // Agregar query principal
        if (query) params.append('q', query);
        
        // Agregar filtros opcionales
        if (filters.type) params.append('type', filters.type);
        if (filters.category) params.append('category', filters.category);
        if (filters.sortBy) params.append('sortBy', filters.sortBy);
        if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
        if (filters.page) params.append('page', filters.page);
        if (filters.limit) params.append('limit', filters.limit);
        
        
        try {
            const requestUrl = `/search?${params.toString()}`;
            console.log('🌐 Realizando búsqueda global a backend en URL:', requestUrl);
            const response = await get(requestUrl);
            console.log('✅ Búsqueda global desde backend exitosa. Respuesta:', response);
            return response;
        } catch (error) {
            console.log('Endpoint de búsqueda global no disponible, usando fallback distribuido:', error.message);
            
            // Fallback: búsqueda distribuida usando servicios existentes
            return await this.distributedSearch(query, filters);
        }
    },

    // Búsqueda distribuida como fallback
    distributedSearch: async (query, filters = {}) => {
        const results = {
            users: { data: [], total: 0 },
            games: { data: [], total: 0 },
            posts: { data: [], total: 0 },
            guides: { data: [], total: 0 }
        };

        if (!query) return results;

        const searchPromises = [];

        try {
            // Buscar en paralelo usando servicios existentes
            if (!filters.type || filters.type === 'games') {
                searchPromises.push(
                    gameService.getGames({ 
                        page: filters.page || 1, 
                        limit: filters.limit || 10,
                        search: query
                    }).then(response => ({ type: 'games', data: response }))
                    .catch(() => ({ type: 'games', data: { data: [], total: 0 } }))
                );
            }

            if (!filters.type || filters.type === 'posts') {
                searchPromises.push(
                    postService.getPosts({ 
                        page: filters.page || 1, 
                        limit: filters.limit || 10 
                    }).then(response => {
                        // Filtrar posts que contengan la query
                        const filteredPosts = response?.data?.filter(post => 
                            post.title?.toLowerCase().includes(query.toLowerCase()) ||
                            post.content?.toLowerCase().includes(query.toLowerCase())
                        ) || [];
                        
                        return { 
                            type: 'posts', 
                            data: { 
                                data: filteredPosts.slice(0, filters.limit || 10), 
                                total: filteredPosts.length 
                            } 
                        };
                    })
                    .catch(() => ({ type: 'posts', data: { data: [], total: 0 } }))
                );
            }

            if (!filters.type || filters.type === 'guides') {
                searchPromises.push(
                    guideService.getGuides({ 
                        page: filters.page || 1, 
                        limit: filters.limit || 10 
                    }).then(response => {
                        // Filtrar guías que contengan la query
                        const filteredGuides = response?.data?.filter(guide => 
                            guide.title?.toLowerCase().includes(query.toLowerCase()) ||
                            guide.content?.toLowerCase().includes(query.toLowerCase())
                        ) || [];
                        
                        return { 
                            type: 'guides', 
                            data: { 
                                data: filteredGuides.slice(0, filters.limit || 10), 
                                total: filteredGuides.length 
                            } 
                        };
                    })
                    .catch(() => ({ type: 'guides', data: { data: [], total: 0 } }))
                );
            }

            // Para usuarios, intentar búsqueda si está disponible
            if (!filters.type || filters.type === 'users') {
                searchPromises.push(
                    userService.getUsers().then(response => {
                        // Filtrar usuarios que contengan la query
                        const filteredUsers = response?.data?.filter(user => 
                            user.username?.toLowerCase().includes(query.toLowerCase()) ||
                            user.name?.toLowerCase().includes(query.toLowerCase())
                        ) || [];
                        
                        return { 
                            type: 'users', 
                            data: { 
                                data: filteredUsers.slice(0, filters.limit || 10), 
                                total: filteredUsers.length 
                            } 
                        };
                    })
                    .catch(() => ({ type: 'users', data: { data: [], total: 0 } }))
                );
            }

            // Esperar todas las búsquedas
            const searchResults = await Promise.all(searchPromises);
            
            // Combinar resultados
            searchResults.forEach(result => {
                results[result.type] = result.data;
            });

            return results;

        } catch (error) {
            console.error('Error en búsqueda distribuida:', error);
            return results;
        }
    },

    // Búsqueda específica por tipos
    searchUsers: async (query, page = 1, limit = 10) => {
        try {
            // Usar el nuevo endpoint de búsqueda de usuarios
            return await get(`/users/search?search=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
        } catch (error) {
            console.log('Endpoint de usuarios no disponible, usando fallback:', error.message);
            // Fallback al servicio existente
            try {
                const response = await userService.getUsers();
                const allUsers = Array.isArray(response) ? response : (response?.data || response?.users || []);
                
                const filteredUsers = allUsers.filter(user => 
                    (user.username || '').toLowerCase().includes(query.toLowerCase()) ||
                    (user.name || '').toLowerCase().includes(query.toLowerCase())
                );
                
                return {
                    data: filteredUsers.slice((page - 1) * limit, page * limit),
                    total: filteredUsers.length,
                    totalPages: Math.ceil(filteredUsers.length / limit),
                    currentPage: page
                };
            } catch (fallbackError) {
                console.error('Error en fallback de searchUsers:', fallbackError);
                throw fallbackError;
            }
        }
    },

    searchGames: async (query, page = 1, limit = 10) => {
        try {
            return await get(`/games?search=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
        } catch (error) {
            console.log('Endpoint de juegos no disponible, usando fallback:', error.message);
            // Fallback al servicio existente
            try {
                const gamesResponse = await gameService.getGames();
                const allGames = Array.isArray(gamesResponse) ? gamesResponse : 
                                (gamesResponse?.games || gamesResponse?.data || []);
                
                const filteredGames = allGames.filter(game => 
                    (game.title || game.name || '').toLowerCase().includes(query.toLowerCase()) ||
                    (game.developer || '').toLowerCase().includes(query.toLowerCase()) ||
                    (game.description || '').toLowerCase().includes(query.toLowerCase())
                );
                
                return {
                    data: filteredGames.slice((page - 1) * limit, page * limit),
                    total: filteredGames.length,
                    totalPages: Math.ceil(filteredGames.length / limit),
                    currentPage: page
                };
            } catch (fallbackError) {
                console.error('Error en fallback de searchGames:', fallbackError);
                throw fallbackError;
            }
        }
    },

    searchPosts: async (query, page = 1, limit = 10) => {
        try {
            return await get(`/posts/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
        } catch (error) {
            console.log('Endpoint de posts no disponible, usando fallback:', error.message);
            // Fallback al servicio existente
            try {
                const response = await postService.searchPosts ? 
                    await postService.searchPosts(query) :
                    await postService.getPosts();
                    
                let allPosts = [];
                
                if (Array.isArray(response)) {
                    allPosts = response;
                } else if (response?.data) {
                    allPosts = response.data;
                } else if (response?.posts) {
                    allPosts = response.posts;
                }
                
                const filteredPosts = allPosts.filter(post => 
                    (post.title || '').toLowerCase().includes(query.toLowerCase()) ||
                    (post.content || '').toLowerCase().includes(query.toLowerCase())
                );
                
                return {
                    data: filteredPosts.slice((page - 1) * limit, page * limit),
                    total: filteredPosts.length,
                    totalPages: Math.ceil(filteredPosts.length / limit),
                    currentPage: page
                };
            } catch (fallbackError) {
                console.error('Error en fallback de searchPosts:', fallbackError);
                throw fallbackError;
            }
        }
    },

    searchGuides: async (query, page = 1, limit = 10, filters = {}) => {
        let endpoint = `/guides?search=${encodeURIComponent(query)}&page=${page}&limit=${limit}`;
        
        if (filters.category) endpoint += `&category=${encodeURIComponent(filters.category)}`;
        if (filters.difficulty) endpoint += `&difficulty=${encodeURIComponent(filters.difficulty)}`;
        if (filters.sortBy) endpoint += `&sortBy=${filters.sortBy}`;
        
        try {
            return await get(endpoint);
        } catch (error) {
            console.log('Endpoint de guías no disponible, usando fallback:', error.message);
            // Fallback al servicio existente
            try {
                const response = await guideService.getAllGuides(page, limit, {
                    search: query,
                    category: filters.category,
                    difficulty: filters.difficulty,
                    sortBy: filters.sortBy
                });
                
                // Adaptar respuesta del formato existente
                if (response.guides) {
                    return {
                        data: response.guides,
                        total: response.total || response.guides.length,
                        totalPages: response.totalPages || Math.ceil((response.total || response.guides.length) / limit),
                        currentPage: response.currentPage || page
                    };
                } else {
                    return {
                        data: response.data || [],
                        total: response.total || 0,
                        totalPages: response.totalPages || 1,
                        currentPage: response.currentPage || page
                    };
                }
            } catch (fallbackError) {
                console.error('Error en fallback de searchGuides:', fallbackError);
                throw fallbackError;
            }
        }
    },

    // Búsqueda con sugerencias/autocompletado
    getSearchSuggestions: async (query) => {
        try {
            // Usar el endpoint del backend implementado
            const response = await get(`/search/suggestions?q=${encodeURIComponent(query)}`);
            console.log('✅ Sugerencias obtenidas del backend:', response);
            return response;
        } catch (error) {
            console.log('Backend no disponible para sugerencias, usando fallback local:', error.message);
            
            // Fallback: generar sugerencias locales basadas en servicios existentes
            if (!query || query.length < 2) {
                return { suggestions: [] };
            }

            const suggestions = [];
            const lowerQuery = query.toLowerCase();

            try {
                // Buscar en juegos
                const gamesResponse = await gameService.getGames({ page: 1, limit: 5 });
                if (gamesResponse?.data) {
                    const gameMatches = gamesResponse.data
                        .filter(game => game.title?.toLowerCase().includes(lowerQuery))
                        .slice(0, 3)
                        .map(game => ({
                            type: 'game',
                            title: game.title,
                            id: game.id,
                            subtitle: 'Videojuego'
                        }));
                    suggestions.push(...gameMatches);
                }

                // Buscar en posts (si es posible)
                try {
                    const postsResponse = await postService.getPosts({ page: 1, limit: 5 });
                    if (postsResponse?.data) {
                        const postMatches = postsResponse.data
                            .filter(post => post.title?.toLowerCase().includes(lowerQuery))
                            .slice(0, 2)
                            .map(post => ({
                                type: 'post',
                                title: post.title,
                                id: post.id,
                                subtitle: 'Publicación'
                            }));
                        suggestions.push(...postMatches);
                    }
                } catch (e) {
                    console.log('No se pudieron obtener posts para sugerencias');
                }

                // Sugerencias genéricas si no hay coincidencias
                if (suggestions.length === 0) {
                    const genericSuggestions = [
                        'Videojuegos populares',
                        'Guías de jugabilidad',
                        'Reseñas de usuarios',
                        'Comunidad gamer'
                    ].filter(text => text.toLowerCase().includes(lowerQuery))
                     .map(text => ({
                        type: 'generic',
                        title: text,
                        id: text.replace(/\s+/g, '-').toLowerCase(),
                        subtitle: 'Buscar en ' + text
                     }));
                    suggestions.push(...genericSuggestions);
                }

            } catch (fallbackError) {
                console.error('Error en fallback de sugerencias:', fallbackError);
            }

            return { suggestions: suggestions.slice(0, 5) };
        }
    },

    // Obtener filtros disponibles para cada tipo de contenido
    getAvailableFilters: async () => {
        try {
            // Usar el endpoint del backend implementado
            const response = await get('/search/filters');
            console.log('✅ Filtros obtenidos del backend:', response);
            return response;
        } catch (error) {
            console.log('Backend no disponible para filtros, usando filtros predeterminados:', error.message);
            
            // Fallback: devolver filtros estáticos comunes
            return {
                categories: [
                    { id: 'action', name: 'Acción' },
                    { id: 'adventure', name: 'Aventura' },
                    { id: 'rpg', name: 'RPG' },
                    { id: 'strategy', name: 'Estrategia' },
                    { id: 'simulation', name: 'Simulación' },
                    { id: 'sports', name: 'Deportes' },
                    { id: 'racing', name: 'Carreras' },
                    { id: 'puzzle', name: 'Puzzle' }
                ],
                difficulties: [
                    { id: 'easy', name: 'Fácil' },
                    { id: 'normal', name: 'Normal' },
                    { id: 'hard', name: 'Difícil' },
                    { id: 'expert', name: 'Experto' }
                ],
                genres: [
                    { id: 'action', name: 'Acción' },
                    { id: 'adventure', name: 'Aventura' },
                    { id: 'horror', name: 'Terror' },
                    { id: 'sci-fi', name: 'Ciencia Ficción' },
                    { id: 'fantasy', name: 'Fantasía' },
                    { id: 'shooter', name: 'Disparos' }
                ],
                platforms: [
                    { id: 'pc', name: 'PC' },
                    { id: 'playstation', name: 'PlayStation' },
                    { id: 'xbox', name: 'Xbox' },
                    { id: 'nintendo', name: 'Nintendo' },
                    { id: 'mobile', name: 'Móvil' }
                ]
            };
        }
    }
};

export default searchService;