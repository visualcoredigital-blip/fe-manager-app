import { useState } from 'react';
import { login } from '../services/authService';
import './Login.css';
import Header from './Header';
import Footer from './Footer'; 

const Login = ({ onLoginSuccess, onForgotPassword, isWakingUp }) => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const data = await login(credentials.username, credentials.password);
            localStorage.setItem('username', credentials.username);    
            const token = data?.token || localStorage.getItem('token');
            onLoginSuccess(token);
        } catch (err) {
            setError('Credenciales inválidas. Inténtalo de nuevo.');
        }
    };

    return (
        <div className="main-wrapper">
            <Header />

            <main className="login-container">
                <div className="login-card">
                    {/* AVISO DE DESPERTADO: Dentro del Card para mantener el diseño */}
                    {isWakingUp && (
                        <div className="wake-up-notice-inline">
                            <small>
                                🚀 <strong>Sistemas:</strong> Preparando módulos de seguridad...
                            </small>
                        </div>
                    )}

                    <h2>Iniciar Sesión</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <input
                                type="text"
                                name="username"
                                placeholder="Usuario"
                                value={credentials.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <input
                                type="password"
                                name="password"
                                placeholder="Contraseña"
                                value={credentials.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {error && <p className="error-message">{error}</p>}

                        <button type="submit" className="login-button">
                            Entrar
                        </button>

                        <div className="forgot-password-container">
                            <button 
                                type="button" 
                                className="forgot-password-link"
                                onClick={onForgotPassword}
                            >
                                ¿Olvidó su contraseña?
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Login;