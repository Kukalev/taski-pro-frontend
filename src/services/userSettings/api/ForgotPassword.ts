import api from '../../api'

/**
 * Отправляет код для сброса пароля на указанную почту.
 * @param {string} email - Почта, на которую отправить код.
 * @returns {Promise<void>}
 */

const BASE_URL = '/v1/profile';

export const forgotPassword = async (email: string): Promise<void> => {
    try {
        const response = await api.post(`${BASE_URL}/forgot-password`, null, { // Тела нет, передаем null
            params: { email } // Передаем email как query-параметр
        });
        console.log('[ForgotPassword] Ответ API:', response.status);
         if (response.status !== 200) {
           throw new Error(`Unexpected status code: ${response.status}`);
        }
    } catch (error) {
        console.error('[ForgotPassword] Ошибка при запросе сброса пароля:', error);
        throw error;
    }
};



