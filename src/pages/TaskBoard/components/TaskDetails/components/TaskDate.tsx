import React, {useRef, useState} from 'react'
import {BsCalendarDate} from 'react-icons/bs'
import {updateTask} from '../../../../../services/task/Task'
import DatePicker from '../../../../../components/DatePicker/DatePicker'

interface TaskDateProps {
  taskCreateDate: string | null;
  taskFinishDate: string | null;
  taskId: number;
  deskId: number;
  onTaskUpdate: (task: any) => void;
}

const TaskDate: React.FC<TaskDateProps> = ({ 
  taskCreateDate, 
  taskFinishDate, 
  taskId, 
  deskId, 
  onTaskUpdate 
}) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [localFinishDate, setLocalFinishDate] = useState(taskFinishDate);
  const [error, setError] = useState<string | null>(null);
  const dateRef = useRef<HTMLDivElement>(null);

  // Преобразование строковых дат в объекты Date
  const startDateObj = taskCreateDate ? new Date(taskCreateDate) : null;
  const endDateObj = localFinishDate ? new Date(localFinishDate) : null;

  // Форматирование даты в формат "дд.мм.гггг"
  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Расчет оставшихся дней и определение цвета
  const getDaysInfo = () => {
    if (!localFinishDate) return { text: '', days: 0, color: '' };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const end = new Date(localFinishDate);
    end.setHours(0, 0, 0, 0);
    
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let text;
    let color;
    
    if (diffDays < 0) {
      text = 'просрочено';
      color = 'text-red-600';
    } else if (diffDays === 0) {
      text = 'сегодня';
      color = 'text-red-600';
    } else {
      text = `осталось ${diffDays} ${getDaysWord(diffDays)}`;
      
      // Цветовая индикация по количеству дней
      if (diffDays < 4) {
        color = 'text-red-600';
      } else if (diffDays <= 9) {
        color = 'text-yellow-600';
      } else {
        color = 'text-green-600';
      }
    }
    
    return { text, days: diffDays, color };
  };

  // Склонение слова "день"
  const getDaysWord = (days: number): string => {
    const lastDigit = days % 10;
    const lastTwoDigits = days % 100;
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
      return 'дней';
    }
    
    if (lastDigit === 1) {
      return 'день';
    }
    
    if (lastDigit >= 2 && lastDigit <= 4) {
      return 'дня';
    }
    
    return 'дней';
  };

  // Обработчик изменения даты
  const handleDateChange = async (taskId: number, date: Date) => {
    setError(null);
    
    // Проверяем, есть ли deskId
    if (!deskId) {
      setError('Ошибка: ID доски не определен');
      return;
    }
    
    // Обновляем локальную дату для UI
    const newFinishDate = date.toISOString();
    setLocalFinishDate(newFinishDate);
    
    try {
      // Используем правильное имя поля taskFinishDate вместо endDate
      const updatedTask = await updateTask(deskId, taskId, {
        taskFinishDate: newFinishDate
      });
      
      if (updatedTask) {
        onTaskUpdate(updatedTask);
        setIsPickerOpen(false);
      }
    } catch (error) {
      console.error('Ошибка при обновлении даты:', error);
      
      // Отображаем конкретную ошибку
      if (error.response?.status === 401) {
        setError('Ошибка авторизации. Войдите в систему заново.');
      } else if (error.response?.status === 404) {
        setError('Задача или доска не найдены.');
      } else {
        setError('Не удалось обновить дату. Проверьте соединение.');
      }
    }
  };

  const { text: daysLeftText, color: daysColor } = getDaysInfo();



  return (
    <div className="flex items-center py-2 border-b border-gray-100 relative">
      <div className="w-6 flex justify-center text-gray-400">
        <BsCalendarDate size={18} />
      </div>
      <div className="ml-4 flex items-center w-full">
        <div className="flex items-center">
          <span className="text-gray-500 mr-2">Дата:</span>
          <div
            ref={dateRef}
            className="text-gray-700 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-colors"
            onClick={() => {
              setError(null);
              setIsPickerOpen(!isPickerOpen);
            }}
            data-task-id={taskId}
          >
            {formatDate(taskCreateDate)} - {formatDate(localFinishDate)}
          </div>
          <div className={`text-sm ml-3 ${daysColor}`}>
            {daysLeftText}
          </div>
        </div>
      </div>
      
      {isPickerOpen && (
        <DatePicker
          taskId={taskId}
          selectedDate={endDateObj || new Date()}
          onDateChange={handleDateChange}
          onClose={() => setIsPickerOpen(false)}
        />
      )}
      
      {error && (
        <div className="absolute top-full left-0 mt-1 bg-red-50 text-red-500 p-2 rounded shadow-md text-sm z-50">
          {error}
        </div>
      )}
    </div>
  );
};

export default TaskDate;