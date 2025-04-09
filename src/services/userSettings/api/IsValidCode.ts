import api from '../../api'
import {CodeType} from '../types'


interface IsValidCodeData {
    email: string;
    code: string;
    type: CodeType;
}

const BASE_URL = '/v1/profile'; // Базовый URL остается


export const isValidCode = async (data: IsValidCodeData): Promise<boolean> => {
    if (!data || !data.email || !data.code || !data.type) {
        console.error('[IsValidCode] Не все данные предоставлены в объекте:', data);
        // Можно либо вернуть false, либо выбросить ошибку
        throw new Error('Неполные данные для проверки кода.');
    }




    try {
        console.log('[IsValidCode] Вызван с данными:', data); // Лог как в createDesk
        // Обновляем лог, чтобы показать использование объекта config
        console.log(`[IsValidCode] Отправка GET запроса на ${BASE_URL}/is-valid-code с объектом config:`, { data });

        // Используем api.get, передавая объект config с полем data
        const response = await api.get<boolean>(`${BASE_URL}/is-valid-code`, { data: data });

        console.log('[IsValidCode] Ответ от сервера:', response.data); // Лог как в createDesk
        return response.data; // Возвращаем boolean результат

    } catch (error) {
        console.error('[IsValidCode] Ошибка при проверке кода:', error); // Лог как в createDesk
        throw error; // Пробрасываем ошибку дальше, как в createDesk
    }
}