import axios from 'axios';

// Cliente para el Auth-Service (Puerto 8081)
export const authApi = axios.create({
    baseURL: import.meta.env.VITE_AUTH_API_URL
});

// Cliente para el App-Manager (Puerto 8080)
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