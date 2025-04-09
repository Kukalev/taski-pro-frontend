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

// Публичные пути (эндпоинты, НЕ требующие токен авторизации)
// Указываем пути ОТНОСИТЕЛЬНО baseURL (т.е. то, что Axios видит ДО proxy)
// Важно: '/v1/auth/refresh_token' ДОЛЖЕН БЫТЬ здесь, если он не требует access token
// НО! сам запрос на refresh в refreshTokenRequest идет напрямую через axios.post, так что это не так критично здесь.
const PUBLIC_PATHS = ['/v1/auth/login', '/v1/auth/registration']; 
// Путь для запроса цвета - ЗАЩИЩЕННЫЙ, НЕ ДОЛЖЕН быть в PUBLIC_PATHS
const GET_USER_COLOR_PATH = '/v1/users/color'; // Определим путь цвета здесь для сравнения

// Добавляем токен к запросам, КРОМЕ ПУБЛИЧНЫХ
api.interceptors.request.use(config => {
  const tokens = getTokens();
  // Получаем путь ОТНОСИТЕЛЬНО baseURL
  const urlPath = config.url; 

  // Проверяем, что путь НЕ является одним из публичных
  const isPublic = urlPath && PUBLIC_PATHS.some(publicPath => urlPath.endsWith(publicPath));

  // Добавляем токен, только если он есть И путь НЕ публичный
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
  const refreshTokenPath = '/api/v1/auth/refresh_token'; // Полный путь для прямого вызова

  if (!tokens?.refreshToken) {
    console.log("[refreshTokenRequest] Нет refresh token для обновления.");
    throw new Error("Refresh token not found"); 
  }

  try {
    console.log("[refreshTokenRequest] Попытка обновить токен...");
    // Отправляем refresh token в ТЕЛЕ запроса 
    const response = await axios.post(refreshTokenPath, 
      { refreshToken: tokens.refreshToken },
      { headers: { 'Content-Type': 'application/json' } } // Убедимся, что Content-Type установлен
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
          usernameFromNewToken = tokens.username; // Используем старый как запасной вариант
      }

      saveTokens({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken || tokens.refreshToken,
        username: usernameFromNewToken || tokens.username || '' // Добавил старый username как fallback
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
    // Важно! Не вызываем здесь logout, просто пробрасываем ошибку
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
    // Получаем путь ОТНОСИТЕЛЬНО baseURL, как его видит Axios
    const urlPath = originalRequest.url; 

    // Проверяем, является ли URL путем для запроса цвета
    const isGetColorRequest = urlPath === GET_USER_COLOR_PATH;

    // Проверяем, является ли путь публичным (используя ту же логику, что и в request interceptor)
    const isPublicPath = urlPath && PUBLIC_PATHS.some(publicPath => urlPath.endsWith(publicPath));

    // --- ОТЛАДОЧНЫЕ ЛОГИ ---
    console.log(`[Interceptor Debug] Status: ${status}, URL Path: '${urlPath}', Is GetColor: ${isGetColorRequest}, Is Public: ${isPublicPath}, Is Retry: ${originalRequest._retry}`);
    // --- КОНЕЦ ОТЛАДОЧНЫХ ЛОГОВ ---

    // --- ИЗМЕНЕННЫЕ УСЛОВИЯ ДЛЯ ОБНОВЛЕНИЯ ---
    const shouldAttemptRefresh =
        status === 401 &&          // Это 401?
        !originalRequest._retry && // И не повтор?
        !isPublicPath &&           // И НЕ публичный путь?
        !isGetColorRequest;        // И НЕ запрос цвета? <-- ДОБАВЛЕНО УСЛОВИЕ

    // --- ОТЛАДОЧНЫЙ ЛОГ РЕШЕНИЯ ---
    console.log(`[Interceptor Debug] Should Attempt Refresh: ${shouldAttemptRefresh}`);
    // --- КОНЕЦ ОТЛАДОЧНОГО ЛОГА ---

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
      // Обновляем токен в дефолтных заголовках И в текущем запросе
      api.defaults.headers.common['Authorization'] = 'Bearer ' + newToken; 
      originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
      // Обрабатываем очередь (успешно)
      processQueue(null, newToken); 
      console.log('[Interceptor] Повторный вызов оригинального запроса после обновления:', originalRequest.url);
      return api(originalRequest); // Повторяем оригинальный запрос с новым токеном
    } catch (refreshError) {
      console.error("[Interceptor] НЕ УДАЛОСЬ обновить токен:", refreshError);
      // Обрабатываем очередь (с ошибкой)
      processQueue(refreshError, null); 
      
      // ВАЖНО: НЕ ВЫЗЫВАЕМ LOGOUT ЗДЕСЬ АВТОМАТИЧЕСКИ.
      // Пусть приложение само решает, что делать при ошибке обновления.
      // Например, AuthContext может отловить ошибку и вызвать logout.
      console.log('[Interceptor] Проброс ошибки обновления токена дальше...');
      return Promise.reject(refreshError); // Пробрасываем ошибку обновления
    } finally {
      console.log('[Interceptor] Завершение операции обновления (finally), isRefreshing = false для:', originalRequest.url);
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

