// src/hooks/useActiveUsers.js
import { useState, useEffect } from 'react';
import userService from '../services/userService';

const useActiveUsers = () => {
    const [activeUsers, setActiveUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Llama al servicio real de la API (Requisito 4.4)
                const data = await userService.getActiveUsers(); 
                
                if (data.users && data.users.length > 0) {
                    setActiveUsers(data.users);
                } else {
                    // Si no hay usuarios activos, la lista queda vacía
                    setActiveUsers([]);
                }
            } catch (err) {
                setError("No se pudo cargar la lista de jugadores activos.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchUsers();
    }, []);

    return { activeUsers, isLoading, error };
};

export default useActiveUsers;