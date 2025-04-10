import api from '../../api';
// Импортируем опции фона С ПОЛЕМ apiId
import { backgroundOptions } from '../../../styles/backgrounds'; // Убедись, что backgroundOptions содержит apiId: number

// --- ПРЕДПОЛАГАЕМЫЙ ПУТЬ API ---
const PUT_BG_THEME_PATH = '/v1/background-colors/background';
// --- ПРЕДПОЛАГАЕМОЕ ИМЯ QUERY ПАРАМЕТРА ---
const QUERY_PARAM_NAME = 'backgroundId'; // Предполагаем, что имя параметра остается тем же, но значение будет числом

/**
 * Сохраняет выбранный ID фоновой темы пользователя на бэкенде.
 * @param {string} bgThemeFrontendId - Строковый ID фона с фронтенда (например, 'default', 'wisteria').
 * @returns {Promise<void>}
 * @throws {Error} Если произошла ошибка API или ID не найден.
 */
export const putBgThemeOnUser = async (bgThemeFrontendId: string): Promise<void> => {
  try {
    // --- ИЗМЕНЕНИЕ: Находим числовой apiId по строковому id ---
    const selectedOption = backgroundOptions.find(opt => opt.id === bgThemeFrontendId);

    if (!selectedOption) {
        console.error(`[putBgThemeOnUser] Не найден фон с фронтенд ID '${bgThemeFrontendId}' в backgroundOptions.`);
        throw new Error('Выбран неверный фон.'); // Или обработать иначе
    }

    const apiIdToSend = selectedOption.apiId; // Получаем числовой ID для отправки

    console.log(`[putBgThemeOnUser] Сохранение числового ID фона '${apiIdToSend}' (для фронтенд ID '${bgThemeFrontendId}') через query параметр '${QUERY_PARAM_NAME}' на путь: ${PUT_BG_THEME_PATH}`);

    // Используем объект `params` с числовым значением
    await api.put(
        PUT_BG_THEME_PATH,
        null,
        {
            params: {
                [QUERY_PARAM_NAME]: apiIdToSend // Передаем ЧИСЛОВОЙ ID
            }
        }
    );

    console.log(`[putBgThemeOnUser] Запрос на сохранение ID фона ${apiIdToSend} успешно отправлен.`);
  } catch (error: any) {
    console.error(`[putBgThemeOnUser] Ошибка при отправке запроса на сохранение фона (фронтенд ID '${bgThemeFrontendId}'):`, error.response?.data || error.message);
    const serverMessage = error.response?.data?.message || error.response?.data;
    throw new Error(serverMessage || 'Не удалось сохранить фон.');
  }
}; 