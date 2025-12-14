import React, { useState } from 'react';
import useAuth from '../../../hooks/useAuth';
// ⚠️ IMPORTACIÓN NECESARIA PARA LA REDIRECCIÓN ⚠️
import { useNavigate } from 'react-router-dom';
import logoImage from '../../../assets/logo.jpg'; //

const LoginForm = ({ onSwitchToRegister, onSwitchToForgot }) => {
    const { login } = useAuth();
    const navigate = useNavigate(); // Inicializar hook de navegación
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Prevenir múltiples submissions
        if (isLoading) {
            return;
        }
        
        setError(null);
        setIsLoading(true);

        try {
            const result = await login(formData);

            // 🚀 REDIRECCIÓN CON DELAY PARA PERMITIR ACTUALIZACIÓN DEL CONTEXTO 🚀
            setTimeout(() => {
                navigate('/home', { replace: true });
            }, 500);

        } catch (err) {
            setError(err.message || 'Fallo al iniciar sesión. Verifica tus credenciales.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="modern-auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="logo-section">
                        <div className="logo-icon"><img src={logoImage} alt="Play Zone Logo" className="auth-logo-img" /></div>
                        <h1 className="brand-title">PLAY-ZONE</h1>
                    </div>
                    <h2 className="welcome-text">Bienvenido de vuelta</h2>
                    <p className="subtitle">Inicia sesión para continuar tu aventura</p>
                </div>

                <form onSubmit={handleSubmit} className="modern-auth-form">
                    {error && (
                        <div className="error-alert">
                            <span className="error-icon">⚠️</span>
                            <span className="error-text">{error}</span>
                        </div>
                    )}

                    <div className="input-group">
                        <div className="input-wrapper">
                            <span className="input-icon">📧</span>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="tu@email.com"
                                className="modern-input"
                            />
                            <label htmlFor="email" className="floating-label">Correo Electrónico</label>
                        </div>
                    </div>

                    <div className="input-group">
                        <div className="input-wrapper">
                            <span className="input-icon">🔒</span>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="Tu contraseña"
                                className="modern-input"
                            />
                            <label htmlFor="password" className="floating-label">Contraseña</label>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading} 
                        className={`modern-submit-btn ${isLoading ? 'loading' : ''}`}
                    >
                        <span className="btn-content">
                            {isLoading ? (
                                <>
                                    <span className="spinner"></span>
                                    Iniciando sesión...
                                </>
                            ) : (
                                <>
                                    <span className="btn-icon">🚀</span>
                                    Entrar a PLAY-ZONE
                                </>
                            )}
                        </span>
                    </button>

                    <div className="auth-divider">
                        <span>o</span>
                    </div>

                    <div className="auth-links">
                        <button 
                            type="button" 
                            onClick={onSwitchToRegister} 
                            className="link-btn primary-link"
                        >
                            <span className="link-icon">✨</span>
                            ¿No tienes cuenta? ¡Regístrate!
                        </button>
                        
                        <button 
                            type="button" 
                            onClick={onSwitchToForgot} 
                            className="link-btn secondary-link"
                        >
                            <span className="link-icon">🔑</span>
                            ¿Olvidaste tu contraseña?
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginForm;