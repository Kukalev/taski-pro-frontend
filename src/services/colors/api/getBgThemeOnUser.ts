import api from '../../api'
import {backgroundOptions} from '../../../styles/backgrounds'

// --- ПОЛНЫЙ ПУТЬ К API ---
const GET_BG_THEME_PATH = '/v1/background-colors/bg-theme';


export const getBgThemeOnUser = async (): Promise<string> => {
  try {
    console.log(`[getBgThemeOnUser] Запрос ID фона пользователя на путь: ${GET_BG_THEME_PATH}`);
    const response = await api.get<string | number>(GET_BG_THEME_PATH, { responseType: 'text' });

    let receivedApiId: number | null = null;

    if (response.data !== null && response.data !== undefined) {
      const dataStr = String(response.data).replace(/["']/g, '').trim();
      if (dataStr !== '') {
        const parsedId = parseInt(dataStr, 10);
        if (!isNaN(parsedId)) {
          receivedApiId = parsedId;
        } else {
          console.warn(`[getBgThemeOnUser] API (${GET_BG_THEME_PATH}) вернуло нечисловое значение '${dataStr}'. Используем 'default'.`);
        }
      } else {
        console.warn(`[getBgThemeOnUser] API (${GET_BG_THEME_PATH}) вернуло пустую строку. Используем 'default'.`);
      }
    } else {
      console.warn(`[getBgThemeOnUser] API (${GET_BG_THEME_PATH}) вернуло ответ (${response.status}), но тело ответа null или undefined. Используем 'default'.`);
    }

    if (receivedApiId !== null) {
      const foundOption = backgroundOptions.find(opt => opt.apiId === receivedApiId);
      if (foundOption) {
        console.log(`[getBgThemeOnUser] Получен API ID: ${receivedApiId} (${GET_BG_THEME_PATH}), соответствует строковому ID: '${foundOption.id}'`);
        return foundOption.id;
      } else {
        console.warn(`[getBgThemeOnUser] API (${GET_BG_THEME_PATH}) вернуло числовой ID '${receivedApiId}', но он не найден в backgroundOptions. Используем 'default'.`);
      }
    }

    return 'default';

  } catch (error: any) {
    if (error.response?.status === 404 || error.response?.status === 401) {
      console.warn(`[getBgThemeOnUser] Ошибка ${error.response.status} на пути ${GET_BG_THEME_PATH}. Используем 'default'.`);
      return 'default';
    } else {
      console.error(`[getBgThemeOnUser] НЕОЖИДАННАЯ ошибка при получении ID фона с ${GET_BG_THEME_PATH}:`, error.response?.data || error.message);
      return 'default';
    }
  }
};