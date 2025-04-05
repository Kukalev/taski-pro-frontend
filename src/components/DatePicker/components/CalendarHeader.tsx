import React from 'react';
import { format, isSameMonth } from 'date-fns';
import { ru } from 'date-fns/locale';

interface CalendarHeaderProps {
  currentMonth: Date;
  today: Date;
  prevMonth: (e: React.MouseEvent) => void;
  nextMonth: (e: React.MouseEvent) => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({ 
  currentMonth, 
  today, 
  prevMonth, 
  nextMonth 
}) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <button 
        className={`p-1 rounded ${
          // Отключаем кнопку "назад", если текущий месяц - текущий месяц года
          isSameMonth(currentMonth, today) 
            ? 'text-gray-300 cursor-not-allowed' 
            : 'hover:bg-gray-100 text-gray-500 cursor-pointer'
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
        className={`p-1 hover:bg-gray-100 rounded text-gray-500 cursor-pointer`}
        onClick={nextMonth}
      >
        →
      </button>
    </div>
  );
};

export default CalendarHeader;
