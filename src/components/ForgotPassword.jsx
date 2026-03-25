import { useState } from 'react';
import { forgotPassword } from '../services/authService';
import './Login.css'; 
import Header from './Header'; 
import Footer from './Footer'; 

const ForgotPassword = ({ onBack }) => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', text: '' });

        try {
            await forgotPassword(email);
            setStatus({ 
                type: 'success-message', 
                text: '¡Enlace enviado! Revisa tu correo electrónico.' 
            });
        } catch (err) {
            setStatus({ 
                type: 'error-message', 
                text: 'No pudimos encontrar una cuenta con ese correo.' 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="main-wrapper">
            {/* 1. Header Superior */}
            <Header />

            {/* 2. Contenedor Central Centrado */}
            <main className="login-container">
                <div className="login-card">
                    <h2>Recuperar Acceso</h2>
                    <p style={{ color: '#64748b', marginBottom: '25px', fontSize: '0.95rem', lineHeight: '1.5' }}>
                        Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
                    </p>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <input
                                type="email"
                                placeholder="Correo electrónico"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        {status.text && <p className={status.type}>{status.text}</p>}

                        <button 
                            type="submit" 
                            className="login-button" 
                            disabled={loading}
                        >
                            {loading ? 'Enviando...' : 'Enviar Enlace'}
                        </button>

                        <div className="forgot-password-container">
                            <button 
                                type="button" 
                                className="forgot-password-link"
                                onClick={onBack}
                            >
                                ← Volver al inicio de sesión
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            {/* 3. Footer Inferior */}
            <Footer />
        </div>
    );
};

export default ForgotPassword;