import { getColorOnUser } from './api/getColorOnUser';
import { putColorOnUser } from './api/putColorOnUser';
import { getThemeOnUser } from './api/getThemeOnUser';
import { putThemeOnUser } from './api/putThemeOnUser';
import { getBgThemeOnUser } from './api/getBgThemeOnUser';
import { putBgThemeOnUser } from './api/putBgThemeOnUser';

/**
 * Сервис для управления настройками внешнего вида пользователя (цвет, тема, фон).
 */
export const AppearanceService = {
  /** Запрашивает сохраненный цвет темы пользователя */
  getColor: getColorOnUser,
  /** Сохраняет выбранный цвет темы пользователя */
  saveColor: putColorOnUser,

  /** Запрашивает сохраненный режим темы пользователя ('light' или 'dark') */
  getThemeMode: getThemeOnUser,
  /** Сохраняет выбранный режим темы пользователя */
  saveThemeMode: putThemeOnUser,

  /** Запрашивает сохраненный ID фоновой темы пользователя (возвращает строковый ID для фронта) */
  getBackgroundId: getBgThemeOnUser,
  /** Сохраняет выбранный фон пользователя (принимает строковый ID с фронта) */
  saveBackgroundId: putBgThemeOnUser,
};

// Типы, если нужно их реэкспортировать отсюда
export type { ThemeColorType } from '../../styles/theme';
export type { ThemeMode } from './api/getThemeOnUser';
// Тип для ID фона - это просто string на фронте 