import api from '../../api'
import {UpdateUserData, UserProfile} from '../types' // Импортируем UserProfile на случай, если API вернет обновленный профиль
import {saveTokens} from '../../auth/utils/TokenStorage' // Пример импорта
import {jwtDecode} from 'jwt-decode'

/**
 * Обновляет данные профиля пользователя (имя, фамилия, username, пароль, email).
 * Для смены email требуется предварительная проверка кода.
 * Для смены пароля требуется указать oldPassword и newPassword.
 * @param {UpdateUserData} data - Данные для обновления.
 * @returns {Promise<void | UserProfile>} В зависимости от ответа API (на скрине был '1', что странно, может возвращать void или обновленный профиль)
 */

const BASE_URL = '/v1/profile';

/**
 * Ожидаемая структура ответа от API при обновлении, если возвращаются токены.
 * Адаптируй под свой реальный ответ.
 */
interface UpdateUserApiResponse {
    message?: string; // Необязательное сообщение
    accessToken?: string;
    refreshToken?: string;
    // Может также возвращать обновленный UserProfile
    userProfile?: UserProfile;
}

// Ожидаемая структура payload внутри JWT
interface DecodedToken {
    sub: string; // Поле 'subject', содержащее username
    iat?: number;
    exp?: number;
}

export const updateUser = async (data: UpdateUserData): Promise<void | UserProfile> => {
    // Проверка паролей
    if (data.newPassword && !data.oldPassword) {
         throw new Error("Для смены пароля необходимо указать старый пароль.");
    }
     if (data.oldPassword && !data.newPassword) {
         throw new Error("Для смены пароля необходимо указать новый пароль.");
    }

    // Подготовка данных
    const payload = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));
    if (Object.keys(payload).length === 0) {
         console.warn('[UpdateUser] Нет данных для обновления.');
         return;
    }

    console.log('[UpdateUser] Отправка данных:', payload);

    try {
        // Отправка запроса
        const response = await api.put<UpdateUserApiResponse>(BASE_URL, payload);
        console.log('[UpdateUser] Ответ API:', response.data, 'Status:', response.status);

        // Обработка нового токена, если он пришел
        if (response.data?.accessToken) {
            console.log('[UpdateUser] Получен новый accessToken.');
            let usernameForStorage: string | undefined = undefined;
            try {
                // Декодируем токен
                const decodedToken = jwtDecode<DecodedToken>(response.data.accessToken);
                usernameForStorage = decodedToken.sub; // Получаем username
                console.log('[UpdateUser] Username из нового токена:', usernameForStorage);
            } catch (decodeError) {
                console.error("[UpdateUser] Не удалось декодировать новый accessToken:", decodeError);
            }

            // Сохраняем токены с правильным username
            saveTokens({
                accessToken: response.data.accessToken,
                refreshToken: response.data.refreshToken || localStorage.getItem('refreshToken') || undefined,
                username: usernameForStorage || ''
            });

            // Обновляем токен в axios для следующих запросов
            api.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`;
        }

        // Возвращаем результат
        if (response.data?.userProfile) {
            return response.data.userProfile;
        }
        return;

    } catch (error) {
        console.error('[UpdateUser] Ошибка при обновлении пользователя:', error);
        throw error;
    }
};

