import api from '../../api' // Предполагаем, что есть настроенный инстанс axios
import {UserProfile} from '../types'

/**
 * Получает данные текущего авторизованного пользователя.
 * @returns {Promise<UserProfile>} Данные профиля пользователя.
 */

const BASE_URL = 'api/v1/profile';

export const getCurrentUser = async (): Promise<UserProfile> => {
    try {
        const response = await api.get<UserProfile>(`${BASE_URL}`);
        console.log('[GetCurrentUser] Ответ API:', response.data);
        return response.data;
    } catch (error) {
        console.error('[GetCurrentUser] Ошибка при получении пользователя:', error);
        // Можно добавить более специфичную обработку ошибок
        throw error;
    }
};
