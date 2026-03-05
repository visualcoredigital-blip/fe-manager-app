import axios from 'axios';

export const authApi = axios.create({
    baseURL: 'http://localhost:8080/api/contacts/'
});

export const managerApi = axios.create({
    baseURL: 'http://localhost:8080/api/contacts'
});

// Interceptor para añadir el token automáticamente al Manager
managerApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});