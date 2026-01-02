import authorizedAxiosInstance from './axios';

export const fetchUsersAPI = async () => {
    const response = await authorizedAxiosInstance.get('/users');
    return response.data;
};
