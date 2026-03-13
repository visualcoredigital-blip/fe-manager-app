import managerApi from '../api/apiClient';

export const getUsers = async () => {
  const response = await managerApi.get("/api/users");
  return response.data;
};

export const deleteUser = async (id) => {
    // Apunta al backend-manager
    const response = await managerApi.delete(`/api/users/${id}`);
    return response.data;
};

export const updateUser = async (id, userData) => {
  const response = await managerApi.put(`/api/users/${id}`, userData);
  return response.data;
};