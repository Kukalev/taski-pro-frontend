import { format, parseISO, isValid } from 'date-fns';
import { ru } from 'date-fns/locale';

/**
 * Форматирует дату в краткий вид (день и месяц, например, "10 апр").
 * Безопасно обрабатывает null/undefined и невалидные строки.
 * @param date - Дата в виде строки (ISO/UTC), объекта Date или null/undefined.
 * @returns Отформатированная строка или пустая строка при ошибке/отсутствии даты.
 */
export const formatShortDate = (date: string | Date | null | undefined): string => {
  if (!date) {
    return ''; // Возвращаем пустую строку, если даты нет
  }

  try {
    // Пытаемся создать объект Date. new Date() или parseISO справятся с разными форматами.
    const parsedDate = (typeof date === 'string') ? parseISO(date) : new Date(date);

    // Проверяем валидность полученной даты
    if (!isValid(parsedDate)) {
      console.warn(`[formatShortDate] Невалидная дата получена:`, date);
      return ''; // Возвращаем пустую строку для невалидных дат
    }

    // Форматируем в "d MMM" (например, "10 апр")
    return format(parsedDate, 'd MMM', { locale: ru });
  } catch (error) {
    console.error('[formatShortDate] Ошибка форматирования даты:', date, error);
    return ''; // Возвращаем пустую строку при любой ошибке
  }
};

// Можно добавить другие утилиты для дат сюда, если они понадобятся 