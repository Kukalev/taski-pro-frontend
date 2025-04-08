import axios from 'axios'
import {getTokens, saveTokens, clearTokens} from './auth/utils/TokenStorage'
import {jwtDecode} from 'jwt-decode'
import {AuthService} from './auth/Auth'

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

// Список публичных путей (эндпоинты, НЕ требующие токен авторизации)
// Указываем пути ОТНОСИТЕЛЬНО baseURL
const PUBLIC_PATHS = ['/v1/auth/login', '/v1/auth/registration', '/v1/auth/refresh_token'];

// Добавляем токен к запросам, КРОМЕ ПУБЛИЧНЫХ
api.interceptors.request.use(config => {
  const tokens = getTokens();
  const urlPath = config.url;

  // Добавляем токен, только если он есть И путь НЕ входит в список публичных
  if (tokens?.accessToken && urlPath && !PUBLIC_PATHS.includes(urlPath)) {
    console.log(`[Request Interceptor] Добавляем Auth Header для ${urlPath}`);
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  } else {
    console.log(`[Request Interceptor] НЕ добавляем Auth Header для ${urlPath}`);
  }
  return config;
});

// --- Функция для запроса обновления токена ---
const refreshTokenRequest = async () => {
  const tokens = getTokens();

  if (!tokens?.refreshToken) {
    console.log("[refreshTokenRequest] Нет refresh token для обновления.");
    throw new Error("Refresh token not found"); // Лучше выбросить ошибку
  }

  try {
    console.log("[refreshTokenRequest] Попытка обновить токен...");
    // Отправляем refresh token в ТЕЛЕ запроса (убедись что API ожидает именно так)
    const response = await axios.post('/api/v1/auth/refresh_token', // Используем axios напрямую, БЕЗ интерцепторов этого инстанса
      { refreshToken: tokens.refreshToken },
      {
        // Не нужно указывать baseURL здесь, т.к. путь уже полный
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    // Проверяем, что ответ содержит accessToken
    if (response.data?.accessToken) {
      console.log("[refreshTokenRequest] Токен успешно обновлен сервером.");
      const newAccessToken = response.data.accessToken;
      const newRefreshToken = response.data.refreshToken; // Если сервер возвращает новый refresh token

      let usernameFromNewToken: string | undefined = tokens.username;
      try {
          // Декодируем НОВЫЙ токен
          const decodedToken = jwtDecode<DecodedToken>(newAccessToken);
          usernameFromNewToken = decodedToken.sub;
          console.log('[refreshTokenRequest] Username из нового токена:', usernameFromNewToken);
      } catch (decodeError) {
          console.error("[refreshTokenRequest] Ошибка декодирования нового accessToken:", decodeError);
          // Если декодирование не удалось, это проблема. Возможно, стоит выбросить ошибку.
          // Или использовать старый username, но это менее надежно.
          // throw new Error("Failed to decode new access token");
          usernameFromNewToken = tokens.username; // Возвращаемся к старому username как запасной вариант
      }

      // Сохраняем новые токены и ИЗВЛЕЧЕННЫЙ username
      saveTokens({
        accessToken: newAccessToken,
        // Используем новый refreshToken, если он есть, иначе старый
        refreshToken: newRefreshToken || tokens.refreshToken,
        username: usernameFromNewToken || '' // Используем имя из токена
      });
      console.log("[refreshTokenRequest] Новые токены сохранены.");
      // Возвращаем ТОЛЬКО новый accessToken для интерцептора
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
     }
    throw error; // Перебрасываем ошибку дальше
  }
};

// Флаг и очередь для обработки параллельных запросASDов при обновлении токена
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
    const urlPath = originalRequest.url; // Может быть 'api/v1/auth/login' или '/auth/login' и т.д.

    // --- ИСПРАВЛЕННАЯ ПРОВЕРКА НА ПУБЛИЧНЫЙ ПУТЬ ---
    // Проверяем, заканчивается ли urlPath на один из публичных путей
    const isPublicPath = urlPath && PUBLIC_PATHS.some(publicPath => urlPath.endsWith(publicPath));

    // --- ОТЛАДОЧНЫЕ ЛОГИ (Обновленные) ---
    console.log(`[Interceptor Debug] Status: ${status}, URL Path: '${urlPath}', Is Public Path (endsWith): ${isPublicPath}, Is Retry: ${originalRequest._retry}`);
    // --- КОНЕЦ ОТЛАДОЧНЫХ ЛОГОВ ---

    // ПРОВЕРЯЕМ УСЛОВИЯ ДЛЯ ОБНОВЛЕНИЯ
    const shouldAttemptRefresh =
        status === 401 &&          // Это 401?
        !originalRequest._retry && // И не повтор?
        !isPublicPath;             // И НЕ публичный путь? (Используем новую проверку)

    // --- ОТЛАДОЧНЫЙ ЛОГ РЕШЕНИЯ ---
    console.log(`[Interceptor Debug] Should Attempt Refresh: ${shouldAttemptRefresh}`);
    // --- КОНЕЦ ОТЛАДОЧНОГО ЛОГА ---

    if (!shouldAttemptRefresh) {
      // Если НЕ нужно обновлять
      console.log(`[Interceptor] Ошибка ${status} на ${urlPath}. Обновление НЕ требуется. Проброс ошибки.`);
      return Promise.reject(error);
    }

    // --- Если нужно обновлять (401 на защищенном пути) ---
    console.log(`[Interceptor] Ошибка 401 на ${urlPath}. Попытка обновления токена...`);

    if (isRefreshing) {
      return new Promise((resolve, reject) => { failedQueue.push({ resolve, reject }); })
          .then(token => { originalRequest.headers['Authorization'] = 'Bearer ' + token; return api(originalRequest); })
          .catch(err => Promise.reject(err));
    }
    originalRequest._retry = true;
    isRefreshing = true;
    try {
      const newToken = await refreshTokenRequest();
      api.defaults.headers.common['Authorization'] = 'Bearer ' + newToken;
      originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
      processQueue(null, newToken);
      return api(originalRequest);
    } catch (refreshError) {
      console.error("[Interceptor] Не удалось обновить токен:", refreshError);
      processQueue(refreshError, null);
      // AuthService.logout(); // Не вызываем logout здесь
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

// --- Интерцептор ответа ---
/* // <--- НАЧАЛО КОММЕНТАРИЯ
api.interceptors.response.use(
  response => {
    // ... (обработка успешного ответа) ...
    return response;
  },
  async error => {
    // ... (вся логика обработки ошибок 401 и обновления токена) ...
  }
);
*/ // <--- КОНЕЦ КОММЕНТАРИЯ

export default api;

