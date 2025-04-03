import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

// Форматирование даты для отображения
export const formatDate = (date: string | Date | null | undefined) => {
  if (!date) return null;
  
  try {
    return format(new Date(date), 'd MMMM yyyy', { locale: ru });
  } catch (error) {
    console.error('Ошибка форматирования даты:', error);
    return null;
  }
};

// Получить относительную дату (сколько дней осталось)
export const getRelativeDays = (date: string | Date | null | undefined) => {
  if (!date) return null;
  
  try {
    const targetDate = new Date(date);
    const today = new Date();
    
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  } catch (error) {
    console.error('Ошибка вычисления дней:', error);
    return null;
  }
};
