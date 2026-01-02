import axios from 'axios';

const authorizedAxiosInstance = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor
authorizedAxiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor
authorizedAxiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            // Optional: Redirect to login or dispatch logout action
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default authorizedAxiosInstance;
