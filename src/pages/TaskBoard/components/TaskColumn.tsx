import React from 'react';
import { TaskColumnProps } from '../types';
import TaskCard from './TaskCard';
import TaskInput from './TaskInput';
import TaskDatePicker from './TaskDatePicker';

const TaskColumn: React.FC<TaskColumnProps> = ({
  status,
  tasks,
  onAddTask,
  onDragOver,
  onDrop,
  draggedTask,
  dropTarget,
  inputValue,
  onInputChange,
  onInputKeyDown,
  isAddingInColumn,
  hoveredCheckCircle,
  hoveredCalendar,
  datePickerTaskId,
  selectedDates,
  onTaskComplete,
  onDateClick,
  setHoveredCheckCircle,
  setHoveredCalendar,
  onDragStart,
  onDragEnd,
  onDateChange
}) => {
  return (
    <div 
      key={status.id} 
      className="w-[15%] min-w-[250px] flex flex-col h-[calc(100vh-80px)]"
    >
      <div className="mb-2 rounded-lg bg-white py-2">
        <h3 className="text-sm font-medium text-gray-700 ml-3">{status.title}</h3>
      </div>

      <TaskInput 
        statusId={status.id}
        value={inputValue[status.id] || ''}
        onChange={onInputChange}
        onKeyDown={onInputKeyDown}
        autoFocus={isAddingInColumn === status.id}
      />

      <div 
        className="space-y-2 flex-1 overflow-y-auto max-h-full pr-1 
        scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent relative"
        onDragOver={(e) => onDragOver(e, status.type, tasks)}
        onDrop={(e) => onDrop(e, status.type)}
      >
        {/* Индикатор вставки в начало */}
        {draggedTask && (
          <div 
            className={`absolute top-0 left-0 right-1 h-1 z-10 ${
              dropTarget?.statusType === status.type && dropTarget?.index === 0 
                ? 'bg-orange-400'
                : 'bg-transparent'
            }`}
          />
        )}
        
        {tasks.map((task, index) => (
          <div key={task.taskId} className="relative">
            <TaskCard 
              task={task}
              onDragStart={(e) => onDragStart(e, task)}
              onDragEnd={onDragEnd}
              onComplete={onTaskComplete}
              onDateClick={onDateClick}
              selectedDate={selectedDates[task.taskId!] || null}
              isDatePickerOpen={datePickerTaskId === task.taskId}
              hoveredCheckCircle={hoveredCheckCircle}
              hoveredCalendar={hoveredCalendar}
              setHoveredCheckCircle={setHoveredCheckCircle}
              setHoveredCalendar={setHoveredCalendar}
            />
            
            {/* Календарь */}
            {datePickerTaskId === task.taskId && (
              <TaskDatePicker 
                taskId={task.taskId!}
                selectedDate={selectedDates[task.taskId!] || null}
                onDateChange={onDateChange}
                onClose={() => onDateClick(task.taskId!)}
              />
            )}
            
            {/* Индикатор вставки после текущей задачи */}
            {draggedTask && (
              <div 
                className={`absolute bottom-[-4px] left-0 right-1 h-1 z-10 ${
                  dropTarget?.statusType === status.type && dropTarget?.index === index + 1
                    ? 'bg-orange-400'
                    : 'bg-transparent'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskColumn;
