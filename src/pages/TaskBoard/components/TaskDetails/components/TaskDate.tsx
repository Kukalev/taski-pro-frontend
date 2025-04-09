import React, {useRef, useState, useEffect} from 'react'
import {BsCalendarDate} from 'react-icons/bs'
import {format, addMonths, subMonths, startOfMonth, isSameDay, isToday, isBefore} from 'date-fns'
import {ru} from 'date-fns/locale'
import {canEditTaskDate} from '../../../../../utils/permissionUtils'

interface TaskDateProps {
  taskCreateDate: string | null;
  taskFinishDate: string | null;
  taskId: number;
  deskId: number;
  deskUsers: any[];
  onDateChange: (date: Date | null) => void;
  canEdit?: boolean;
}

const TaskDate: React.FC<TaskDateProps> = ({ 
  taskCreateDate, 
  taskFinishDate, 
  taskId, 
  deskId,
  deskUsers,
  onDateChange,
  canEdit = true
}) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(taskFinishDate ? new Date(taskFinishDate) : new Date()));
  const dateRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  const actualCanEdit = canEdit && canEditTaskDate(deskUsers, {taskId, taskFinishDate});

  useEffect(() => {
    setCurrentMonth(startOfMonth(taskFinishDate ? new Date(taskFinishDate) : new Date()));
  }, [taskFinishDate]);

  const startDateObj = taskCreateDate ? new Date(taskCreateDate) : null;
  const endDateObj = taskFinishDate ? new Date(taskFinishDate) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getDaysInfo = () => {
    if (!taskFinishDate) return { text: '', days: 0, color: '' };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const end = new Date(taskFinishDate);
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

  const prevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  const nextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleDateSelectOrClear = (date: Date | null, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!actualCanEdit) return;

    console.log('[TaskDate] Вызов onDateChange с датой:', date);
    onDateChange(date);

    setIsPickerOpen(false);
  };

  const { text: daysLeftText, color: daysColor } = getDaysInfo();

  useEffect(() => {
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
    
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);
    
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPickerOpen]);

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
              e.stopPropagation();
              setIsPickerOpen(!isPickerOpen);
            }}
            data-task-id={taskId}
          >
            {formatDate(taskCreateDate)} - {formatDate(taskFinishDate)}
          </div>
          <div className={`text-sm ml-3 ${daysColor}`}>
            {daysLeftText}
          </div>
        </div>
      </div>
      
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
                      onClick={(e) => !isPastDay && handleDateSelectOrClear(day, e)}
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
                onClick={(e) => handleDateSelectOrClear(null)}
              >
                Очистить
              </button>
              <button 
                className="text-xs text-orange-400 font-medium hover:text-orange-500"
                onClick={(e) => handleDateSelectOrClear(today, e)}
              >
                Сегодня
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDate;