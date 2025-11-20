// src/components/common/forms/LoginForm.jsx
import React, { useState } from 'react';
import useAuth from '../../../hooks/useAuth';

const LoginForm = ({ onSwitchToRegister, onSwitchToForgot }) => {
    // 1. Lógica y hooks: Todo dentro de la función LoginForm
    const { login } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            await login(formData);
        } catch (err) {
            setError(err.message || 'Fallo al iniciar sesión. Verifica tus credenciales.');
        } finally {
            setIsLoading(false);
        }
    };

    // 2. El return DEBE estar aquí, cerrando la función.
    return (
        <form onSubmit={handleSubmit} className="auth-form">
            <h2>🎮 Inicia Sesión</h2>
            {error && <p className="error-message">{error}</p>}

            <div className="form-group">
                <label htmlFor="email">Correo Electrónico</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="password">Contraseña</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
            </div>

            <button type="submit" disabled={isLoading} className="btn btn-primary">
                {isLoading ? 'Cargando...' : 'Entrar a PLAY-ZONE'}
            </button>

            <div className="form-links">
                <button type="button" onClick={onSwitchToRegister} className="btn-link">
                    ¿No tienes cuenta? ¡Regístrate!
                </button>
                <button type="button" onClick={onSwitchToForgot} className="btn-link forgot-link">
                    ¿Olvidaste tu Contraseña?
                </button>
            </div>
        </form>
    ); 
};

export default LoginForm;