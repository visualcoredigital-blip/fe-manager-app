import axios from 'axios';

// Usamos import.meta.env para leer del .env en local y de Vercel en la nube
export const authApi = axios.create({
    baseURL: import.meta.env.VITE_AUTH_API_URL 
});

export const managerApi = axios.create({
    baseURL: import.meta.env.VITE_MANAGER_API_URL
});

// Interceptor para añadir el token automáticamente al Manager
managerApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});