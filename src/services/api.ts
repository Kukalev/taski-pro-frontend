import axios from 'axios'
import {getTokens} from './auth/utils/TokenStorage'
import {AuthService} from './auth/Auth'

// Создаем экземпляр axios
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

// Добавляем токен к запросам
api.interceptors.request.use(config => {
  const tokens = getTokens();
  if (tokens?.accessToken && config.url !== '/auth/refresh_token') {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  return config;
});

// // Прямой метод для запроса обновления токена
// const refreshTokenRequest = async () => {
//   const tokens = getTokens();
//
//   if (!tokens?.refreshToken) {
//     console.log("Нет refresh token для обновления.");
//     return null;
//   }
//
//   try {
//     console.log("Попытка обновить токен...");
//     // Отправляем refresh token в ТЕЛЕ запроса
//     const response = await axios.post('/api/auth/refresh_token',
//       { refreshToken: tokens.refreshToken },
//       {
//         headers: {
//           'Content-Type': 'application/json',
//         }
//       }
//     );
//
//     if (response.data?.accessToken) {
//       console.log("Токен успешно обновлен.");
//       saveTokens({
//         accessToken: response.data.accessToken,
//         refreshToken: response.data.refreshToken,
//         username: tokens?.username || ''
//       });
//       return response.data.accessToken;
//     }
//     console.log("Ответ сервера на обновление токена не содержит accessToken.");
//     return null;
//   } catch (error: any) {
//     console.error('Ошибка при обновлении токена:', error);
//     if (error.response) {
//       console.error('Ошибка обновления токена - Статус:', error.response.status);
//       console.error('Ошибка обновления токена - Данные:', error.response.data);
//     }
//     return null;
//   }
// };

// Флаг и очередь для обработки параллельных запросов при обновлении токена
let isRefreshing = false;
let failedQueue: Array<{resolve: (value: unknown) => void, reject: (reason?: any) => void}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Обработка обновления токена при ошибке 401
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Интересует только 401 ошибка и если это не запрос на обновление токена И не повторный запрос
    if (error.response?.status !== 401 || originalRequest.url === '/auth/refresh_token' || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Если уже идет обновление, ставим запрос в очередь
    if (isRefreshing) {
      return new Promise(function(resolve, reject) {
        failedQueue.push({resolve, reject});
      }).then(token => {
        // Этот код выполнится, когда токен успешно обновится
        originalRequest.headers['Authorization'] = 'Bearer ' + token;
        return api(originalRequest);
      }).catch(err => {
        // Этот код выполнится, если обновление токена не удалось (и был вызван logout)
        return Promise.reject(err);
      });
    }

    // Отмечаем начало процесса обновления
    originalRequest._retry = true; // Помечаем запрос как повторный (для избежания цикла)
    isRefreshing = true;

    try {
      const newToken = await refreshTokenRequest();
      if (newToken) {
        console.log("Обновление токена успешно, повторяем исходный запрос и обрабатываем очередь.");
        api.defaults.headers.common['Authorization'] = 'Bearer ' + newToken; // Обновляем токен по умолчанию для будущих запросов
        originalRequest.headers['Authorization'] = 'Bearer ' + newToken; // Обновляем токен для текущего запроса
        processQueue(null, newToken); // Обрабатываем очередь с новым токеном
        return api(originalRequest); // Повторяем исходный запрос
      } else {
        // Если refreshTokenRequest вернул null (не удалось обновить)
        console.log("Не удалось обновить токен. Выход из системы.");
        const logoutError = new Error("Session expired or invalid. Please login again.");
        processQueue(logoutError, null); // Отклоняем запросы в очереди с ошибкой
        AuthService.logout(); // <-- Вызываем logout из AuthService
        return Promise.reject(logoutError); // Возвращаем ошибку
      }
    } catch (refreshError) {
      console.error("Критическая ошибка при попытке обновления токена:", refreshError);
      processQueue(refreshError, null); // Отклоняем запросы в очереди с ошибкой
      AuthService.logout(); // <-- Вызываем logout из AuthService
      return Promise.reject(refreshError); // Пробрасываем ошибку обновления
    } finally {
      isRefreshing = false; // Завершаем процесс обновления
    }
  }
);

export default api;
