import api from '../../api';
// Импортируем опции фона С ПОЛЕМ apiId
import { backgroundOptions, BackgroundOption } from '../../../styles/backgrounds'; // Убедись, что backgroundOptions содержит apiId: number

// --- ПРЕДПОЛАГАЕМЫЙ ПУТЬ API ---
// Уточни этот путь, если он другой
const GET_BG_THEME_PATH = '/v1/background-colors/background';

/**
 * Запрашивает сохраненный ID фоновой темы пользователя с бэкенда.
 * Ожидает ЧИСЛО от API.
 * @returns {Promise<string>} Строковый ID фона для фронтенда (например, 'default', 'wisteria').
 * Возвращает 'default' при ошибках или невалидном значении.
 */
export const getBgThemeOnUser = async (): Promise<string> => {
  try {
    console.log(`[getBgThemeOnUser] Запрос ID фона пользователя на путь: ${GET_BG_THEME_PATH}`);
    // --- ИЗМЕНЕНИЕ: Ожидаем число или строку, представляющую число ---
    const response = await api.get<string | number>(GET_BG_THEME_PATH, { responseType: 'text' }); // Текст, чтобы обработать и строку, и число

    let receivedApiId: number | null = null;

    if (response.data !== null && response.data !== undefined) {
        const dataStr = String(response.data).replace(/["']/g, '').trim(); // Преобразуем в строку и чистим
        if (dataStr !== '') {
             const parsedId = parseInt(dataStr, 10); // Парсим число
             if (!isNaN(parsedId)) {
                 receivedApiId = parsedId;
             } else {
                 console.warn(`[getBgThemeOnUser] API вернуло нечисловое значение '${dataStr}'. Используем 'default'.`);
             }
        } else {
             console.warn(`[getBgThemeOnUser] API вернуло пустую строку. Используем 'default'.`);
        }
    } else {
      console.warn(`[getBgThemeOnUser] API вернуло ответ (${response.status}), но тело ответа null или undefined. Используем 'default'.`);
    }

    // Ищем опцию по числовому apiId
    if (receivedApiId !== null) {
        const foundOption = backgroundOptions.find(opt => opt.apiId === receivedApiId);
        if (foundOption) {
            console.log(`[getBgThemeOnUser] Получен API ID: ${receivedApiId}, соответствует строковому ID: '${foundOption.id}'`);
            return foundOption.id; // Возвращаем СТРОКОВЫЙ ID для фронта
        } else {
            console.warn(`[getBgThemeOnUser] API вернуло числовой ID '${receivedApiId}', но он не найден в backgroundOptions. Используем 'default'.`);
        }
    }

    return 'default'; // Возвращаем 'default' во всех остальных случаях

  } catch (error: any) {
    if (error.response?.status === 404 || error.response?.status === 401) {
        console.warn(`[getBgThemeOnUser] Ошибка ${error.response.status}. Используем 'default'.`);
        return 'default';
    } else {
        console.error(`[getBgThemeOnUser] НЕОЖИДАННАЯ ошибка при получении ID фона:`, error.response?.data || error.message);
        return 'default';
    }
  }
}; 