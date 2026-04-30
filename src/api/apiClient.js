import axios from 'axios';

/**
 * CLIENTE PARA EL MANAGER (Puerto 8000)
 * Se encarga de contactos y gestión de datos.
 */
const MANAGER_BASE_URL = import.meta.env.VITE_MANAGER_API_URL;

export const managerApi = axios.create({
    baseURL: MANAGER_BASE_URL
});

// Interceptor para añadir el token (solo al Manager)
managerApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

/**
 * CLIENTE PARA EL AUTH (Puerto 8001)
 * Se encarga de login, logout y recuperación de contraseña.
 * Generalmente no lleva interceptor de token porque se usa para 
 * endpoints públicos o el token se envía manualmente.
 */
const AUTH_BASE_URL = import.meta.env.VITE_AUTH_API_URL;

export const authApi = axios.create({
    baseURL: AUTH_BASE_URL
});

export default managerApi;