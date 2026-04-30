import axios from 'axios';

// Creamos una instancia limpia para Auth (Puerto 8001)
const authApi = axios.create({
    baseURL: import.meta.env.VITE_AUTH_API_URL
});

export const login = async (username, password) => {
    try {
        // URL Resultante: http://localhost:8001/api/auth/login
        const response = await authApi.post('/api/auth/login', { username, password });
        
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error("Error de conexión al servicio de autenticación");
    }
};

export const forgotPassword = async (email) => {
    try {
        const response = await authApi.post('/api/users/forgot-password', { email });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error("Error al solicitar recuperación");
    }
};

export const resetPassword = async (token, newPassword) => {
    // Asegúrate de que VITE_AUTH_API_URL apunte al puerto 8001
    const response = await fetch(`${import.meta.env.VITE_AUTH_API_URL}/api/users/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al restablecer contraseña');
    }
    return await response.json();
};