import api from '../../api'
import {ThemeColorType} from '../../../styles/theme' // Убедись, что путь правильный

// ПУТЬ ИЗ POSTMAN (правильный для фронтенда с учетом baseURL и proxy)
const PUT_COLOR_PATH = '/v1/background-colors/color';

/**
 * Сохраняет выбранный цвет темы пользователя на бэкенде.
 * @param {ThemeColorType} color - Имя цвета для сохранения.
 * @returns {Promise<void>}
 * @throws {Error} Если произошла ошибка API.
 */
export const putColorOnUser = async (color: ThemeColorType): Promise<void> => {
  try {
    // --- ИЗМЕНЕНИЕ: Отправляем цвет как query параметр 'colorCode' ---
    console.log(`[putColorOnUser] Сохранение цвета '${color}' через query параметр 'colorCode' на путь: ${PUT_COLOR_PATH}`);
    
    // Используем объект `params` в конфигурации Axios
    await api.put(
        PUT_COLOR_PATH, 
        null, // Тело запроса пустое (null или undefined)
        { 
            params: { 
                colorCode: color // Передаем цвет в query параметрах
            } 
        }
    ); 
    // --- КОНЕЦ ИЗМЕНЕНИЯ ---
    
    console.log(`[putColorOnUser] Запрос на сохранение цвета ${color} успешно отправлен.`);
  } catch (error: any) {
    // Путь в логе ошибки не так важен, как сам факт ошибки
    console.error(`[putColorOnUser] Ошибка при отправке запроса на сохранение цвета '${color}':`, error.response?.data || error.message);
    // Если есть детали ошибки от сервера, покажем их
    const serverMessage = error.response?.data?.message || error.response?.data;
    throw new Error(serverMessage || 'Не удалось сохранить цвет темы.');
  }
};

