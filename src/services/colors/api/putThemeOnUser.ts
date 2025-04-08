import api from '../../api'
import { ThemeMode } from './getThemeOnUser'; // Импортируем тип из getThemeOnUser

const PUT_THEME_PATH = 'api/v1/background-colors/theme'; // Путь из Postman

/**
 * Сохраняет выбранный режим темы ('light' или 'dark') пользователя на бэкенде.
 * @param {ThemeMode} theme - Режим темы для сохранения ('light' или 'dark').
 * @returns {Promise<void>}
 * @throws {Error} Если произошла ошибка API.
 */
export const putThemeOnUser = async (theme: ThemeMode): Promise<void> => {
  try {
    // Отправляем тему как query параметр 'theme'
    console.log(`[putThemeOnUser] Сохранение темы '${theme}' через query параметр 'theme' на путь: ${PUT_THEME_PATH}`);
    
    // Используем объект `params` в конфигурации Axios для PUT запроса
    await api.put(
        PUT_THEME_PATH, 
        null, // Тело запроса пустое
        { 
            params: { 
                theme: theme // Передаем режим темы в query параметрах
            } 
        }
    ); 
    
    console.log(`[putThemeOnUser] Запрос на сохранение темы '${theme}' успешно отправлен.`);
  } catch (error: any) {
    console.error(`[putThemeOnUser] Ошибка при отправке запроса на сохранение темы '${theme}':`, error.response?.data || error.message);
    // Если есть детали ошибки от сервера, покажем их
    const serverMessage = error.response?.data?.message || error.response?.data;
    throw new Error(serverMessage || 'Не удалось сохранить режим темы.');
  }
};
