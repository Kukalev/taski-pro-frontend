import api from '../../api'
import {BatchAvatarResponse} from '../type' // Импортируем наш тип

const BASE_URL = '/v1/storage';

/**
 * Загружает аватары для списка пользователей в формате Base64 Data URI.
 * @param usernames - Массив строк с именами пользователей.
 * @returns Promise<BatchAvatarResponse> - Объект, где ключ - username, значение - Data URI или null.
 */


export const getAllAvatars = async (usernames: string[]): Promise<BatchAvatarResponse> => {
  if (!usernames || usernames.length === 0) {
    console.warn('[getBatchAvatars] Массив имен пользователей пуст.');
    return {}; // Возвращаем пустой объект
  }

  try {
    // Формируем параметры запроса ?usernames=user1&usernames=user2...
    const params = new URLSearchParams();
    usernames.forEach(username => params.append('usernames', username));
    const paramsString = params.toString();

    console.log(`[getBatchAvatars] Запрос аватаров для: ${usernames.join(', ')} с параметрами: ${paramsString}`);

    const response = await api.get<BatchAvatarResponse>(`${BASE_URL}/avatars/batch?${paramsString}`);

    console.log('[getBatchAvatars] Ответ API:', response.data);
    return response.data || {}; // Возвращаем данные или пустой объект, если ответ пуст

  } catch (error: any) {
    console.error(
        '[getBatchAvatars] Ошибка при пакетной загрузке аватаров:',
        error.response?.data || error.response || error.message || error
    );
    throw error;
  }
};



