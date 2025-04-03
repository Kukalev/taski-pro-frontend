import React, {useRef, useState} from 'react'
import {BsCalendarDate} from 'react-icons/bs'
import {updateTask} from '../../../../../services/task/Task'
import {format, addMonths, subMonths, startOfMonth, isSameDay, isToday, isBefore} from 'date-fns'
import {ru} from 'date-fns/locale'
import {canEditTaskDate} from '../../../../../utils/permissionUtils'

interface TaskDateProps {
  taskCreateDate: string | null;
  taskFinishDate: string | null;
  taskId: number;
  deskId: number;
  deskUsers: any[];
  onTaskUpdate: (task: any) => void;
  canEdit?: boolean;
}

const TaskDate: React.FC<TaskDateProps> = ({ 
  taskCreateDate, 
  taskFinishDate, 
  taskId, 
  deskId,
  deskUsers,
  onTaskUpdate,
  canEdit = true
}) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [localFinishDate, setLocalFinishDate] = useState(taskFinishDate);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(localFinishDate ? new Date(localFinishDate) : new Date()));
  const dateRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Проверка может ли пользователь менять дату (MEMBER не может)
  const actualCanEdit = canEdit && canEditTaskDate(deskUsers, {taskId, taskFinishDate});

  // Преобразование строковых дат в объекты Date
  const startDateObj = taskCreateDate ? new Date(taskCreateDate) : null;
  const endDateObj = localFinishDate ? new Date(localFinishDate) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

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

  // Смена месяца
  const prevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  const nextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // Обработчик изменения даты
  const handleDateChange = async (date: Date | null) => {
    if (!actualCanEdit) return;
    
    setError(null);
    
    // Проверяем, есть ли deskId
    if (!deskId) {
      setError('Ошибка: ID доски не определен');
      return;
    }
    
    // Обновляем локальную дату для UI
    const newFinishDate = date ? date.toISOString() : null;
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

  // Обработчик клика по документу для закрытия календаря
  React.useEffect(() => {
    if (!isPickerOpen) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      if (
        pickerRef.current && 
        !pickerRef.current.contains(e.target as Node) &&
        dateRef.current && 
        !dateRef.current.contains(e.target as Node)
      ) {
        setIsPickerOpen(false);
      }
    };
    
    // Добавляем слушатель с задержкой, чтобы избежать немедленного срабатывания
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);
    
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPickerOpen]);

  // Выбор даты
  const handleDateSelect = (date: Date, e: React.MouseEvent) => {
    e.stopPropagation();
    handleDateChange(date);
  };

  const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

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
            className={`text-gray-700 ${actualCanEdit ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default'} px-2 py-1 rounded transition-colors`}
            onClick={(e) => {
              if (!actualCanEdit) return;
              e.stopPropagation(); // Предотвращаем всплытие события
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
      
      {/* Встроенный календарь, который появляется в TaskDetails */}
      {isPickerOpen && actualCanEdit && (
        <div 
          ref={pickerRef}
          className="absolute right-0 top-full mt-1 z-40 bg-white rounded-lg shadow-lg border border-gray-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 w-64">
            <div className="flex justify-between items-center mb-4">
              <button 
                className="p-1 hover:bg-gray-100 rounded text-gray-500"
                onClick={prevMonth}
              >
                ←
              </button>
              <div className="font-semibold">
                {format(currentMonth, 'LLLL yyyy', { locale: ru })}
              </div>
              <button 
                className="p-1 hover:bg-gray-100 rounded text-gray-500"
                onClick={nextMonth}
              >
                →
              </button>
            </div>
            
            {/* Дни недели */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {daysOfWeek.map(day => (
                <div key={day} className="text-center text-xs text-gray-500 font-medium py-1">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Дни месяца */}
            <div className="grid grid-cols-7 gap-1">
              {(() => {
                // Вычисляем первый день месяца
                const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
                // День недели первого дня (0 - воскресенье, 1 - понедельник и т.д.)
                let firstDayWeekday = firstDayOfMonth.getDay();
                // Переводим в формат 0 - понедельник, 6 - воскресенье
                firstDayWeekday = firstDayWeekday === 0 ? 6 : firstDayWeekday - 1;
                
                // Вычисляем последний день месяца
                const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
                const daysInMonth = lastDayOfMonth.getDate();
                
                // Массив для всех дней, которые будем отображать
                const calendarDays = [];
                
                // Дни предыдущего месяца
                const prevMonthLastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0).getDate();
                for (let i = 0; i < firstDayWeekday; i++) {
                  const day = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, prevMonthLastDay - firstDayWeekday + i + 1);
                  calendarDays.push(day);
                }
                
                // Дни текущего месяца
                for (let i = 1; i <= daysInMonth; i++) {
                  const day = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
                  calendarDays.push(day);
                }
                
                // Дни следующего месяца (добавляем столько, чтобы общее число было кратно 7)
                const remainingDays = 7 - (calendarDays.length % 7);
                if (remainingDays < 7) {
                  for (let i = 1; i <= remainingDays; i++) {
                    const day = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, i);
                    calendarDays.push(day);
                  }
                }
                
                // Рендерим все дни
                return calendarDays.map((day, index) => {
                  const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                  const isSelectedDay = endDateObj ? isSameDay(day, endDateObj) : false;
                  const isPastDay = isBefore(day, today) && !isToday(day);
                  
                  return (
                    <button
                      key={index}
                      className={`
                        w-7 h-7 flex items-center justify-center text-xs rounded-full
                        ${!isCurrentMonth ? 'text-gray-400' : 'text-gray-800'}
                        ${isToday(day) ? 'font-bold border border-orange-400' : ''}
                        ${isSelectedDay ? 'bg-orange-400 text-white' : ''}
                        ${isPastDay ? 'text-gray-300' : 'hover:bg-gray-100'}
                      `}
                      onClick={(e) => !isPastDay && handleDateSelect(day, e)}
                      disabled={isPastDay}
                    >
                      {day.getDate()}
                    </button>
                  );
                });
              })()}
            </div>
            
            <div className="mt-4 border-t pt-3 flex justify-between">
              <button 
                className="text-xs text-gray-500 hover:text-gray-700"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDateChange(null);
                }}
              >
                Очистить
              </button>
              <button 
                className="text-xs text-orange-400 font-medium hover:text-orange-500"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDateSelect(today, e);
                }}
              >
                Сегодня
              </button>
            </div>
          </div>
        </div>
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