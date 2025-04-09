import api from '../../api'

const BASE_URL = '/api/v1/storage'; // Базовый путь для StorageController

/**
 * Загружает файл аватара для текущего пользователя.
 * @param avatarFile - Объект File, представляющий выбранный аватар.
 * @returns Promise<void> - Завершается при успехе, выбрасывает ошибку при неудаче.
 */


export const uploadCurrentUserAvatar = async (avatarFile: File): Promise<void> => {
  try {
    console.log('[uploadCurrentUserAvatar] Создание FormData для аватара:', avatarFile.name, avatarFile.size);
    const formData = new FormData();
    // Ключ должен совпадать с параметром @RequestParam на бэкенде ("avatar")
    formData.append('avatar', avatarFile);

    console.log(`[uploadCurrentUserAvatar] Отправка PUT запроса на ${BASE_URL}/avatars`);

    // Axios автоматически установит Content-Type: multipart/form-data при передаче FormData
    const response = await api.put<void>(`${BASE_URL}/avatars`, formData); // Ожидаем пустое тело в ответе при успехе (200 OK)

    console.log('[uploadCurrentUserAvatar] Ответ API:', response.status);

    if (response.status !== 200) {
      throw new Error(`Unexpected status code: ${response.status}`);
    }
    console.log('[uploadCurrentUserAvatar] Аватар успешно загружен.');

  } catch (error: any) {
    console.error(
        '[uploadCurrentUserAvatar] Ошибка при загрузке аватара:',
        error.response?.data || error.response || error.message || error
    );
    // Пробрасываем ошибку дальше для обработки в UI
    throw error;
  }
};
