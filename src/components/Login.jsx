import { useState } from 'react';
import { login } from '../services/authService';

const Login = ({ onLoginSuccess }) => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(credentials.username, credentials.password);
            onLoginSuccess(); // Avisamos al padre que ya tenemos token
        } catch (err) {
            setError('Credenciales inválidas. Inténtalo de nuevo.');
        }
    };

    return (
        <div style={{ maxWidth: '300px', margin: '100px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2>Iniciar Sesión</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '10px' }}>
                    <input
                        type="text"
                        name="username"
                        placeholder="Usuario"
                        value={credentials.username}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px' }}
                        required
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <input
                        type="password"
                        name="password"
                        placeholder="Contraseña"
                        value={credentials.password}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px' }}
                        required
                    />
                </div>
                {error && <p style={{ color: 'red', fontSize: '12px' }}>{error}</p>}
                <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Entrar
                </button>
            </form>
        </div>
    );
};

export default Login;