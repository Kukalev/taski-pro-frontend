import api from '../../api'
import {CodeType} from '../types'

/**
 * Проверяет валидность кода подтверждения.
 * @param {string} code - Код для проверки.
 * @param {CodeType} type - Тип кода (CONFIRM_MAIL, RESET_PASSWORD, RESET_MAIL).
 * @returns {Promise<boolean>} True, если код валиден, иначе false.
 */

const BASE_URL = 'api/v1/profile';

export const isValidCode = async (code: string, type: CodeType): Promise<boolean> => {
    if (!code || !type) {
        console.error('[IsValidCode] Код или тип не предоставлены.');
        return false;
    }
    const endpoint = `${BASE_URL}/is-valid-code/${code}/${type}`;
    try {
        const response = await api.get<boolean>(endpoint);
        console.log(`[IsValidCode] Ответ API для кода ${code} (${type}):`, response.data);
        return response.data;
    } catch (error) {
        console.error(`[IsValidCode] Ошибка при проверке кода ${code} (${type}):`, error);
        return false;
    }
};
