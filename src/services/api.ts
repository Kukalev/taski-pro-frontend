import axios from 'axios'
import {getTokens, saveTokens} from './auth/utils/TokenStorage'

// Создаем экземпляр axios
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

// Добавляем токен к запросам
api.interceptors.request.use(config => {
  const tokens = getTokens();
  if (tokens?.accessToken) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  return config;
});

// Прямой метод для запроса обновления токена
const refreshTokenRequest = async () => {
  const tokens = getTokens();

  if (!tokens?.refreshToken) return null;

  try {
    // Используем проксированный путь и отправляем токен в теле запроса
    const response = await axios.post('/api/auth/refresh_token', 
      { refreshToken: tokens.refreshToken },
      {
        headers: { 
          'Content-Type': 'application/json',
        }
      }
    );
    
    if (response.data?.accessToken) {
      saveTokens({
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
        username: tokens?.username || ''
      });
      return response.data.accessToken;
    }
  } catch (error) {
    console.error('Ошибка при обновлении токена:', error);
  }
  
  return null;
};

// Обработка обновления токена при ошибке 401
api.interceptors.response.use(
  response => response,
  async error => {
    // Пропускаем запросы с меткой или повторные попытки
    if (error.config?._skipAuthRefresh || 
        error.config?._isRetry || 
        error.response?.status !== 401) {
      return Promise.reject(error);
    }
    
    error.config._isRetry = true;
    
    try {
      // Используем нашу прямую функцию для обновления токена
      const newToken = await refreshTokenRequest();
      if (newToken) {
        // Повторяем оригинальный запрос с новым токеном
        return api(error.config);
      }
    } catch (error: unknown) {
      console.error(error, 'Не удалось обновить токен');
    }
    
    return Promise.reject(error);
  }
);

export default api;
