import api from '../../api'
import {DeleteUserPayload} from '../types'

/**
 * Удаляет аккаунт текущего авторизованного пользователя.
 * Требует подтверждения текущим паролем.
 * @param {DeleteUserPayload} payload - Объект с текущим паролем пользователя.
 * @returns {Promise<void>}
 * @throws {Error} Если пароль неверный или произошла другая ошибка.
 */


const BASE_URL = 'api/v1/profile';

export const deleteCurrentUser = async (payload: DeleteUserPayload): Promise<void> => {
    // Проверка, что payload и oldPassword существуют
    if (!payload || !payload.oldPassword) {
        throw new Error("Для удаления аккаунта необходимо указать текущий пароль.");
    }

    try {
        console.log('[DeleteUser] Попытка удаления аккаунта...');
        // Отправляем DELETE запрос на /profile с паролем в теле
        const response = await api.delete(`${BASE_URL}`, {
            data: payload // Передаем { oldPassword: "..." }
        });

        console.log('[DeleteUser] Ответ API:', response.status, response.data);

        if (response.status !== 200 && response.status !== 204) {
            throw new Error(`Неожиданный статус ответа: ${response.status}`);
        }
        // Успех, ничего не возвращаем
    } catch (error: any) {
        console.error('[DeleteUser] Ошибка при удалении пользователя:', error);
        if (error.response && error.response.data) {
            const serverMessage = typeof error.response.data === 'string'
                ? error.response.data
                : error.response.data.message || error.response.data.error || 'Ошибка сервера';
            throw new Error(serverMessage);
        }
        throw error;
    }
};
