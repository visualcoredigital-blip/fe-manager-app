import { managerApi } from '../api/apiClient';

export const getContacts = async () => {
    try {
        const response = await managerApi.get('/api/contacts');
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error("Error al obtener contactos");
    }
};

export const updateContactStatus = async (id, nuevoEstado) => {
    try {
        // Hacemos un PATCH a la ruta del Manager (puerto 8080)
        const response = await managerApi.post(`/api/contacts/${id}/status`, {
            estado: nuevoEstado
        });
        return response.data;
    } catch (error) {
        console.error("Error actualizando estado en el servicio:", error);
        throw error;
    }
};