import { managerApi } from '../api/apiClient';

export const login = async (username, password) => {
    try {
        const response = await managerApi.post('/api/contacts/auth/login-proxy', { username, password });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error("Error de conexión");
    }
};

export const forgotPassword = async (email) => {
    try {
        const response = await managerApi.post('/api/users/forgot-password', { email });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error("Error al enviar el correo");
    }
};

export const resetPassword = async (token, newPassword) => {
    try {
        const response = await managerApi.post('/api/users/reset-password', { token, newPassword });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error("Error al restablecer la contraseña");
    }
};