// src/components/common/AdminProtection.jsx
import React from 'react';
import useAdmin from '../../hooks/useAdmin';

/**
 * Componente para proteger contenido solo para administradores
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenido a mostrar solo a admins
 * @param {React.ReactNode} props.fallback - Contenido alternativo para no-admins
 * @param {string} props.message - Mensaje personalizado de no autorizado
 */
const AdminProtection = ({ 
    children, 
    fallback = null, 
    message = "No tienes permisos de administrador para acceder a esta función." 
}) => {
    const { isAdmin } = useAdmin();

    if (!isAdmin) {
        return fallback || (
            <div style={{
                padding: '2rem',
                textAlign: 'center',
                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                border: '2px solid #f59e0b',
                borderRadius: '12px',
                margin: '1rem',
                color: '#92400e'
            }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem' }}>🔒 Acceso Restringido</h3>
                <p style={{ margin: '0', lineHeight: '1.5' }}>{message}</p>
            </div>
        );
    }

    return children;
};

export default AdminProtection;