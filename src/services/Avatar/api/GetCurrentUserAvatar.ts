const BASE_URL = '/api/v1/storage'; // Базовый путь для StorageController

/**
 * Возвращает URL для скачивания аватара пользователя.
 * Этот URL можно напрямую использовать в атрибуте src тега <img>.
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


