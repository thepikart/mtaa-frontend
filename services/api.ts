import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const api = axios.create({
    baseURL: process.env.EXPO_PUBLIC_BASE_URL,
});

api.interceptors.request.use(
    async (config) => {
        if (config.url === '/login' || config.url === '/create-account') {
            return config;
        }
        const token = await SecureStore.getItemAsync('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    response => response,
    async (error) => {
        var originalRequest = error.config;
        if (error.response.status === 401) {
            const refreshToken = await SecureStore.getItemAsync('refreshToken');
            if (refreshToken) {
                try {
                    const response = await axios.post(`${process.env.EXPO_PUBLIC_BASE_URL}/refresh-token`, { refreshToken });
                    const { token } = response.data;
                    await SecureStore.setItemAsync('token', token);
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                }
                catch (refreshError) {
                    console.error('Refresh token error:', refreshError);
                    await SecureStore.deleteItemAsync('token');
                    await SecureStore.deleteItemAsync('refreshToken');
                    return Promise.reject(refreshError);
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
