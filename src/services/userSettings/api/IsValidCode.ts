import {api} from '../../apiInstance'
import {CodeType, IsValidCodeResponse} from '../types'

/**
 * Проверяет валидность кода подтверждения.
 * @param {string} code - Код для проверки.
 * @param {CodeType} type - Тип кода (CONFIRM_MAIL, RESET_PASSWORD, RESET_MAIL).
 * @returns {Promise<boolean>} True, если код валиден, иначе false.
 */

const BASE_URL = 'api/v1/profile';

export const isValidCode = async (code: string, type: CodeType): Promise<IsValidCodeResponse> => {
    if (!code || !type) {
        console.error('[IsValidCode] Код или тип не предоставлены.');
        return false; // Или выбросить ошибку
    }
    try {
        // Код и тип передаются как части URL
        const response = await api.get<boolean>(`${BASE_URL}/is-valid-code/${code}/${type}`);
        console.log(`[IsValidCode] Ответ API для кода ${code} (${type}):`, response.data);
        // API напрямую возвращает true/false
        return response.data;
    } catch (error) {
        console.error(`[IsValidCode] Ошибка при проверке кода ${code} (${type}):`, error);
        // В случае ошибки (например, 404 Not Found), считаем код невалидным
        return false;
    }
};
