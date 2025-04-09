import api from '../../api' // <<<--- Добавляем импорт api

const BASE_URL = '/v1/storage'; // Базовый путь для StorageController

/**
 * Возвращает URL для скачивания аватара пользователя.
 * Этот URL можно напрямую использовать в атрибуте src тега <img>,
 * *если* эндпоинт не требует авторизации.
 * @param username - Имя пользователя, чей аватар нужен.
 * @returns string - URL для GET запроса на скачивание аватара.
 */
export const getUserAvatarUrl = (username: string): string => {
    if (!username) {
        console.warn('[getUserAvatarUrl] Имя пользователя не предоставлено.');
        // Можно вернуть URL к дефолтному аватару или пустую строку
        return ''; // Или '/path/to/default/avatar.png'
    }
    const url = `${BASE_URL}/avatars/${username}`;
    console.log(`[getUserAvatarUrl] Сформирован URL для аватара пользователя ${username}: ${url}`);
    return url;
};

/**
 * Загружает данные аватара пользователя в виде Blob.
 * Использует настроенный Axios инстанс для добавления хедера авторизации.
 * @param username - Имя пользователя, чей аватар нужен.
 * @returns Promise<Blob | null> - Blob с данными изображения или null, если аватар не найден или произошла ошибка.
 */
export const fetchUserAvatarBlob = async (username: string): Promise<Blob | null> => {
    if (!username) {
        console.warn('[fetchUserAvatarBlob] Имя пользователя не предоставлено.');
        return null;
    }
    try {
        const url = getUserAvatarUrl(username); // Используем существующую функцию для получения URL
        console.log(`[fetchUserAvatarBlob] Запрос Blob аватара по URL: ${url}`);
        // Делаем запрос через наш 'api' с responseType: 'blob'
        const response = await api.get<Blob>(url, { responseType: 'blob' });
        console.log(`[fetchUserAvatarBlob] Получен Blob аватара для ${username}. Тип: ${response.data?.type}, Размер: ${response.data?.size}`);
        return response.data; // Возвращаем Blob
    } catch (error: any) {
        console.error(`[fetchUserAvatarBlob] Ошибка при получении Blob аватара для ${username}:`, error.response?.status, error.message);
        // Если ошибка 404 (Not Found), логично вернуть null. Другие ошибки тоже можно обработать как null или пробросить дальше.
        // if (error.response?.status === 404) {
             return null;
        // }
        // throw error; // Если хотим пробрасывать другие ошибки
    }
};


