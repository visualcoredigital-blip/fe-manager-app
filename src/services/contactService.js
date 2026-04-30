import { managerApi } from '../api/apiClient';

/**
 * Obtiene contactos paginados.
 * @param {number} page - Número de página (empieza en 0)
 * @param {number} size - Cantidad de registros por página
 */
export const getContacts = async (page = 0, size = 50) => {
    try {
        // Importante: El backend de Java ahora devuelve un objeto Page (content, last, totalElements, etc.)
        const response = await managerApi.get('/api/contacts', {
            params: { page, size }
        });
        return response.data;
    } catch (error) {
        // Propagamos el error para que React Query pueda manejarlo
        throw error.response?.data || new Error("Error al obtener contactos");
    }
};

/**
 * Actualiza el estado de un contacto.
 */
export const updateContactStatus = async (id, nuevoEstado) => {
    try {
        // Enviamos el cuerpo esperado por el @RequestBody Map<String, String> del Controller
        const response = await managerApi.post(`/api/contacts/${id}/status`, {
            estado: nuevoEstado
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || new Error("Error al actualizar el estado");
    }
};