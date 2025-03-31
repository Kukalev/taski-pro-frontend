import React, { useState, useEffect, useRef } from 'react';
import { TaskBoardProps, STATUSES, StatusType } from './types';
import { useTaskActions } from './hooks/useTaskActions';
import { useTaskDragAndDrop } from './hooks/useTaskDragAndDrop';
import TaskColumn from './components/TaskColumn';
import DeleteZone from './components/DeleteZone';
import DeleteModal from './components/DeleteModal';
import { fadeInAnimation } from './styles/animations';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { registerLocale } from 'react-datepicker';
import ru from 'date-fns/locale/ru';
import ReactDOM from 'react-dom';

// Регистрируем русскую локаль для DatePicker
registerLocale('ru', ru);

const TaskBoardPage: React.FC<TaskBoardProps> = ({ deskId }) => {
  // Состояния
  const [addingInColumn, setAddingInColumn] = useState<number | null>(null);
  const [newTaskTexts, setNewTaskTexts] = useState<Record<number, string>>({});
  const [hoveredCheckCircle, setHoveredCheckCircle] = useState<number | null>(null);
  const [hoveredCalendar, setHoveredCalendar] = useState<number | null>(null);
  const [datePickerTaskId, setDatePickerTaskId] = useState<number | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  
  // Хуки
  const {
    tasks,
    loading,
    selectedDate,
    getTasksByStatus,
    handleCreateTask,
    handleUpdateTaskStatus,
    handleUpdateTaskDate,
    handleCompleteTask,
    handleDeleteTask
  } = useTaskActions(deskId);
  
  const {
    draggedTask,
    dropTarget,
    showDropZone,
    dropZoneHovered,
    handleDragStart,
    handleDragEnd,
    handleTaskDragOver,
    handleDropZoneDragOver,
    handleDropZoneDragLeave
  } = useTaskDragAndDrop();

  // Добавляем стили анимации
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = fadeInAnimation;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Обработчик клика вне календаря
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setDatePickerTaskId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Функции для работы с задачами
  const handleInputChange = (columnId: number, text: string) => {
    setNewTaskTexts(prev => ({
      ...prev,
      [columnId]: text
    }));
  };

  const handleKeyDown = async (e: React.KeyboardEvent, statusId: number) => {
    const taskText = newTaskTexts[statusId] || '';
    const status = STATUSES.find(s => s.id === statusId);
    
    if (!status) return;
    
    if (e.key === 'Enter' && taskText.trim()) {
      const success = await handleCreateTask(statusId, taskText.trim(), status.type);
      
      if (success) {
        setNewTaskTexts(prev => ({
          ...prev,
          [statusId]: ''
        }));
        setAddingInColumn(null);
      }
    } else if (e.key === 'Escape') {
      setNewTaskTexts(prev => ({
        ...prev,
        [statusId]: ''
      }));
      setAddingInColumn(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetStatusType: string) => {
    e.preventDefault();
    if (!draggedTask || !dropTarget) return;
    
    try {
      if (draggedTask.statusType !== targetStatusType) {
        await handleUpdateTaskStatus(draggedTask.taskId!, targetStatusType);
      }
    } catch (error) {
      console.error('Ошибка при перемещении задачи:', error);
    }
  };

  const handleDateClick = (taskId: number) => {
    setDatePickerTaskId(datePickerTaskId === taskId ? null : taskId);
  };

  const handleDeleteZoneDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedTask) return;
    
    setTaskToDelete(draggedTask.taskId!);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (taskToDelete !== null) {
      await handleDeleteTask(taskToDelete);
      setShowDeleteModal(false);
      setTaskToDelete(null);
    }
  };

  return (
    <div className="flex-1 p-4 overflow-x-auto h-full">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="flex space-x-4 h-full">
          {STATUSES.map(status => {
            const statusTasks = getTasksByStatus(status.type);
            
            return (
              <TaskColumn 
                key={status.id}
                status={status}
                tasks={statusTasks}
                onAddTask={handleCreateTask}
                onDragOver={handleTaskDragOver}
                onDrop={handleDrop}
                draggedTask={draggedTask}
                dropTarget={dropTarget}
                inputValue={newTaskTexts}
                onInputChange={handleInputChange}
                onInputKeyDown={handleKeyDown}
                isAddingInColumn={addingInColumn}
                hoveredCheckCircle={hoveredCheckCircle}
                hoveredCalendar={hoveredCalendar}
                datePickerTaskId={datePickerTaskId}
                selectedDates={selectedDate}
                onTaskComplete={handleCompleteTask}
                onDateClick={handleDateClick}
                setHoveredCheckCircle={setHoveredCheckCircle}
                setHoveredCalendar={setHoveredCalendar}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDateChange={handleUpdateTaskDate}
              />
            );
          })}
        </div>
      )}

      {/* Зона удаления */}
      <DeleteZone 
        visible={!!draggedTask}
        hovered={dropZoneHovered}
        onDragOver={handleDropZoneDragOver}
        onDragLeave={handleDropZoneDragLeave}
        onDrop={handleDeleteZoneDrop}
      />

      {/* Модальное окно удаления */}
      <DeleteModal 
        visible={showDeleteModal}
        taskName={tasks.find(t => t.taskId === taskToDelete)?.taskName}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteModal(false);
          setTaskToDelete(null);
        }}
      />
    </div>
  );
};

export default TaskBoardPage;
