import React from 'react'
import {isBefore, isSameDay, isToday} from 'date-fns'

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
        const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        let firstDayWeekday = firstDayOfMonth.getDay();
        firstDayWeekday = firstDayWeekday === 0 ? 6 : firstDayWeekday - 1;
        
        // Вычисляем последний день месяца
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
                w-8 h-8 flex items-center justify-center text-sm rounded-full
                ${!isCurrentMonth ? 'text-gray-400' : 'text-gray-800'}
                ${isToday(day) ? 'font-bold border' : ''}
                ${isSelectedDay ? 'text-white' : ''}
                ${isPastDay ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100'}
                ${!isPastDay ? 'cursor-pointer' : ''}
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
  );
};

export default CalendarGrid;
