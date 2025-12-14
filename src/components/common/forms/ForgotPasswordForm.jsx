// src/components/common/forms/ForgotPasswordForm.jsx
import React, { useState } from 'react';
import userService from '../../../services/userService';
import { FaEnvelope } from 'react-icons/fa'; // Importamos el icono para el input

// Prop: onSwitchToLogin se usa para volver a la vista de inicio de sesión
const ForgotPasswordForm = ({ onSwitchToLogin }) => {
    // Usamos 'email' directamente ya que solo es un campo
    const [email, setEmail] = useState('');
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setMessage(null);
        setIsLoading(true);

        try {
            // Asume una llamada a la API para enviar el correo de reseteo
            // Nota: Aquí usarías userService.sendPasswordResetEmail(email);
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulación de API
            console.log('Solicitud de reseteo enviada para:', email);

            setMessage('✅ Correo de reseteo enviado. ¡Revisa tu bandeja de entrada!');
            setEmail(''); // Limpiar el campo después de un éxito
        } catch (err) {
            // Manejo de errores simulado
            setError('Fallo al enviar el correo. Verifica tu dirección o intenta más tarde.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-card">
            <div className="auth-header">
                <h2 className="welcome-text">Recuperar Acceso</h2>
                <p className="subtitle">Introduce tu correo electrónico para enviarte las instrucciones de reseteo.</p>
            </div>

            <form onSubmit={handleSubmit} className="modern-auth-form">

                {/* Mensajes de feedback */}
                {error && <div className="error-alert"><span className="error-icon">⚠️</span>{error}</div>}
                {message && <div className="success-message"><span className="success-icon">📧</span>{message}</div>}

                {/* Campo Correo Electrónico */}
                <div className="input-group">
                    <div className="input-wrapper">
                        <span className="input-icon">
                            <FaEnvelope /> {/* Usamos el icono de React */}
                        </span>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="tu@email.com"
                            className="modern-input"
                        /> {/* <-- La etiqueta se cierra correctamente con /> */}
                        <label htmlFor="email" className="floating-label">Correo Electrónico</label>
                    </div>
                </div>

                {/* Botón de Submit */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className={`modern-submit-btn ${isLoading ? 'loading' : ''}`}
                >
                    <span className="btn-content">
                        {isLoading ? (
                            <>
                                <span className="spinner"></span>
                                Enviando...
                            </>
                        ) : (
                            <>
                                <span className="btn-icon">📬</span>
                                Enviar Enlace de Reseteo
                            </>
                        )}
                    </span>
                </button>

                {/* Enlace para volver a Iniciar Sesión */}
                <div className="form-links">
                    <button
                        type="button"
                        onClick={onSwitchToLogin}
                        className="link-btn secondary-link"
                    >
                        <span className="link-icon">⬅️</span>
                        Volver al Inicio de Sesión
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ForgotPasswordForm;