import React, { useEffect } from 'react'
import {FaCheck, FaRegCircle} from 'react-icons/fa'
import {IoCalendarNumberOutline} from 'react-icons/io5'
import {StatusType, TaskCardProps} from '../types'
import {format} from 'date-fns'
import {ru} from 'date-fns/locale'
import TaskExecutors from './TaskExecutors'
import {canEditTask, getUserRoleOnDesk, UserRightType} from '../../../utils/permissionUtils'

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
  onTaskUpdate,
  canEdit = true
}) => {
  // Определяем, завершена ли задача
  const isCompleted = task.statusType === StatusType.COMPLETED;
  
  // Проверяем, может ли текущий пользователь редактировать эту задачу
  const userRole = getUserRoleOnDesk(deskUsers);
  const isMember = userRole === UserRightType.MEMBER;
  const canEditThisTask = canEdit && canEditTask(deskUsers, task);
  
  // Отладка прав доступа
  useEffect(() => {
    console.log(`Карточка ${task.taskId} (${task.taskName})`, {
      canEdit,
      deskUsers: deskUsers?.length || 0,
      task, 
    });
  }, [task, deskUsers, canEdit]);
  
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
      draggable={canEditThisTask}
      onDragStart={(e) => canEditThisTask && onDragStart(e, task)}
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
      
      {/* Компонент для управления исполнителями и кнопки */}
      <div className={`mt-2 pt-2 border-t border-gray-100 ${isCompleted ? 'opacity-70' : ''} flex justify-between items-center`}>
        {/* Левая часть - исполнители */}
        <TaskExecutors 
          task={task} 
          deskUsers={deskUsers} 
          deskId={deskId || 0}
          onTaskUpdate={onTaskUpdate}
          canEdit={canEditThisTask}
        />
        
        {/* Правая часть - дата и чекбокс */}
        <div className="flex items-center space-x-2">
          {/* Календарь - только для CREATOR и CONTRIBUTOR или для исполнителей задачи */}
          <div 
            className={`${canEditThisTask ? 'cursor-pointer' : 'cursor-default'} ${
              selectedDate || task.taskFinishDate ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            } transition-opacity duration-200`}
            data-task-id={task.taskId}
            onMouseEnter={() => canEditThisTask && setHoveredCalendar(task.taskId!)}
            onMouseLeave={() => canEditThisTask && setHoveredCalendar(null)}
            onClick={(e) => {
              e.stopPropagation();
              if (canEditThisTask) onDateClick(task.taskId!);
            }}
          >
            {selectedDate || task.taskFinishDate ? (
              <div className="text-xs text-gray-500">
                {formatShortDate(selectedDate || new Date(task.taskFinishDate))}
              </div>
            ) : (
              <IoCalendarNumberOutline 
                className={`calendar-icon transition-colors duration-300 ${!canEditThisTask && 'opacity-50'}`}
                style={{
                  color: hoveredCalendar === task.taskId ? '#facc15' : '#9ca3af',
                  width: '16px',
                  height: '16px'
                }}
              />
            )}
          </div>
          
          {/* Кнопка выполнено - только для CREATOR и CONTRIBUTOR или для исполнителей задачи */}
          <div 
            className={canEditThisTask ? 'cursor-pointer' : 'cursor-default'}
            onMouseEnter={() => canEditThisTask && setHoveredCheckCircle(task.taskId!)}
            onMouseLeave={() => canEditThisTask && setHoveredCheckCircle(null)}
            onClick={(e) => {
              e.stopPropagation();
              if (canEditThisTask) onComplete(task.taskId!);
            }}
          >
            <div className="relative">
              <FaRegCircle 
                className={`${isCompleted ? "text-green-200" : "text-gray-300"} ${!canEditThisTask && 'opacity-50'}`} 
                size={16} 
              />
              
              <FaCheck 
                className={`absolute top-0 left-0 transition-all duration-300
                  ${isCompleted 
                    ? 'text-green-500 opacity-100' 
                    : hoveredCheckCircle === task.taskId && canEditThisTask 
                      ? 'text-gray-400 opacity-100' 
                      : 'text-gray-400 opacity-0'
                  }`}
                size={10} 
                style={{ transform: 'translate(3px, 3px)' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
