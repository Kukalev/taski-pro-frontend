import React, {useEffect, useRef, useState} from 'react'
import {TaskDatePickerProps} from './types.ts'
import {
  addMonths,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  subMonths
} from 'date-fns'
import ReactDOM from 'react-dom'
import {ru} from 'date-fns/locale'

interface TaskDatePickerProps {
  taskId: string; // <-- Тип string
  selectedDate: Date | null;
  onDateChange: (taskId: string, date: Date | null) => void;
  onClose: () => void;
}

const DatePicker: React.FC<TaskDatePickerProps> = ({
  taskId,
  selectedDate,
  onDateChange,
  onClose
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(selectedDate || today));
  const [isVisible, setIsVisible] = useState(false);
  const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0 });
  const calendarRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  
  const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  
  useEffect(() => {
    const findTriggerAndPosition = () => {
      const triggerElement = document.querySelector(`[data-task-id="${taskId}"]`);
      if (triggerElement instanceof HTMLElement) {
        triggerRef.current = triggerElement;
        
        const rect = triggerElement.getBoundingClientRect();
        setCalendarPosition({ 
          top: rect.bottom + 5, 
          left: rect.left 
        });
        
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
    e.stopPropagation();

    const prevMonthDate = subMonths(currentMonth, 1);
    if (isBefore(prevMonthDate, startOfMonth(today)) && !isSameMonth(prevMonthDate, today)) {
      return;
    }
    setCurrentMonth(prevMonthDate);
  };
  
  const nextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  const handleSelectDate = (date: Date, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isBefore(date, today) && !isToday(date)) return;
    onDateChange(taskId, date);
  };
  
  const handleClearDate = (e: React.MouseEvent) => {
      e.stopPropagation();
      onDateChange(taskId, null);
  }
  
  const handleSelectToday = (e: React.MouseEvent) => {
     e.stopPropagation();
     handleSelectDate(today, e);
  }
  
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
          className="p-1 hover:bg-gray-100 rounded text-gray-500 cursor-pointer"
          onClick={prevMonth}
          disabled={isSameMonth(currentMonth, startOfMonth(today))}
        >
          ←
        </button>
        <div className="font-semibold">
          {format(currentMonth, 'LLLL yyyy', { locale: ru })}
        </div>
        <button 
          className="p-1 hover:bg-gray-100 rounded text-gray-500 cursor-pointer"
          onClick={nextMonth}
        >
          →
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {daysOfWeek.map(day => (
          <div key={day} className="text-center text-xs text-gray-500 font-medium py-1">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {(() => {
          const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
          let firstDayWeekday = firstDayOfMonth.getDay();
          firstDayWeekday = firstDayWeekday === 0 ? 6 : firstDayWeekday - 1;
          
          const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
          const daysInMonth = lastDayOfMonth.getDate();
          
          const calendarDays = [];
          
          const prevMonthLastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0).getDate();
          for (let i = 0; i < firstDayWeekday; i++) {
            const day = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, prevMonthLastDay - firstDayWeekday + i + 1);
            calendarDays.push(day);
          }
          
          for (let i = 1; i <= daysInMonth; i++) {
            const day = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
            calendarDays.push(day);
          }
          
          const remainingDays = 7 - (calendarDays.length % 7);
          if (remainingDays < 7) {
            for (let i = 1; i <= remainingDays; i++) {
              const day = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, i);
              calendarDays.push(day);
            }
          }
          
          return calendarDays.map((day, index) => {
            const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
            const isSelectedDay = selectedDate ? isSameDay(day, selectedDate) : false;
            const isPastDay = isBefore(day, today) && !isToday(day);
            
            return (
              <button
                key={index}
                className={`
                  w-7 h-7 flex items-center justify-center text-xs rounded-full
                  ${!isCurrentMonth ? 'text-gray-400' : 'text-gray-800'}
                  ${isToday(day) ? 'font-bold border' : ''}
                  ${isSelectedDay ? 'text-white' : ''}
                  ${isPastDay ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100 cursor-pointer'}
                `}
                style={{
                  borderColor: isToday(day) ? 'var(--theme-color)' : undefined,
                  backgroundColor: isSelectedDay ? 'var(--theme-color)' : undefined
                }}
                onClick={(e) => !isPastDay && handleSelectDate(day, e)}
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
          className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer"
          onClick={handleClearDate}
        >
          Очистить
        </button>
        <button 
          className="text-xs font-medium cursor-pointer"
          style={{ color: 'var(--theme-color)', '--hover-color': 'var(--theme-color-dark)' } as React.CSSProperties}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--hover-color)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--theme-color)')}
          onClick={handleSelectToday}
        >
          Сегодня
        </button>
      </div>
    </div>
  );
  
  return ReactDOM.createPortal(calendarComponent, document.body);
};

export default DatePicker;
