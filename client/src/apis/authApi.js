import authorizedAxiosInstance from './axios';

export const loginAPI = async (email, password) => {
    const response = await authorizedAxiosInstance.post('/auth/login', { email, password });
    return response.data;
};

export const registerAPI = async (username, email, password) => {
    const response = await authorizedAxiosInstance.post('/auth/register', { username, email, password });
    return response.data;
};

export const verifyEmailAPI = async (token) => {
    const response = await authorizedAxiosInstance.get(`/auth/verify/${token}`);
    return response.data;
};

export const forgotPasswordAPI = async (email) => {
    const response = await authorizedAxiosInstance.post('/auth/forgotpassword', { email });
    return response.data;
};

export const resetPasswordAPI = async (token, password) => {
    const response = await authorizedAxiosInstance.put(`/auth/resetpassword/${token}`, { password });
    return response.data;
};
