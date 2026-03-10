import axios from 'axios';

// Usamos una sola variable base para todo el Backend Manager
const BASE_URL = import.meta.env.VITE_MANAGER_API_URL;

export const managerApi = axios.create({
    baseURL: BASE_URL
});

// Interceptor para añadir el token automáticamente al Manager
managerApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default managerApi;