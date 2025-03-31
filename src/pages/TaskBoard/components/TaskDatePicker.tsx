import React, { useState, useRef, useEffect } from 'react';
import { TaskDatePickerProps } from '../types';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, isSameMonth, isSameDay, isAfter, isBefore, isToday } from 'date-fns';
import { ru } from 'date-fns/locale';
import ReactDOM from 'react-dom';

const TaskDatePicker: React.FC<TaskDatePickerProps> = ({
  taskId,
  selectedDate,
  onDateChange,
  onClose
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Устанавливаем время на начало дня для корректного сравнения
  
  // Всегда инициализируем на текущий месяц, независимо от выбранной даты
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(today));
  // Начальное состояние - невидимый календарь
  const [isVisible, setIsVisible] = useState(false);
  const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0 });
  const calendarRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  
  // Находим иконку календаря и рассчитываем позицию ДО показа календаря
  useEffect(() => {
    const findTriggerAndPosition = () => {
      const triggerElement = document.querySelector(`[data-task-id="${taskId}"]`);
      if (triggerElement instanceof HTMLElement) {
        triggerRef.current = triggerElement;
        
        // Рассчитываем позицию сразу
        const rect = triggerElement.getBoundingClientRect();
        setCalendarPosition({ 
          top: rect.bottom + 5, 
          left: rect.left 
        });
        
        // Показываем календарь только после установки позиции
        setTimeout(() => setIsVisible(true), 50);
        return true;
      }
      return false;
    };
    
    if (!findTriggerAndPosition()) {
      const timer = setTimeout(findTriggerAndPosition, 50);
      return () => clearTimeout(timer);
    }
  }, [taskId]);
  
  // Обработчик клика вне календаря
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const clickedElement = e.target as HTMLElement;
      if (clickedElement.closest(`[data-task-id="${taskId}"]`)) {
        return;
      }
      
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose, taskId]);
  
  const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  
  const prevMonth = () => {
    // Проверяем, не пытаемся ли мы перейти к месяцу раньше текущего
    const prevMonthDate = subMonths(currentMonth, 1);
    if (isBefore(prevMonthDate, startOfMonth(today)) && !isSameMonth(prevMonthDate, today)) {
      return; // Не позволяем переходить к месяцам раньше текущего
    }
    setCurrentMonth(prevMonthDate);
  };
  
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  const handleSelectDate = (date: Date) => {
    // Проверяем, что выбранная дата не раньше сегодняшней
    if (isBefore(date, today) && !isToday(date)) {
      return; // Не позволяем выбирать даты ранее сегодняшней
    }
    onDateChange(taskId, date);
  };
  
  // Создаем компонент календаря, который будет изначально невидимым
  const calendarComponent = (
    <div 
      ref={calendarRef}
      className={`bg-white rounded-lg shadow-xl p-4 z-[1000] transition-opacity duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      style={{ 
        position: 'fixed',
        top: `${calendarPosition.top}px`,
        left: `${calendarPosition.left}px`,
        width: '280px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between items-center mb-4">
        <button 
          className={`p-1 rounded ${
            // Отключаем кнопку "назад", если текущий месяц - текущий месяц года
            isSameMonth(currentMonth, today) 
              ? 'text-gray-300 cursor-not-allowed' 
              : 'hover:bg-gray-100 text-gray-500'
          }`}
          onClick={prevMonth}
          disabled={isSameMonth(currentMonth, today)}
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
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {daysOfWeek.map(day => (
          <div 
            key={day} 
            className="text-center text-xs text-gray-500 font-medium py-1"
          >
            {day}
          </div>
        ))}
      </div>
      
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
            const isSelectedDay = selectedDate ? isSameDay(day, selectedDate) : false;
            const isPastDay = isBefore(day, today) && !isToday(day);
            
            return (
              <button
                key={index}
                className={`
                  w-8 h-8 flex items-center justify-center text-sm rounded-full
                  ${!isCurrentMonth ? 'text-gray-400' : 'text-gray-800'}
                  ${isToday(day) ? 'font-bold border border-orange-400' : ''}
                  ${isSelectedDay ? 'bg-orange-400 text-white' : ''}
                  ${isPastDay ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100'}
                `}
                onClick={() => !isPastDay && handleSelectDate(day)}
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
          onClick={() => onDateChange(taskId, null)}
        >
          Очистить
        </button>
        <button 
          className="text-xs text-orange-400 font-medium hover:text-orange-500"
          onClick={() => handleSelectDate(today)}
        >
          Сегодня
        </button>
      </div>
    </div>
  );
  
  // Рендерим через портал в body
  return ReactDOM.createPortal(calendarComponent, document.body);
};

export default TaskDatePicker;
