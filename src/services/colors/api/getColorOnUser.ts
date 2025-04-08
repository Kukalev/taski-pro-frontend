import api from '../../api'
import {ThemeColorType, isThemeColor} from '../../../styles/theme' // Убедись, что путь правильный

const GET_COLOR_PATH = 'api/v1/background-colors/color'; // УТОЧНИ ЭТОТ ПУТЬ

/**
 * Запрашивает сохраненный цвет темы пользователя с бэкенда.
 * @returns {Promise<ThemeColorType | null>} Имя цвета темы или null, если не найдено или ошибка.
 */
export const getColorOnUser = async (): Promise<ThemeColorType | null> => {
  try {
    console.log(`[getColorOnUser] Запрос цвета пользователя на путь: ${GET_COLOR_PATH}`);
    const response = await api.get<string>(GET_COLOR_PATH, { responseType: 'text' }); // Ожидаем ответ с типом string и указываем тип ответа 'text' для Axios

    if (response.data && typeof response.data === 'string') {
      const receivedColor = response.data.replace(/["']/g, '').trim() as ThemeColorType;
      
      if (isThemeColor(receivedColor)) {
        console.log('[getColorOnUser] Получен цвет:', receivedColor);
        return receivedColor;
      } else {
        console.warn(`[getColorOnUser] API вернуло строку '${receivedColor}', но она не является валидным цветом темы. Используем orange.`);
        return 'orange';
      }
    } else {
      console.warn(`[getColorOnUser] API вернуло ответ (${response.status}), но тело ответа пустое или не строка ('${response.data}'). Используем orange.`);
      return 'orange';
    }
  } catch (error: any) {
    // --- ОБРАБОТКА ОШИБКИ ---
    if (error.response?.status === 404 || error.response?.status === 401) {
        console.warn(`[getColorOnUser] Ошибка ${error.response.status} при запросе цвета (вероятно, цвет не установлен или токен невалиден). Используем 'orange'.`);
        return 'orange';
    } else {
        console.error(`[getColorOnUser] НЕОЖИДАННАЯ ошибка при получении цвета с пути ${GET_COLOR_PATH}:`, error.response?.data || error.message);
        return 'orange';
    }
  }
};

