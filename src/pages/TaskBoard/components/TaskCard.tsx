import React from 'react'
import {FaCheck, FaRegCircle} from 'react-icons/fa'
import {IoCalendarNumberOutline} from 'react-icons/io5'
import {StatusType, TaskCardProps} from '../types'
import {format} from 'date-fns'
import {ru} from 'date-fns/locale'
import TaskExecutors from './TaskExecutors'

// Форматирование даты для отображения в карточке
const formatShortDate = (date: Date) => {
  return format(date, 'd MMM', { locale: ru });
};

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  deskUsers,
  deskId,
  onTaskClick,
  onDragStart,
  onDragEnd,
  onComplete,
  onDateClick,
  selectedDate,
  isDatePickerOpen,
  hoveredCheckCircle,
  hoveredCalendar,
  setHoveredCheckCircle,
  setHoveredCalendar,
  onTaskUpdate
}) => {
  // Определяем, завершена ли задача
  const isCompleted = task.statusType === StatusType.COMPLETED;
  
  // Обработчик клика по карточке
  const handleCardClick = (e: React.MouseEvent) => {
    // Проверяем, что клик не был по интерактивным элементам внутри карточки
    const isInteractiveElement = [
      'button',
      'a',
      'input',
      'textarea',
      'select'
    ].includes((e.target as HTMLElement).tagName.toLowerCase());
    
    // Не обрабатываем клик, если он был по интерактивному элементу
    if (isInteractiveElement) {
      return;
    }
    
    // Вызываем переданный обработчик клика
    if (onTaskClick) {
      onTaskClick(task);
    }
  };

  return (
    <div
      className="bg-white rounded-lg shadow p-3 mb-2 cursor-pointer hover:shadow-md task-card group relative"
      onClick={handleCardClick}
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onDragEnd={onDragEnd}
    >
      <div className="mb-2">
        {/* Применяем стиль line-through для названия завершенной задачи */}
        <h3 className={`font-medium text-gray-900 ${isCompleted ? 'line-through text-gray-500' : ''}`}>
          {task.taskName}
        </h3>
        {task.taskDescription && (
          <p className={`text-sm text-gray-600 mt-1 ${isCompleted ? 'line-through text-gray-400' : ''}`}>
            {task.taskDescription}
          </p>
        )}
      </div>
      
      {/* Информация о дате - показываем только если задача не завершена или не выбрана дата для отображения в углу */}
      {task.taskFinishDate && !isCompleted && !selectedDate && (
        <div className="flex items-center text-xs text-gray-500 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>
            {format(new Date(task.taskFinishDate), 'd MMM', { locale: ru })}
          </span>
        </div>
      )}
      
      {/* Компонент для управления исполнителями */}
      <div className={`mt-2 pt-2 border-t border-gray-100 ${isCompleted ? 'opacity-70' : ''}`}>
        <TaskExecutors 
          task={task} 
          deskUsers={deskUsers} 
          deskId={deskId}
          onTaskUpdate={onTaskUpdate}
        />
      </div>

      {/* Календарь - восстановлен */}
      <div 
        className={`absolute bottom-1 right-8 mb-2 cursor-pointer ${
          selectedDate || task.taskFinishDate ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        } transition-opacity duration-200`}
        data-task-id={task.taskId}
        onMouseEnter={() => setHoveredCalendar(task.taskId!)}
        onMouseLeave={() => setHoveredCalendar(null)}
        onClick={(e) => {
          // Останавливаем всплытие события, чтобы не вызвался обработчик клика по карточке
          e.stopPropagation();
          onDateClick(task.taskId!);
        }}
      >
        {selectedDate || task.taskFinishDate ? (
          <div className="text-xs text-gray-500">
            {formatShortDate(selectedDate || new Date(task.taskFinishDate))}
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
      
      {/* Круг с галочкой - восстановлен */}
      <div 
        className="absolute bottom-1 right-3 mb-2 cursor-pointer"
        onMouseEnter={() => setHoveredCheckCircle(task.taskId!)}
        onMouseLeave={() => setHoveredCheckCircle(null)}
        onClick={(e) => {
          e.stopPropagation(); // Предотвращаем всплытие
          onComplete(task.taskId!);
        }}
      >
        <div className="relative">
          <FaRegCircle 
            className={isCompleted ? "text-green-200" : "text-gray-300"} 
            size={16} 
          />
          
          <FaCheck 
            className={`absolute top-0 left-0 transition-all duration-300
              ${isCompleted 
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
