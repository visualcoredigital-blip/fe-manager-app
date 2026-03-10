import managerApi from '../api/apiClient';

export const getUsers = async () => {
  const response = await managerApi.get("/api/users");
  return response.data;
};