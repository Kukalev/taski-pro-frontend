import api from '../../api'

/**
 * Отправляет код подтверждения на ТЕКУЩУЮ почту пользователя для инициации смены email.
 * API ожидает тело запроса с '1'.
 * @returns {Promise<void>}
 */

const BASE_URL = 'api/v1/profile';

export const sendCodeForEmailChange = async (): Promise<void> => {
    try {
        // Эндпоинт из скриншота
        const endpoint = `${BASE_URL}/send-code-email`;
        // Данные для тела запроса
        const requestBody = '1'; // Отправляем строку '1' как raw body

        console.log(`[SendCodeEmail] Отправка POST на ${endpoint} с телом: '${requestBody}'`);

        // Отправляем POST запрос с телом '1'
        // Axios должен сам выставить Content-Type как text/plain,
        // но если будут проблемы, можно добавить headers: { 'Content-Type': 'text/plain' }
        const response = await api.post(endpoint, requestBody);

        console.log('[SendCodeEmail] Ответ API:', response.status, response.data); // Логируем и данные на всякий случай

        // Проверяем статус ответа
        if (response.status !== 200) {
           throw new Error(`Unexpected status code: ${response.status}`);
        }
    } catch (error) {
        console.error('[SendCodeEmail] Ошибка при отправке кода:', error);
        throw error;
    }
};


