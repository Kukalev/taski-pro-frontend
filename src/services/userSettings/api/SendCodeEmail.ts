import api from '../../api'


const BASE_URL = '/v1/profile';

export const sendCodeForEmailChange = async (): Promise<void> => {
    try {
        const response = await api.post(`${BASE_URL}/send-code-email`)

        console.log('[SendCodeEmail] Ответ API:', response.status, response.data);

        // Проверяем статус ответа
        if (response.status !== 200) {
           throw new Error(`Unexpected status code: ${response.status}`);
        }
    } catch (error) {
        console.error('[SendCodeEmail] Ошибка при отправке кода:', error);
        throw error;
    }
};



