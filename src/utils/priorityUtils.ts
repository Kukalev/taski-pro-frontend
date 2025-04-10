/**
 * Возвращает отображаемое название приоритета.
 * @param priorityType - Строка типа приоритета ('HIGH', 'MEDIUM', 'LOW', 'FROZEN').
 * @returns Локализованное название приоритета или 'Без приоритета'.
 */
export const getPriorityDisplay = (priorityType?: string | null): string => {
  if (!priorityType) return 'Без приоритета';

  switch (priorityType.toUpperCase()) {
    case 'HIGH':
      return 'Высокий';
    case 'MEDIUM':
      return 'Средний';
    case 'LOW':
      return 'Низкий';
    case 'FROZEN':
      return 'Заморожен';
    default:
      return 'Без приоритета';
  }
};

/**
 * Возвращает CSS класс Tailwind для цвета текста приоритета.
 * @param priorityType - Строка типа приоритета ('HIGH', 'MEDIUM', 'LOW', 'FROZEN').
 * @returns Строка с CSS классом Tailwind или 'text-gray-500' по умолчанию.
 */
export const getPriorityClass = (priorityType?: string | null): string => {
  if (!priorityType) return 'text-gray-500'; // Цвет по умолчанию

  switch (priorityType.toUpperCase()) {
    case 'HIGH':
      return 'text-red-500'; // Красный для высокого
    case 'MEDIUM':
      return 'text-yellow-500'; // Желтый/Оранжевый для среднего
    case 'LOW':
      return 'text-green-600'; // Зеленый для низкого (можно использовать 500 или 600)
    case 'FROZEN':
      return 'text-blue-500'; // Синий для замороженного
    default:
      return 'text-gray-500'; // Цвет по умолчанию
  }
};

// Можно добавить другие утилиты для приоритетов, если нужно 