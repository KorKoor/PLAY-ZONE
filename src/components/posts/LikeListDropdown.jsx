// src/components/posts/LikeListDropdown.jsx

import React from 'react';
import { FaTimes, FaHeart, FaUserCircle } from 'react-icons/fa';

// Asumimos que 'likesList' es un array de objetos con { alias, avatarUrl, _id }
const LikeListDropdown = ({ likesList, onClose }) => {

    // Si la lista de likes es pequeña, la mostramos estáticamente.
    // En una aplicación real, se usaría paginación aquí.
    if (!likesList || likesList.length === 0) return (
        <div className="like-list-dropdown no-likes">
            <h4>❤️ Likes</h4>
            <p>Se el primero en dar like a esta publicación.</p>
            <button onClick={onClose} className="btn-close-list"><FaTimes /></button>
        </div>
    );

    return (
        <div className="like-list-dropdown">
            <button onClick={onClose} className="btn-close-list"><FaTimes /></button>
            <h4>❤️ Usuarios que dieron Me Gusta ({likesList.length})</h4>
            <ul>
                {likesList.map((user) => (
                    <li
                        key={user._id || user.id}
                    // onClick={() => navigate(`/profile/${user._id}`)} // Navegacion al perfil
                    >
                        <img
                            src={user.avatarUrl || '/default-avatar.png'}
                            alt={user.alias}
                            className="like-user-avatar"
                        />
                        <span className="like-user-alias">{user.alias}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default LikeListDropdown;