import api from '../../api'

// Определяем тип для режима темы
export type ThemeMode = 'light' | 'dark';

const GET_THEME_PATH = '/v1/background-colors/theme'; // Путь из Postman


export const getThemeOnUser = async (): Promise<ThemeMode> => {
  try {
    console.log(`[getThemeOnUser] Запрос темы пользователя на путь: ${GET_THEME_PATH}`);
    // Ожидаем ответ как простой текст ('light' или 'dark')
    const response = await api.get<string>(GET_THEME_PATH, { responseType: 'text' }); 

    if (response.data && typeof response.data === 'string') {
      const receivedTheme = response.data.trim().toLowerCase(); // Приводим к нижнему регистру и убираем пробелы

      // Проверяем, является ли ответ валидным режимом темы
      if (receivedTheme === 'light' || receivedTheme === 'dark') {
        console.log('[getThemeOnUser] Получена тема:', receivedTheme);
        return receivedTheme as ThemeMode; // Возвращаем валидную тему
      } else {
        console.warn(`[getThemeOnUser] API вернуло строку '${receivedTheme}', но она не является валидным режимом ('light' или 'dark'). Используем 'light'.`);
        return 'light'; // Возвращаем 'light' по умолчанию, если строка невалидна
      }
    } else {
      console.warn(`[getThemeOnUser] API вернуло ответ (${response.status}), но тело ответа пустое или не строка ('${response.data}'). Используем 'light'.`);
      return 'light'; // Возвращаем 'light' по умолчанию при пустом/некорректном ответе
    }
  } catch (error: any) {
    // Обработка ошибок - 401/404 считаем штатной ситуацией (тема не задана/нет доступа), возвращаем 'light'
    if (error.response?.status === 404 || error.response?.status === 401) {
        console.warn(`[getThemeOnUser] Ошибка ${error.response.status} при запросе темы (вероятно, тема не установлена или токен невалиден). Используем 'light'.`);
        return 'light';
    } else {
        // Все остальные ошибки считаем неожиданными
        console.error(`[getThemeOnUser] НЕОЖИДАННАЯ ошибка при получении темы с пути ${GET_THEME_PATH}:`, error.response?.data || error.message);
        return 'light'; // Возвращаем 'light' по умолчанию при других ошибках
    }
  }
};
