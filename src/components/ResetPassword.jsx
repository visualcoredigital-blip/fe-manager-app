import { useState } from 'react';
import { resetPassword } from '../services/authService';
import './Login.css';

const ResetPassword = ({ onFinish }) => {
    const [passwords, setPasswords] = useState({ new: '', confirm: '' });
    const [status, setStatus] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    // Capturamos el token de la URL automáticamente (?token=8c24b9...)
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validación básica en el cliente
        if (passwords.new !== passwords.confirm) {
            return setStatus({ type: 'error-message', text: 'Las contraseñas no coinciden' });
        }

        if (passwords.new.length < 6) {
            return setStatus({ type: 'error-message', text: 'La contraseña debe tener al menos 6 caracteres' });
        }

        setLoading(true);
        setStatus({ type: '', text: '' });

        try {
            await resetPassword(token, passwords.new);
            setStatus({ 
                type: 'success-message', 
                text: '¡Contraseña actualizada con éxito! Redirigiendo...' 
            });
            
            // Esperamos 2 segundos para que el usuario lea el mensaje y volvemos al login
            setTimeout(onFinish, 2500);
        } catch (err) {
            setStatus({ 
                type: 'error-message', 
                text: 'El enlace es inválido o ha expirado. Solicita uno nuevo.' 
            });
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="login-page">
                <div className="login-card">
                    <p className="error-message">Token de recuperación ausente.</p>
                    <button onClick={onFinish} className="login-button">Volver</button>
                </div>
            </div>
        );
    }

    return (
        <div className="login-page">
            <div className="login-card">
                <h2>Nueva Contraseña</h2>
                <p style={{ color: '#666', marginBottom: '20px', fontSize: '0.9rem' }}>
                    Crea una nueva clave de acceso segura.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="password"
                            placeholder="Nueva contraseña"
                            value={passwords.new}
                            onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <input
                            type="password"
                            placeholder="Confirmar contraseña"
                            value={passwords.confirm}
                            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                            required
                        />
                    </div>

                    {status.text && <p className={status.type}>{status.text}</p>}

                    <button 
                        type="submit" 
                        className="login-button" 
                        disabled={loading}
                    >
                        {loading ? 'Actualizando...' : 'Restablecer Contraseña'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;