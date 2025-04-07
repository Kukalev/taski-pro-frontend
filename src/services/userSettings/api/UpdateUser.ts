import {api} from '../../apiInstance'
import {UpdateUserData, UserProfile} from '../types' // Импортируем UserProfile на случай, если API вернет обновленный профиль

/**
 * Обновляет данные профиля пользователя (имя, фамилия, username, пароль, email).
 * Для смены email требуется предварительная проверка кода.
 * Для смены пароля требуется указать oldPassword и newPassword.
 * @param {UpdateUserData} data - Данные для обновления.
 * @returns {Promise<void | UserProfile>} В зависимости от ответа API (на скрине был '1', что странно, может возвращать void или обновленный профиль)
 */

const BASE_URL = 'api/v1/profile';

export const updateUser = async (data: UpdateUserData): Promise<void | UserProfile> => {
    // Проверка обязательных полей для смены пароля
    if (data.newPassword && !data.oldPassword) {
         throw new Error("Для смены пароля необходимо указать старый пароль (oldPassword).");
    }
     if (data.oldPassword && !data.newPassword) {
         throw new Error("Для смены пароля необходимо указать новый пароль (newPassword).");
    }

    // Удаляем undefined поля, чтобы не отправлять их
    const payload = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));

    if (Object.keys(payload).length === 0) {
         console.warn('[UpdateUser] Нет данных для обновления.');
         return; // Или выбросить ошибку
    }

    console.log('[UpdateUser] Отправка данных:', payload);

    try {
        // На скрине ответ '1', что нетипично. Укажем тип ответа как any или void/UserProfile, если ожидается другое.
        const response = await api.put<any>(`${BASE_URL}`, payload);
        console.log('[UpdateUser] Ответ API:', response.data, 'Status:', response.status);

        // Можно добавить проверку статуса response.status === 200
        // Если API возвращает обновленный профиль, можно вернуть response.data as UserProfile
        // return response.data as UserProfile;

        // Если API возвращает просто статус или '1', возвращаем void
        return;

    } catch (error) {
        console.error('[UpdateUser] Ошибка при обновлении пользователя:', error);
        // Здесь можно добавить обработку специфических ошибок от API (например, неверный старый пароль)
        throw error;
    }
};
