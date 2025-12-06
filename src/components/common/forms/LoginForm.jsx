import React, { useState } from 'react';
import useAuth from '../../../hooks/useAuth';
// ⚠️ IMPORTACIÓN NECESARIA PARA LA REDIRECCIÓN ⚠️
import { useNavigate } from 'react-router-dom';

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
        setError(null);
        setIsLoading(true);

        try {
            console.log('Iniciando login...', formData.email);
            const result = await login(formData);
            console.log('Login exitoso:', result);

            // 🚀 REDIRECCIÓN CON DELAY PARA PERMITIR ACTUALIZACIÓN DEL CONTEXTO 🚀
            console.log('Esperando actualización del contexto...');
            setTimeout(() => {
                console.log('Navegando a /home...');
                navigate('/home', { replace: true });
            }, 100); // 100ms delay

        } catch (err) {
            console.error('Error en login:', err);
            // El error debe ser el mensaje devuelto por la API (ej: Credenciales inválidas)
            setError(err.message || 'Fallo al iniciar sesión. Verifica tus credenciales.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="auth-form">
            <h1>Login</h1>
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
                {/* Estos botones ahora llaman a las funciones que cambian el modo/ruta en AuthPage */}
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