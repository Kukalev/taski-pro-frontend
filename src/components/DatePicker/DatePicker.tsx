import React, {useEffect, useRef, useState} from 'react'
import {TaskDatePickerProps} from './types.ts'
import {
  addMonths,
  isBefore,
  isSameMonth,
  isToday,
  startOfMonth,
  subMonths
} from 'date-fns'
import ReactDOM from 'react-dom'
import CalendarHeader from './components/CalendarHeader.tsx'
import WeekdaysHeader from './components/WeekdaysHeader.tsx'
import CalendarGrid from './components/CalendarGrid.tsx'
import CalendarFooter from './components/CalendarFooter.tsx'

const DatePicker: React.FC<TaskDatePickerProps> = ({
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
  
  const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  
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
  
  const prevMonth = (e: React.MouseEvent) => {
    e.stopPropagation(); // Останавливаем всплытие
    // Проверяем, не пытаемся ли мы перейти к месяцу раньше текущего
    const prevMonthDate = subMonths(currentMonth, 1);
    if (isBefore(prevMonthDate, startOfMonth(today)) && !isSameMonth(prevMonthDate, today)) {
      return; // Не позволяем переходить к месяцам раньше текущего
    }
    setCurrentMonth(prevMonthDate);
  };
  
  const nextMonth = (e: React.MouseEvent) => {
    e.stopPropagation(); // Останавливаем всплытие
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  const handleSelectDate = (date: Date, e: React.MouseEvent) => {
    e.stopPropagation(); // Останавливаем всплытие
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
      <CalendarHeader 
        currentMonth={currentMonth}
        today={today}
        prevMonth={prevMonth}
        nextMonth={nextMonth}
      />
      
      <WeekdaysHeader daysOfWeek={daysOfWeek} />
      
      <CalendarGrid 
        currentMonth={currentMonth}
        selectedDate={selectedDate}
        today={today}
        handleSelectDate={handleSelectDate}
      />
      
      <CalendarFooter 
        taskId={taskId}
        today={today}
        onDateChange={onDateChange}
        handleSelectDate={handleSelectDate}
      />
    </div>
  );
  
  // Рендерим через портал в body
  return ReactDOM.createPortal(calendarComponent, document.body);
};

export default DatePicker;
