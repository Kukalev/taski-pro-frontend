import api from '../../api'
import {backgroundOptions} from '../../../styles/backgrounds'

const PUT_BG_THEME_PATH = '/v1/background-colors/bg-theme';
const QUERY_PARAM_NAME = 'bgTheme';


export const putBgThemeOnUser = async (bgThemeFrontendId: string): Promise<void> => {
  try {
    const selectedOption = backgroundOptions.find(opt => opt.id === bgThemeFrontendId);

    if (!selectedOption) {
      console.error(`[putBgThemeOnUser] Не найден фон с фронтенд ID '${bgThemeFrontendId}' в backgroundOptions.`);
      throw new Error('Выбран неверный фон.');
    }

    const apiIdToSend = selectedOption.apiId;

    console.log(`[putBgThemeOnUser] Сохранение числового ID фона '${apiIdToSend}' (для фронтенд ID '${bgThemeFrontendId}') через query параметр '${QUERY_PARAM_NAME}' на путь: ${PUT_BG_THEME_PATH}`);

    await api.put(
      PUT_BG_THEME_PATH,
      null,
      {
        params: {
          [QUERY_PARAM_NAME]: apiIdToSend
        }
      }
    );

    console.log(`[putBgThemeOnUser] Запрос на сохранение ID фона ${apiIdToSend} (${PUT_BG_THEME_PATH}) успешно отправлен.`);
  } catch (error: any) {
    console.error(`[putBgThemeOnUser] Ошибка при отправке запроса на сохранение фона (фронтенд ID '${bgThemeFrontendId}') на ${PUT_BG_THEME_PATH}:`, error.response?.data || error.message);
    const serverMessage = error.response?.data?.message || error.response?.data;
    throw new Error(serverMessage || 'Не удалось сохранить фон.');
  }
};