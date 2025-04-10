import { StatusType } from '../pages/TaskBoard/types'; // Импортируем StatusType, если он определен глобально, иначе можно вставить сюда

// Если StatusType не импортирован, можно определить его здесь:
/*
enum StatusType {
  BACKLOG = 'BACKLOG',
  INWORK = 'INWORK',
  REVIEW = 'REVIEW',
  TESTING = 'TESTING',
  COMPLETED = 'COMPLETED',
}
*/

/**
 * Возвращает отображаемое название статуса задачи.
 * @param statusType - Строка типа статуса из StatusType.
 * @returns Локализованное название статуса или 'Неизвестно'.
 */
export const getStatusDisplay = (statusType?: StatusType | string | null): string => {
  if (!statusType) return 'Неизвестно';

  switch (statusType.toUpperCase()) {
    case StatusType.BACKLOG:
      return 'К выполнению';
    case StatusType.INWORK:
      return 'В работе';
    case StatusType.REVIEW:
      return 'Ревью'; // Или 'На рассмотрении'
    case StatusType.TESTING:
      return 'Тестирование';
    case StatusType.COMPLETED:
      return 'Завершено';
    default:
      return 'Неизвестно';
  }
};

// Можно добавить другие утилиты для статусов, если нужно 