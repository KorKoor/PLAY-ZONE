import React, { useState, useCallback } from 'react';
import userService from '../../../services/userService';
// Asegúrate de haber instalado esta librería: npm install react-icons
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

// Función de debounce (fuera del componente para evitar recreación innecesaria)
const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => { func.apply(this, args); }, delay);
    };
};

const RegisterForm = ({ onSwitchToLogin }) => {
    const [formData, setFormData] = useState({
        name: '',
        alias: '', // Requisito 1.1: alias gamer
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Estado para la disponibilidad del correo (Requisito 1.9)
    const [emailAvailable, setEmailAvailable] = useState(true);
    const [isCheckingEmail, setIsCheckingEmail] = useState(false);

    // Estado para los requisitos de contraseña (Seguridad/UX)
    const [passwordRequirements, setPasswordRequirements] = useState({
        minChars: false,
        hasUpper: false,
        hasNumber: false,
        match: false,
    });

    // Función principal de validación de contraseña
    const validatePassword = useCallback((password, confirm) => {
        const minChars = password.length >= 8;
        const hasUpper = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const match = password === confirm && password.length > 0;

        setPasswordRequirements({ minChars, hasUpper, hasNumber, match });

        return minChars && hasUpper && hasNumber && match;
    }, []);


    // Lógica para verificar la disponibilidad del correo usando debounce
    const checkEmailAvailability = async (email) => {
        if (email.length < 5) {
            setEmailAvailable(true);
            return;
        }
        setIsCheckingEmail(true);
        try {
            // Asumimos un endpoint 'check-email' en userService para el Requisito 1.9
            // const response = await userService.checkEmail(email); 

            // Simulación temporal: asumir que el correo 'test@playzone.com' está ocupado
            await new Promise(resolve => setTimeout(resolve, 300));
            const isAvailable = email !== 'test@playzone.com';

            setEmailAvailable(isAvailable);
        } catch (e) {
            setEmailAvailable(false);
        } finally {
            setIsCheckingEmail(false);
        }
    };

    const debouncedCheckEmail = useCallback(debounce(checkEmailAvailability, 500), []);


    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'password' || name === 'confirmPassword') {
            const currentPassword = name === 'password' ? value : formData.password;
            const currentConfirm = name === 'confirmPassword' ? value : formData.confirmPassword;
            validatePassword(currentPassword, currentConfirm);
        }
        // Nota: La lógica de email se maneja en handleEmailChange
    };

    // FUNCIÓN FALTANTE QUE RESUELVE EL ERROR 'no-undef'
    const handleEmailChange = (e) => {
        handleChange(e);
        debouncedCheckEmail(e.target.value);
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        setError(null);

        // 1. Validación front-end
        const isValid = validatePassword(formData.password, formData.confirmPassword);

        if (!isValid) {
            setError('La contraseña no cumple con todos los requisitos.');
            return;
        }
        if (!emailAvailable) {
            setError('El correo electrónico ya está en uso o no es válido.');
            return;
        }
        if (isCheckingEmail) {
            setError('Espera a que se verifique la disponibilidad del correo.');
            return;
        }

        setIsLoading(true);

        try {
            await userService.registerUser({
                name: formData.name,
                alias: formData.alias,
                email: formData.email,
                password: formData.password,
            });

            setMessage('✅ ¡Registro exitoso! Redirigiendo al inicio de sesión...');
            setTimeout(() => onSwitchToLogin(), 2000);

        } catch (err) {
            setError(err.message || 'Fallo al registrar. Intenta más tarde.');
        } finally {
            setIsLoading(false);
        }
    };

    // Componente de ayuda para mostrar el estado de los requisitos
    const RequirementItem = ({ condition, text }) => (
        <li className={condition ? 'req-fulfilled' : 'req-unfulfilled'}>
            {condition ? <FaCheckCircle /> : <FaTimesCircle />} {text}
        </li>
    );

    // Deshabilita el botón si aún está cargando o si la validación falla
    const isFormValid = Object.values(passwordRequirements).every(req => req) &&
        formData.name.length > 0 && formData.alias.length > 0 &&
        emailAvailable && !isCheckingEmail;

    return (
        <form onSubmit={handleSubmit} className="auth-form">
            <h1>Register</h1>
            <h2>✨ Únete a PLAY-ZONE</h2>
            {error && <p className="error-message">{error}</p>}
            {message && <p className="success-message">{message}</p>}

            <div className="form-group"><label htmlFor="name">Nombre</label><input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required /></div>
            <div className="form-group"><label htmlFor="alias">Alias Gamer</label><input type="text" id="alias" name="alias" value={formData.alias} onChange={handleChange} required /></div>

            <div className="form-group">
                <label htmlFor="email">Correo Electrónico Único</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleEmailChange} required />
                <div className="email-status">
                    {isCheckingEmail && <span className="status-checking">Verificando...</span>}
                    {/* Solo mostrar status si se ha escrito un correo con longitud considerable */}
                    {!isCheckingEmail && formData.email.length > 5 && !emailAvailable && (
                        <span className="status-unavailable"><FaTimesCircle /> Correo ya en uso</span>
                    )}
                    {!isCheckingEmail && formData.email.length > 5 && emailAvailable && (
                        <span className="status-available"><FaCheckCircle /> Correo disponible</span>
                    )}
                </div>
            </div>

            <div className="form-group"><label htmlFor="password">Contraseña</label><input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required /></div>
            <div className="form-group"><label htmlFor="confirmPassword">Confirmar Contraseña</label><input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required /></div>

            {/* Lista de requisitos de contraseña (UX mejorado) */}
            <div className="password-requirements">
                <p>La contraseña debe tener:</p>
                <ul>
                    <RequirementItem condition={passwordRequirements.minChars} text="Mínimo 8 caracteres" />
                    <RequirementItem condition={passwordRequirements.hasUpper} text="Al menos una mayúscula (A-Z)" />
                    <RequirementItem condition={passwordRequirements.hasNumber} text="Al menos un número (0-9)" />
                    <RequirementItem condition={passwordRequirements.match} text="Coincide con la confirmación" />
                </ul>
            </div>

            <button type="submit" disabled={isLoading || !isFormValid} className="btn btn-primary">
                {isLoading ? 'Registrando...' : 'Crear Cuenta'}
            </button>

            <div className="form-links">
                <button type="button" onClick={onSwitchToLogin} className="btn-link">
                    ¿Ya tienes cuenta? Inicia Sesión
                </button>
            </div>
        </form>
    );
};

export default RegisterForm;