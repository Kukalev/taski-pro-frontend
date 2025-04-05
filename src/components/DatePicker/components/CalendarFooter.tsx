import React from 'react';

interface CalendarFooterProps {
  taskId: string;
  today: Date;
  onDateChange: (taskId: string, date: Date | null) => void;
  handleSelectDate: (date: Date, e: React.MouseEvent) => void;
}

const CalendarFooter: React.FC<CalendarFooterProps> = ({ 
  taskId, 
  today, 
  onDateChange,
  handleSelectDate
}) => {
  return (
    <div className="mt-4 border-t pt-3 flex justify-between">
      <button 
        className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onDateChange(taskId, null);
        }}
      >
        Очистить
      </button>
      <button 
        className="text-xs font-medium cursor-pointer"
        style={{ color: 'var(--theme-color)', '--hover-color': 'var(--theme-color-dark)' } as React.CSSProperties}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--hover-color)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--theme-color)')}
        onClick={(e) => {
          e.stopPropagation();
          handleSelectDate(today, e);
        }}
      >
        Сегодня
      </button>
    </div>
  );
};

export default CalendarFooter;
