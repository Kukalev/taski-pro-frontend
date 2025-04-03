import React from 'react';
import { isBefore, isSameDay, isToday } from 'date-fns';

interface CalendarGridProps {
  currentMonth: Date;
  selectedDate: Date | null;
  today: Date;
  handleSelectDate: (date: Date, e: React.MouseEvent) => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ 
  currentMonth, 
  selectedDate, 
  today, 
  handleSelectDate 
}) => {
  return (
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
              onClick={(e) => !isPastDay && handleSelectDate(day, e)}
              disabled={isPastDay}
            >
              {day.getDate()}
            </button>
          );
        });
      })()}
    </div>
  );
};

export default CalendarGrid;
