import axios from 'axios'
import {getTokens, saveTokens} from './auth/utils/TokenStorage'
import {jwtDecode} from 'jwt-decode'

// Ожидаемая структура payload внутри JWT
interface DecodedToken {
    sub: string; // Поле 'subject', содержащее username
    iat?: number;
    exp?: number;
}

// Создаем экземпляр axios
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

// --- ОБНОВЛЕННЫЙ СПИСОК ПУБЛИЧНЫХ МАРШРУТОВ ---
const PUBLIC_PATHS = [
    '/v1/auth/login',
    '/v1/auth/registration', // Оставил registration, если он используется
    // Добавляем маршруты для сброса пароля
    '/v1/profile/forgot-password',
    '/v1/profile/is-valid-code',        // <--- Добавлен маршрут проверки кода
    '/v1/profile/update-password-without-auth' // <--- Добавлен маршрут обновления пароля без авторизации
];
// ----------------------------------------------

const GET_USER_COLOR_PATH = '/v1/users/color'; // Определим путь цвета здесь для сравнения

// Добавляем токен к запросам, КРОМЕ ПУБЛИЧНЫХ
api.interceptors.request.use(config => {
  const tokens = getTokens();
  const urlPath = config.url;

  // Проверяем, начинается ли путь с одного из публичных
  // Используем startsWith для большей надежности (например, если будут параметры запроса)
  const isPublic = urlPath && PUBLIC_PATHS.some(publicPath => urlPath.startsWith(publicPath));

  if (tokens?.accessToken && !isPublic) {
    console.log(`[Request Interceptor] Добавляем Auth Header для ${urlPath}`);
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  } else {
    console.log(`[Request Interceptor] НЕ добавляем Auth Header для ${urlPath} (isPublic: ${isPublic}, tokenExists: ${!!tokens?.accessToken})`);
  }
  return config;
});

// --- Функция для запроса обновления токена ---
const refreshTokenRequest = async () => {
  const tokens = getTokens();
  const refreshTokenPath = '/api/v1/auth/refresh_token';

  if (!tokens?.refreshToken) {
    console.log("[refreshTokenRequest] Нет refresh token для обновления.");
    throw new Error("Refresh token not found");
  }

  try {
    console.log("[refreshTokenRequest] Попытка обновить токен...");
    const response = await axios.post(refreshTokenPath,
      { refreshToken: tokens.refreshToken },
      { headers: { 'Content-Type': 'application/json' } }
    );

    if (response.data?.accessToken) {
      console.log("[refreshTokenRequest] Токен успешно обновлен сервером.");
      const newAccessToken = response.data.accessToken;
      const newRefreshToken = response.data.refreshToken;

      let usernameFromNewToken: string | undefined;
      try {
          const decodedToken = jwtDecode<DecodedToken>(newAccessToken);
          usernameFromNewToken = decodedToken.sub;
          console.log('[refreshTokenRequest] Username из нового токена:', usernameFromNewToken);
      } catch (decodeError) {
          console.error("[refreshTokenRequest] Ошибка декодирования нового accessToken:", decodeError);
          usernameFromNewToken = tokens.username;
      }

      saveTokens({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken || tokens.refreshToken,
        username: usernameFromNewToken || tokens.username || ''
      });
      console.log("[refreshTokenRequest] Новые токены сохранены.");
      return newAccessToken;
    } else {
       console.log("[refreshTokenRequest] Ответ сервера на обновление токена не содержит accessToken.");
       throw new Error("Invalid response from refresh token endpoint");
    }
  } catch (error: any) {
    console.error('[refreshTokenRequest] Ошибка при обновлении токена:', error);
     if (error.response) {
       console.error('Ошибка обновления - Статус:', error.response.status);
       console.error('Ошибка обновления - Данные:', error.response.data);
     } else {
       console.error('Ошибка обновления - Сообщение:', error.message);
     }
    throw error;
  }
};

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

// --- ИСПРАВЛЕННЫЙ Интерцептор ответа ---
api.interceptors.response.use(
  response => response, // Успех пропускаем
  async error => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const urlPath = originalRequest.url;

    const isGetColorRequest = urlPath === GET_USER_COLOR_PATH;
    // Используем startsWith, как в request interceptor
    const isPublicPath = urlPath && PUBLIC_PATHS.some(publicPath => urlPath.startsWith(publicPath));

    console.log(`[Interceptor Debug] Status: ${status}, URL Path: '${urlPath}', Is GetColor: ${isGetColorRequest}, Is Public: ${isPublicPath}, Is Retry: ${originalRequest._retry}`);

    const shouldAttemptRefresh =
        status === 401 &&
        !originalRequest._retry &&
        !isPublicPath &&
        !isGetColorRequest;

    console.log(`[Interceptor Debug] Should Attempt Refresh: ${shouldAttemptRefresh}`);

    if (!shouldAttemptRefresh) {
        // Если НЕ нужно обновлять (либо не 401, либо повтор, либо публичный, ЛИБО запрос цвета)
        if (status === 401 && isGetColorRequest) {
          console.log(`[Interceptor] Ошибка 401 на ${urlPath} (запрос цвета). Обновление токена НЕ ТРЕБУЕТСЯ. Проброс ошибки.`);
        } else {
          console.log(`[Interceptor] Ошибка ${status} на ${urlPath}. Обновление НЕ требуется по другим причинам. Проброс ошибки.`);
        }
        // ПРИМЕЧАНИЕ: Ошибку все равно нужно пробросить, чтобы getColorOnUser мог ее поймать и вернуть 'orange'!
        return Promise.reject(error); 
    }

    // --- Если нужно обновлять (401 на ДРУГОМ защищенном пути) ---
    console.log(`[Interceptor] Ошибка 401 на ${urlPath}. Попытка обновления токена...`);

    if (isRefreshing) {
       console.log('[Interceptor] Обновление уже идет, добавление в очередь:', originalRequest.url);
       return new Promise((resolve, reject) => { failedQueue.push({ resolve, reject }); })
           .then(token => {
               console.log('[Interceptor] Очередь обработана (успех), повтор запроса:', originalRequest.url);
               originalRequest.headers['Authorization'] = 'Bearer ' + token; return api(originalRequest);
           })
           .catch(err => {
               console.log('[Interceptor] Очередь обработана (ошибка), проброс ошибки для:', originalRequest.url);
               return Promise.reject(err)
           });
    }
    originalRequest._retry = true;
    isRefreshing = true;
    try {
      console.log('[Interceptor] Запуск refreshTokenRequest для:', originalRequest.url);
      const newToken = await refreshTokenRequest();
      console.log('[Interceptor] refreshTokenRequest УСПЕШНО завершен, новый токен получен для:', originalRequest.url);
      api.defaults.headers.common['Authorization'] = 'Bearer ' + newToken;
      originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
      processQueue(null, newToken);
      console.log('[Interceptor] Повторный вызов оригинального запроса после обновления:', originalRequest.url);
      return api(originalRequest);
    } catch (refreshError) {
      console.error("[Interceptor] НЕ УДАЛОСЬ обновить токен:", refreshError);
      processQueue(refreshError, null);
      console.log('[Interceptor] Проброс ошибки обновления токена дальше...');
      return Promise.reject(refreshError);
    } finally {
      console.log('[Interceptor] Завершение операции обновления (finally), isRefreshing = false для:', originalRequest.url);
      isRefreshing = false;
    }
  }
);



export default api;

