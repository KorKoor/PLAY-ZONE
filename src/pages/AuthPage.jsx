import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LoginForm from '../components/common/forms/LoginForm';
import RegisterForm from '../components/common/forms/RegisterForm';
import ForgotPasswordForm from '../components/common/forms/ForgotPasswordForm';

const AuthPage = () => {
    // Usamos el estado interno para manejar el modo de la página, ya que /login y /register 
    // comparten la misma vista, pero el modo 'forgot' es un estado temporal.
    const location = useLocation();
    const navigate = useNavigate();

    // Determinar el modo inicial basado en la URL
    const [mode, setMode] = useState(
        location.pathname.includes('/register') ? 'register' : 'login'
    );

    const renderForm = () => {
        // Funciones de switch para los botones internos
        const switchToLogin = () => {
            navigate('/login'); // Cambia la URL
            setMode('login'); // Cambia el modo interno
        };
        const switchToRegister = () => {
            navigate('/register');
            setMode('register');
        };
        const switchToForgot = () => {
            // No cambiamos la URL, solo el modo interno para mostrar el formulario
            setMode('forgot');
        };

        switch (mode) {
            case 'register':
                return <RegisterForm onSwitchToLogin={switchToLogin} />;

            case 'forgot':
                return <ForgotPasswordForm onSwitchToLogin={switchToLogin} />;

            case 'login':
            default:
                return (
                    <LoginForm
                        onSwitchToRegister={switchToRegister} // Lógica para ir a /register
                        onSwitchToForgot={switchToForgot}     // Lógica para ir a la vista ForgotPassword
                    />
                );
        }
    };

    return (
        <div className="auth-page-container">
            {renderForm()}
        </div>
    );
};

export default AuthPage;