// src/hooks/useFavorites.js
import { useState, useEffect } from 'react';
import postService from '../services/postService';
import useAuth from './useAuth';

const useFavorites = () => {
    const [favorites, setFavorites] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    // Debug del estado inicial
    console.log('🏁 useFavorites - Estado inicial:', { favorites, isLoading, error });

    // Función para cargar favoritos
    const fetchFavorites = async () => {
        if (!user) {
            setIsLoading(false);
            setFavorites([]);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            
            const response = await postService.getUserFavorites();
            console.log('🔍 useFavorites - Respuesta completa del backend:', response);
            
            // Manejar diferentes formatos de respuesta
            let favoritesList = [];
            
            if (Array.isArray(response)) {
                favoritesList = response;
                console.log('📋 Formato: Array directo con', response.length, 'elementos');
            } else if (response?.success && response?.data) {
                // Formato: {success: true, data: {favorites: [...]} | [...] | object}
                if (Array.isArray(response.data)) {
                    favoritesList = response.data;
                    console.log('📋 Formato: success.data (array) con', response.data.length, 'elementos');
                } else if (response.data?.favorites && Array.isArray(response.data.favorites)) {
                    favoritesList = response.data.favorites;
                    console.log('📋 Formato: success.data.favorites con', response.data.favorites.length, 'elementos');
                } else if (response.data?.posts && Array.isArray(response.data.posts)) {
                    favoritesList = response.data.posts;
                    console.log('📋 Formato: success.data.posts con', response.data.posts.length, 'elementos');
                } else {
                    console.log('📋 Formato: success.data (object) - explorando keys:', Object.keys(response.data));
                    // Si es un objeto con propiedades, buscar arrays
                    const possibleArrays = Object.values(response.data).filter(val => Array.isArray(val));
                    if (possibleArrays.length > 0) {
                        favoritesList = possibleArrays[0];
                        console.log('📋 Formato: Found array in success.data object con', favoritesList.length, 'elementos');
                    } else {
                        console.log('📋 Formato: success.data no contiene arrays - usando array vacío');
                        favoritesList = [];
                    }
                }
            } else if (response?.favorites && Array.isArray(response.favorites)) {
                favoritesList = response.favorites;
                console.log('📋 Formato: Object.favorites con', response.favorites.length, 'elementos');
            } else if (response?.data && Array.isArray(response.data)) {
                favoritesList = response.data;
                console.log('📋 Formato: Object.data con', response.data.length, 'elementos');
            } else if (response?.posts && Array.isArray(response.posts)) {
                favoritesList = response.posts;
                console.log('📋 Formato: Object.posts con', response.posts.length, 'elementos');
            } else {
                console.warn('⚠️ Formato de respuesta desconocido:', response);
                favoritesList = [];
            }
            
            console.log('✅ Lista final de favoritos procesada:', favoritesList.length, 'items');
            console.log('📝 Primeros favoritos:', favoritesList.slice(0, 2));
            console.log('🔍 Estructura de primer favorito:', favoritesList[0]);
            
            // Debug específico del seteo de estado
            console.log('🎯 Setting favorites state with:', favoritesList);
            console.log('🎯 Tipo de datos:', typeof favoritesList, Array.isArray(favoritesList));
            console.log('🎯 Contenido detallado:', JSON.stringify(favoritesList, null, 2));
            
            setFavorites(favoritesList);
            
            // Verificar inmediatamente después del set (aunque sea asíncrono)
            setTimeout(() => {
                console.log('⚡ Estado de favorites después del set:', favoritesList);
            }, 100);
        } catch (err) {
            console.error('Error cargando favoritos:', err);
            setError('Error al cargar favoritos');
            setFavorites([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Función para remover favorito
    const removeFavorite = async (postId) => {
        try {
            await postService.toggleFavorite(postId);
            
            // Actualización optimista
            setFavorites(prev => prev.filter(post => post._id !== postId));
            
            return { success: true };
        } catch (err) {
            console.error('Error removiendo favorito:', err);
            return { success: false, error: err.message };
        }
    };

    // Cargar favoritos al montar el componente o cambiar usuario
    useEffect(() => {
        fetchFavorites();
    }, [user]);

    // Debug cuando cambie el estado de favorites
    useEffect(() => {
        console.log('🔄 useFavorites - Estado de favorites cambió:', {
            favorites,
            length: favorites?.length,
            isArray: Array.isArray(favorites),
            firstItem: favorites?.[0]
        });
    }, [favorites]);

    // Debug cuando cambie el estado de loading
    useEffect(() => {
        console.log('⏳ useFavorites - Estado de loading cambió:', isLoading);
    }, [isLoading]);

    return {
        favorites,
        isLoading,
        error,
        fetchFavorites,
        removeFavorite,
        favoritesCount: favorites.length
    };
};

export default useFavorites;