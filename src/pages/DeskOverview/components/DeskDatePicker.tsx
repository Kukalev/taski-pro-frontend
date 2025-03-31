import React, { useState, useRef, useEffect } from 'react';
import { DeskDatePickerProps } from '../types';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, isSameMonth, isSameDay, isToday } from 'date-fns';
import { ru } from 'date-fns/locale';
import ReactDOM from 'react-dom';

const DeskDatePicker: React.FC<DeskDatePickerProps> = ({
  selectedDate,
  onDateChange,
  onClose,
  isVisible
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(selectedDate || today));
  const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0 });
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  
  // Находим кнопку с датой для позиционирования
  useEffect(() => {
    const findButtonAndPosition = () => {
      const dateButton = document.querySelector('[data-date-button="true"]');
      if (dateButton instanceof HTMLElement) {
        const rect = dateButton.getBoundingClientRect();
        setCalendarPosition({
          top: rect.bottom + 5,
          left: rect.left
        });
        
        // Показываем календарь только после установки позиции
        setTimeout(() => setIsCalendarVisible(true), 50);
        return true;
      }
      return false;
    };
    
    if (isVisible) {
      if (!findButtonAndPosition()) {
        const timer = setTimeout(findButtonAndPosition, 50);
        return () => clearTimeout(timer);
      }
    }
  }, [isVisible]);
  
  // Обработчик клика вне календаря
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const dateButton = document.querySelector('[data-date-button="true"]');
      if (
        dateButton && 
        dateButton.contains(e.target as Node)
      ) {
        return;
      }
      
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    
    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isVisible, onClose]);
  
  const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  const handleSelectDate = (date: Date) => {
    onDateChange(date);
  };
  
  if (!isVisible) return null;
  
  const calendarComponent = (
    <div 
      ref={calendarRef}
      className={`bg-white rounded-lg shadow-xl p-4 z-[1000] transition-opacity duration-200 ${isCalendarVisible ? 'opacity-100' : 'opacity-0'}`}
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
            
            return (
              <button
                key={index}
                className={`
                  w-8 h-8 flex items-center justify-center text-sm rounded-full
                  ${!isCurrentMonth ? 'text-gray-400' : 'text-gray-800'}
                  ${isToday(day) ? 'font-bold' : ''}
                  ${isSelectedDay ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}
                `}
                onClick={() => handleSelectDate(day)}
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
          onClick={() => onDateChange(null)}
        >
          Очистить
        </button>
        <button 
          className="text-xs text-blue-500 font-medium hover:text-blue-600"
          onClick={() => handleSelectDate(today)}
        >
          Сегодня
        </button>
      </div>
    </div>
  );
  
  return ReactDOM.createPortal(calendarComponent, document.body);
};

export default DeskDatePicker;
