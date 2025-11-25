// src/components/users/ProfileEditModal.jsx

import React, { useState, useRef } from 'react';
import userService from '../../services/userService';
import { post } from '../../services/httpService';
import { FaTimes, FaSave, FaLock, FaSpinner, FaUpload, FaTrashAlt, FaSyncAlt } from 'react-icons/fa';
import { useUpdateProfile } from '../../hooks/useUpdateProfile';
import { useAuthContext } from '../../context/AuthContext';

const ProfileEditModal = ({ user, onClose, onSuccess }) => {
    const { updateProfile } = useUpdateProfile();
    const { setUser } = useAuthContext();   // 👈 ahora sí usamos el contexto
    const fileInputRef = useRef(null);

    const [selectedFile, setSelectedFile] = useState(null);
    const [previewAvatar, setPreviewAvatar] = useState(user.avatarUrl);
    const [formData, setFormData] = useState({
        description: user.description || '',
        consoles: Array.isArray(user.consoles) ? user.consoles.join(', ') : user.consoles || '',
        genres: Array.isArray(user.genres) ? user.genres.join(', ') : user.genres || '',
    });
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
    const [tab, setTab] = useState('info');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e) => {
        setPasswordData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const Spinner = () => <FaSpinner className="spinner" />;

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewAvatar(URL.createObjectURL(file));
        }
    };

    const uploadFile = async (file) => {
        const formDataUpload = new FormData();
        formDataUpload.append('avatar', file);
        try {
            const response = await post('/upload/avatar', formDataUpload);
            return response.imageUrl;
        } catch {
            throw new Error("Fallo al subir el archivo. Intenta con una imagen más pequeña.");
        }
    };

    const handleSaveInfo = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);
        setSuccessMessage(null);
        let finalAvatarUrl = user.avatarUrl;
        try {
            if (selectedFile) {
                setSuccessMessage("Subiendo nuevo avatar...");
                finalAvatarUrl = await uploadFile(selectedFile);
            }
            const updatesToSend = {
                ...formData,
                avatarUrl: finalAvatarUrl,
                consoles: formData.consoles.split(',').map(s => s.trim()).filter(s => s),
                genres: formData.genres.split(',').map(s => s.trim()).filter(s => s),
            };
            const result = await updateProfile(updatesToSend);
            if (result.success) {
                setSuccessMessage("Perfil actualizado con éxito.");
                onSuccess();
                setPreviewAvatar(finalAvatarUrl);

                // 👇 refresca el AuthContext para que el Header se actualice y evite caché
                setUser(prev => ({
                    ...prev,
                    ...updatesToSend,
                    avatarUrl: `${finalAvatarUrl}?v=${Date.now()}`
                }));


                setTimeout(onClose, 1500);
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError(err.message || "Fallo al guardar la información.");
        } finally {
            setIsSaving(false);
            if (finalAvatarUrl !== user.avatarUrl) {
                setSelectedFile(null);
            }
        }
    };

    const handleSavePassword = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);
        setSuccessMessage(null);
        const { currentPassword, newPassword } = passwordData;
        if (newPassword.length < 8) {
            setError("La nueva contraseña debe tener al menos 8 caracteres.");
            setIsSaving(false);
            return;
        }
        if (currentPassword === newPassword) {
            setError("La nueva contraseña debe ser diferente a la actual.");
            setIsSaving(false);
            return;
        }
        try {
            await userService.changePassword(passwordData);
            setSuccessMessage("Contraseña cambiada con éxito.");
            setPasswordData({ currentPassword: '', newPassword: '' });
        } catch (err) {
            setError(err.message || "Error: contraseña actual incorrecta o fallo en el servidor.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="profile-edit-modal-card">
                <button onClick={onClose} className="btn-close-modal"><FaTimes /></button>
                <h2>Editar Perfil de {user.alias}</h2>

                <div className="modal-tabs">
                    <button onClick={() => setTab('info')} className={tab === 'info' ? 'active' : ''}><FaSave /> Información Básica</button>
                    <button onClick={() => setTab('password')} className={tab === 'password' ? 'active' : ''}><FaLock /> Seguridad</button>
                </div>

                {error && <p className="error-message">{error}</p>}
                {successMessage && <p className="success-message">{successMessage}</p>}

                {tab === 'info' && (
                    <form onSubmit={handleSaveInfo} className="edit-form info-tab">
                        <div className="avatar-preview-container">
                            <img
                                src={previewAvatar || '/default-avatar.svg'}
                                alt="Previsualización de Avatar"
                                className="avatar-preview"
                            />
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                style={{ display: 'none' }}
                                accept="image/jpeg, image/png"
                                name="avatar"
                            />
                            <div className="upload-actions">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current.click()}
                                    className="btn btn-secondary btn-upload"
                                    disabled={isSaving}
                                >
                                    <FaUpload /> {selectedFile ? `Cargar ${selectedFile.name}` : 'Seleccionar Avatar'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setSelectedFile(null); setPreviewAvatar(user.avatarUrl); }}
                                    className="btn btn-icon-clear"
                                    title="Restaurar avatar anterior"
                                    disabled={!selectedFile && previewAvatar === user.avatarUrl}
                                >
                                    <FaSyncAlt />
                                </button>
                            </div>
                        </div>

                        <div className="form-group"><label>Descripción / Bio</label><textarea name="description" value={formData.description} onChange={handleChange} rows="3" placeholder="Escribe algo sobre ti y tus juegos favoritos..."></textarea></div>
                        <div className="form-group"><label>Consolas (separar con comas)</label><input type="text" name="consoles" value={formData.consoles} onChange={handleChange} placeholder="Ej: PS5, Xbox Series X, PC" /></div>
                        <div className="form-group"><label>Géneros (separar con comas)</label><input type="text" name="genres" value={formData.genres} onChange={handleChange} placeholder="Ej: RPG, Estrategia, FPS" /></div>

                        <button type="submit" disabled={isSaving} className="btn btn-primary">
                            {isSaving ? <><Spinner /> Guardando...</> : <><FaSave /> Guardar Información</>}
                        </button>
                    </form>
                )}

                {tab === 'password' && (
                    <form onSubmit={handleSavePassword} className="edit-form password-tab">
                        <p className="password-note">Para tu seguridad, necesitamos la contraseña actual y una nueva con al menos 8 caracteres.</p>
                        <div className="form-group"><label>Contraseña Actual</label><input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} required /></div>
                        <div className="form-group"><label>Nueva Contraseña</label><input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} required /></div>

                        <button type="submit" disabled={isSaving} className="btn btn-primary">
                            {isSaving ? <><Spinner /> Cambiando...</> : <><FaLock /> Cambiar Contraseña</>}
                        </button>

                        <button type="button" className="btn btn-danger-link" onClick={() => console.log('Abrir modal de confirmación para eliminar cuenta.')}>
                            <FaTrashAlt /> Eliminar Cuenta
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ProfileEditModal;
