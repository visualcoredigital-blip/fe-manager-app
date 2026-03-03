import { authApi } from '../api/apiClient';

export const login = async (username, password) => {
    try {
        const response = await authApi.post('/api/auth/login', { username, password });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error("Error de conexión");
    }
};