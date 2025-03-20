import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { ApiError } from '../types/auth.types';

// Базовый URL API
const BASE_URL = '/api';

// Создаем экземпляр axios с базовым URL
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Интерцептор для добавления токена к запросам
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);

// Интерцептор для обработки ошибок
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    const apiError: ApiError = {
      message: typeof error.response?.data === 'string'
        ? error.response.data
        : 'Произошла ошибка при выполнении запроса',
      status: error.response?.status
    };
    
    return Promise.reject(apiError);
  }
);

export default api;