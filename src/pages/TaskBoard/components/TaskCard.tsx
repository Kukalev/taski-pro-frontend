import React from 'react'
import {FaCheck, FaRegCircle} from 'react-icons/fa'
import {IoCalendarNumberOutline} from 'react-icons/io5'
import {PiUserCircleThin} from 'react-icons/pi'
import {StatusType, TaskCardProps} from '../types'
import {format} from 'date-fns'
import {ru} from 'date-fns/locale'

// Форматирование даты для отображения в карточке
const formatShortDate = (date: Date) => {
  return format(date, 'd MMM', { locale: ru });
};

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onDragStart,
  onDragEnd,
  onComplete,
  onDateClick,
  selectedDate,
  isDatePickerOpen,
  hoveredCheckCircle,
  hoveredCalendar,
  setHoveredCheckCircle,
  setHoveredCalendar
}) => {
  return (
    <div
      className="bg-white pl-3 pb-3 min-h-[100px] cursor-pointer pt-2 rounded-lg border
      border-gray-200 hover:shadow-sm transition-shadow relative group task-card"
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onDragEnd={onDragEnd}
    >
      {task.taskId && (
        <div className="text-[10px] text-gray-400 mt-0 inline-flex">
          <span className="bg-gray-200 inline-flex justify-center items-center
          min-w-[20px] h-5 px-1 rounded">
            #{task.taskId}
          </span>
        </div>
      )}
      
      <div className={`text-sm ${task.statusType === StatusType.COMPLETED ? 'line-through text-gray-400' : ''}`}>
        {task.taskName}
      </div>

      {/* Иконка пользователя */}
      <div className="absolute bottom-1 left-3 mb-2 opacity-0 group-hover:opacity-100 
      transition-opacity duration-200">
        <PiUserCircleThin 
          className="text-gray-400 transition-colors duration-300 hover:text-orange-500 cursor-pointer" 
          style={{ width: '20px', height: '20px' }}
        />
      </div>
      
      {/* Иконка календаря или дата */}
      <div 
        className={`absolute bottom-1 right-8 mb-2 cursor-pointer ${
          selectedDate ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        } transition-opacity duration-200`}
        data-task-id={task.taskId}
        onMouseEnter={() => setHoveredCalendar(task.taskId!)}
        onMouseLeave={() => setHoveredCalendar(null)}
        onClick={() => onDateClick(task.taskId!)}
      >
        {selectedDate ? (
          <div className="text-xs text-gray-500">
            {formatShortDate(selectedDate)}
          </div>
        ) : (
          <IoCalendarNumberOutline 
            className="calendar-icon transition-colors duration-300"
            style={{
              color: hoveredCalendar === task.taskId ? '#facc15' : '#9ca3af',
              width: '16px',
              height: '16px'
            }}
          />
        )}
      </div>
      
      {/* Круг с галочкой */}
      <div 
        className="absolute bottom-1 right-3 mb-2 cursor-pointer"
        onMouseEnter={() => setHoveredCheckCircle(task.taskId!)}
        onMouseLeave={() => setHoveredCheckCircle(null)}
        onClick={() => onComplete(task.taskId!)}
      >
        <div className="relative">
          <FaRegCircle 
            className={task.statusType === StatusType.COMPLETED ? "text-green-200" : "text-gray-300"} 
            size={16} 
          />
          
          <FaCheck 
            className={`absolute top-0 left-0 transition-all duration-300
              ${task.statusType === StatusType.COMPLETED 
                ? 'text-green-500 opacity-100' 
                : hoveredCheckCircle === task.taskId 
                  ? 'text-gray-400 opacity-100' 
                  : 'text-gray-400 opacity-0'
              }`}
            size={10} 
            style={{ transform: 'translate(3px, 3px)' }}
          />
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
