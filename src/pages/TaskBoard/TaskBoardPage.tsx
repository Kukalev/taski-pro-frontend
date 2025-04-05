import React, {useCallback, useEffect, useRef, useState} from 'react'
import {STATUSES, StatusType} from './types'
import {useTaskDragAndDrop} from './hooks/useTaskDragAndDrop'
import TaskColumn from './components/TaskColumn'
import DeleteZone from './components/DeleteZone'
import DeleteModal from './components/DeleteModal'
import TaskDetails from './components/TaskDetails/TaskDetails'
import {fadeInAnimation} from './styles/animations'
import {
  createTask,
  deleteTask,
  getTasksByDeskId,
  updateTask
} from '../../services/task/Task'
import {Task} from '../../services/task/types/task.types'
import {DeskService} from '../../services/desk/Desk'
import {createPortal} from 'react-dom'

// Убираем TaskBoardProps, если deskUsers приходит как проп
interface TaskBoardPageProps {
  deskId: number;
  deskUsers: any[]; // Принимаем пользователей как проп
}

// Основной компонент
const TaskBoardPage: React.FC<TaskBoardPageProps> = ({ deskId, deskUsers }) => {
  // Основные состояния
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Record<number, Date | null>>({});
  const [addingInColumn, setAddingInColumn] = useState<number | null>(null);
  const [newTaskTexts, setNewTaskTexts] = useState<Record<number, string>>({});
  const [hoveredCheckCircle, setHoveredCheckCircle] = useState<number | null>(null);
  const [hoveredCalendar, setHoveredCalendar] = useState<number | null>(null);
  const [datePickerTaskId, setDatePickerTaskId] = useState<number | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [deskName, setDeskName] = useState('');
  const [isClosingTaskDetails, setIsClosingTaskDetails] = useState(false);
  const taskDetailsRef = useRef<HTMLDivElement>(null);
  const currentDeskIdRef = useRef<number | null>(null);

  const {
    draggedTask,
    dropTarget,
    showDropZone,
    dropZoneHovered,
    setDropTarget,
    setDropZoneHovered,
    handleDragStart,
  } = useTaskDragAndDrop();

  // Добавляем состояния для анимации
  const [animatingTask, setAnimatingTask] = useState<Task | null>(null);
  const [animationDetails, setAnimationDetails] = useState({
    fromStatus: '',
    toStatus: '',
    startPos: { x: 0, y: 0 },
    endPos: { x: 0, y: 0 }
  });
  const [isAnimating, setIsAnimating] = useState(false);

  // Загрузка пользователей доски
  useEffect(() => {
    if (currentDeskIdRef.current === deskId) return;
    
    console.log(`[ЗАДАЧИ] Загрузка для доски ${deskId}`);
    
    const loadTasks = async () => {
      try {
        setLoading(true);
        const fetchedTasks = await getTasksByDeskId(deskId);
        
        // Сохраняем задачи
        setTasks(fetchedTasks || []);
        
        // Инициализируем даты
        const datesMap: Record<number, Date | null> = {};
        fetchedTasks.forEach(task => {
          if (task.taskId && task.taskFinishDate) {
            datesMap[task.taskId] = new Date(task.taskFinishDate);
          }
        });
        setSelectedDate(datesMap);
        
        // Обновляем текущий идентификатор доски
        currentDeskIdRef.current = deskId;
      } catch (error) {
        console.error('[ЗАДАЧИ] Ошибка загрузки:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadTasks();
  }, [deskId]);

  // Добавление стилей анимации
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = fadeInAnimation;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // В useEffect для загрузки данных добавим получение имени доски
  useEffect(() => {
    const fetchDeskDetails = async () => {
      try {
        const deskDetails = await DeskService.getDeskById(deskId);
        if (deskDetails) {
          setDeskName(deskDetails.deskName || '');
        }
      } catch (error) {
        console.error('Ошибка при загрузке данных доски:', error);
      }
    };

    fetchDeskDetails();
  }, [deskId]);

  // Обновляем обработчик клика вне панели
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!selectedTask || isClosingTaskDetails) return;
      
      if (
        taskDetailsRef.current && 
        !taskDetailsRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('.task-card')
      ) {
        // Запускаем анимацию закрытия
        setIsClosingTaskDetails(true);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedTask, isClosingTaskDetails]);

  // ОСНОВНЫЕ ФУНКЦИИ ДЛЯ РАБОТЫ С ЗАДАЧАМИ
  
  // Получение задач по статусу
  const getTasksByStatus = (statusType: string) => {
    return tasks.filter(task => task.statusType === statusType);
  };
  
  // Оптимистичное обновление задачи
  const updateTaskOptimistically = useCallback(async (
    taskId: number,
    updates: Partial<Task> | { executorUsernames?: string[]; removeExecutorUsernames?: string[] },
    originalTask?: Task
  ) => {
    console.log('[TaskBoardPage] Вызван updateTaskOptimistically для задачи:', taskId, 'с изменениями:', updates);

    const originalTasks = tasks;
    const taskToUpdate = originalTask || tasks.find(t => t.taskId === taskId);
    if (!taskToUpdate) {
      console.error('[ОПТИМИСТИЧНОЕ ОБНОВЛЕНИЕ] Задача не найдена:', taskId);
      return;
    }

    let updatedTaskPreview: Task;

    // Обрабатываем добавление/удаление исполнителей для превью
    if ('executorUsernames' in updates && updates.executorUsernames) {
      const currentExecutors = taskToUpdate.executors || [];
      const newExecutors = updates.executorUsernames.filter(u => !currentExecutors.includes(u));
      updatedTaskPreview = {
        ...taskToUpdate,
        executors: [...currentExecutors, ...newExecutors]
      };
    } else if ('removeExecutorUsernames' in updates && updates.removeExecutorUsernames) {
      const currentExecutors = taskToUpdate.executors || [];
      const executorsToRemove = updates.removeExecutorUsernames;
      updatedTaskPreview = {
        ...taskToUpdate,
        executors: currentExecutors.filter(u => !executorsToRemove.includes(u))
      };
    } else {
      // Обычное обновление других полей
      updatedTaskPreview = { ...taskToUpdate, ...updates };
    }

    // 1. Обновляем UI немедленно
    setTasks(prev => prev.map(t => (t.taskId === taskId ? updatedTaskPreview : t)));
    if (selectedTask?.taskId === taskId) {
      setSelectedTask(updatedTaskPreview);
    }

    // 2. Отправляем запрос к API
    try {
      // В API отправляем только нужный payload (executorUsernames или removeExecutorUsernames),
      // а не весь объект task
      const apiPayload = ('executorUsernames' in updates || 'removeExecutorUsernames' in updates)
                         ? updates // Отправляем { executorUsernames: [...] } или { removeExecutorUsernames: [...] }
                         : updates as Partial<Task>; // Отправляем обычные изменения

      const actualUpdatedTask = await updateTask(deskId, taskId, apiPayload);

      // 3. Обновляем UI окончательными данными из API
      setTasks(prev => prev.map(t => (t.taskId === taskId ? actualUpdatedTask : t)));
       if (selectedTask?.taskId === taskId) {
           setSelectedTask(actualUpdatedTask);
       }
    } catch (error) {
      console.error('[ОПТИМИСТИЧНОЕ ОБНОВЛЕНИЕ] Ошибка API:', error);
      // 4. Откат изменений в UI при ошибке API
      setTasks(originalTasks);
      if (selectedTask?.taskId === taskId && taskToUpdate) {
         setSelectedTask(taskToUpdate);
      }
      alert(`Не удалось обновить исполнителей задачи "${taskToUpdate.taskName}". Изменения отменены.`);
    }
  }, [tasks, deskId, selectedTask]);

  // Создание задачи
  const handleCreateTask = useCallback(async (statusId: number, taskText: string, statusType: string) => {
    const tempId = Date.now(); // Временный ID для UI
    const newTaskPreview: Task = {
      taskId: tempId, // Используем временный ID
      taskName: taskText.trim(),
      statusType: statusType as StatusType,
      deskId: deskId,
      // Другие поля по умолчанию или null
      taskDescription: '',
      taskCreateDate: new Date().toISOString(),
      taskFinishDate: null,
      executors: [],
      priorityType: 'MEDIUM' // Пример
    };

    // 1. Оптимистично добавляем в UI
    setTasks(prev => [...prev, newTaskPreview]);
    setNewTaskTexts(prev => ({ ...prev, [statusId]: '' }));
    setAddingInColumn(null);

    // 2. Отправляем запрос к API
    try {
      const createdTask = await createTask(deskId, taskText.trim(), statusType);
      // 3. Заменяем временную задачу на реальную из API
      setTasks(prev => prev.map(t => t.taskId === tempId ? createdTask : t));
    } catch (error) {
      console.error('[СОЗДАНИЕ] Ошибка API:', error);
      // 4. Откат - удаляем временную задачу
      setTasks(prev => prev.filter(t => t.taskId !== tempId));
      alert('Не удалось создать задачу.');
    }
  }, [deskId]);

  // Завершение/Возобновление задачи
  const handleCompleteTask = useCallback((taskId: number) => {
    const task = tasks.find(t => t.taskId === taskId);
    if (!task) return;
    const newStatus = task.statusType === StatusType.COMPLETED ? StatusType.BACKLOG : StatusType.COMPLETED;
    updateTaskOptimistically(taskId, { statusType: newStatus }, task);
  }, [tasks, updateTaskOptimistically]);

  // Обновление даты задачи
  const handleUpdateTaskDate = useCallback((taskId: number, date: Date | null) => {
    updateTaskOptimistically(taskId, { taskFinishDate: date ? date.toISOString() : null });
    setSelectedDate(prev => ({ ...prev, [taskId]: date })); // Обновляем локальное состояние даты для календаря
    setDatePickerTaskId(null); // Закрываем календарь
  }, [updateTaskOptimistically]);

  // Удаление задачи
  const handleDeleteTask = useCallback(async (taskId: number) => {
    const originalTasks = tasks;
    const taskToDelete = tasks.find(t => t.taskId === taskId);
    if (!taskToDelete) return;

    // 1. Оптимистично удаляем из UI
    setTasks(prev => prev.filter(t => t.taskId !== taskId));
    if (selectedTask?.taskId === taskId) {
      setSelectedTask(null);
      setIsClosingTaskDetails(false); // Закрываем панель деталей сразу
    }

    // 2. Отправляем запрос к API
    try {
      await deleteTask(deskId, taskId);
    } catch (error) {
      console.error('[УДАЛЕНИЕ] Ошибка API:', error);
      // 3. Откат при ошибке
      setTasks(originalTasks);
      if (selectedTask?.taskId === taskId) { // Если панель была закрыта, а удаление не удалось
        setSelectedTask(taskToDelete); // Показываем ее снова
      }
      alert(`Не удалось удалить задачу "${taskToDelete.taskName}".`);
    }
  }, [tasks, deskId, selectedTask]);

  // Подтверждение удаления в модалке
  const handleDeleteConfirm = useCallback(() => {
    if (taskToDelete !== null) {
      handleDeleteTask(taskToDelete); // Вызываем оптимистичное удаление
      setShowDeleteModal(false);
      setTaskToDelete(null);
    }
  }, [taskToDelete, handleDeleteTask]);

  // Обновленный обработчик клика по задаче
  const handleTaskClick = useCallback((task: Task) => {
    if (isClosingTaskDetails) return;
    if (selectedTask && selectedTask.taskId === task.taskId) {
      setIsClosingTaskDetails(true);
    } else if (selectedTask) {
      setIsClosingTaskDetails(true);
      setTimeout(() => {
        setSelectedTask(task);
        setIsClosingTaskDetails(false);
      }, 300); // Должно совпадать с анимацией slide-out
    } else {
      setSelectedTask(task);
    }
  }, [selectedTask, isClosingTaskDetails]);

  // Обновленный обработчик закрытия панели
  const handleCloseTaskDetails = useCallback(() => {
    setIsClosingTaskDetails(true);
  }, []);

  // Завершение анимации закрытия панели деталей
  const handleDetailsAnimationEnd = useCallback(() => {
    if (isClosingTaskDetails) {
      setSelectedTask(null);
      setIsClosingTaskDetails(false);
    }
  }, [isClosingTaskDetails]);

  // Клик по иконке даты (открытие/закрытие календаря)
  const handleDateClick = useCallback((taskId: number) => {
    setDatePickerTaskId(prev => (prev === taskId ? null : taskId));
  }, []);

  // Обработка ввода в поле новой задачи
  const handleInputChange = useCallback((columnId: number, text: string) => {
    setNewTaskTexts(prev => ({ ...prev, [columnId]: text }));
  }, []);

  // Обработка Enter/Escape в поле новой задачи
  const handleKeyDown = useCallback((e: React.KeyboardEvent, statusId: number) => {
    const taskText = newTaskTexts[statusId] || '';
    const status = STATUSES.find(s => s.id === statusId);
    if (!status) return;

    if (e.key === 'Enter' && taskText.trim()) {
      handleCreateTask(statusId, taskText.trim(), status.type);
      // Очистка и закрытие инпута обрабатывается внутри handleCreateTask (оптимистично)
    } else if (e.key === 'Escape') {
      setNewTaskTexts(prev => ({ ...prev, [statusId]: '' }));
      setAddingInColumn(null);
    }
  }, [newTaskTexts, handleCreateTask]);

  // Обработка drop на колонку (здесь только обновление статуса)
  const handleDropOnColumn = useCallback((targetStatusType: string) => {
    // Вызывается из TaskColumn.onDrop
    if (!draggedTask || !draggedTask.taskId) {
      console.error("Drop failed: draggedTask or taskId is missing");
      return;
    }

    const taskId = draggedTask.taskId;

    // Обновляем только если статус реально изменился
    if (draggedTask.statusType !== targetStatusType) {
      console.log(`[TaskBoardPage] Dropped task ${taskId} onto ${targetStatusType}`);
      updateTaskOptimistically(taskId, { statusType: targetStatusType as StatusType }, draggedTask);
    } else {
      console.log(`[TaskBoardPage] Dropped task ${taskId} onto same status ${targetStatusType}, no update needed.`);
    }
    // Состояние DND сбросится глобальным обработчиком 'dragend'
  }, [draggedTask, updateTaskOptimistically]); // Добавили зависимости

  // Обработчик drop на зону удаления
  const handleDeleteZoneDrop = useCallback(() => {
    // Вызывается из DeleteZone.onDrop
    if (!draggedTask || !draggedTask.taskId) {
      console.error("Delete drop failed: draggedTask or taskId is missing");
      return;
    }
    console.log(`[TaskBoardPage] Dropped task ${draggedTask.taskId} onto delete zone`);
    setTaskToDelete(draggedTask.taskId); // Устанавливаем ID для модалки
    setShowDeleteModal(true);           // Показываем модалку
     // Состояние DND сбросится глобальным обработчиком 'dragend'
  }, [draggedTask]); // Добавили зависимость

  // Обработчик обновления задачи из дочерних компонентов
  const handleTaskUpdateFromChild = useCallback((taskId: number, updates: Partial<Task> | { executorUsernames?: string[]; removeExecutorUsernames?: string[] }) => {
    console.log('[TaskBoardPage] Вызван handleTaskUpdateFromChild для задачи:', taskId, 'с изменениями:', updates);
    const task = tasks.find(t => t.taskId === taskId);
    if (task) {
      updateTaskOptimistically(taskId, updates, task);
    } else {
      console.error('[handleTaskUpdateFromChild] Задача не найдена:', taskId);
    }
  }, [tasks, updateTaskOptimistically]);

  // РЕНДЕРИНГ
  return (
    <div className="flex-1 p-4 overflow-x-auto h-full">
      {loading ? (
        <div className="flex justify-center items-center h-full">
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
                deskId={deskId}
                deskUsers={deskUsers}
                draggedTask={draggedTask}
                dropTarget={dropTarget}
                setDropTarget={setDropTarget}
                onDropOnColumn={handleDropOnColumn}
                onAddTask={handleCreateTask}
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
                onDateChange={handleUpdateTaskDate}
                onTaskClick={handleTaskClick}
                onTaskUpdate={handleTaskUpdateFromChild}
                setAddingInColumn={setAddingInColumn}
              />
            );
          })}
        </div>
      )}

      {/* Зона удаления */}
      <DeleteZone 
        visible={showDropZone}
        hovered={dropZoneHovered}
        setHovered={setDropZoneHovered}
        onDrop={handleDeleteZoneDrop}
        deskUsers={deskUsers}
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
      
      {/* Панель с деталями задачи */}
      {selectedTask && (
        <div ref={taskDetailsRef}>
          <TaskDetails 
            task={selectedTask}
            deskId={deskId}
            deskUsers={deskUsers}
            onClose={handleCloseTaskDetails}
            onTaskUpdate={(updates) => handleTaskUpdateFromChild(updates.taskId, updates)}
            deskName={deskName}
            isClosing={isClosingTaskDetails}
            onAnimationEnd={handleDetailsAnimationEnd}
          />
        </div>
      )}
      
      {/* Анимация перемещения задачи */}
      {isAnimating && animatingTask && createPortal(
        <div 
          className="fixed pointer-events-none z-50 transition-all duration-500 ease-in-out"
          style={{
            transform: `translate(${animationDetails.startPos.x}px, ${animationDetails.startPos.y}px)`,
            width: '250px',
            height: '130px',
            opacity: 0.9,
            animation: 'taskMoveAnimation 500ms forwards'
          }}
        >
          <style>
            {`
              @keyframes taskMoveAnimation {
                0% {
                  transform: translate(${animationDetails.startPos.x}px, ${animationDetails.startPos.y}px);
                  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }
                50% {
                  transform: translate(
                    ${animationDetails.startPos.x + (animationDetails.endPos.x - animationDetails.startPos.x) * 0.5}px, 
                    ${animationDetails.startPos.y + (animationDetails.endPos.y - animationDetails.startPos.y) * 0.2}px
                  );
                  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                }
                100% {
                  transform: translate(${animationDetails.endPos.x}px, ${animationDetails.endPos.y}px);
                  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }
              }
            `}
          </style>
          
          {/* Клон карточки для анимации */}
          <div className="bg-white rounded-lg shadow-md p-3 border-l-4 border-blue-500">
            <div className="text-sm font-medium mb-2">{animatingTask.taskName}</div>
            <div className="text-xs text-gray-500 mb-2">
              {animatingTask.taskDescription ? 
                (animatingTask.taskDescription.length > 50 
                  ? animatingTask.taskDescription.substring(0, 50) + '...' 
                  : animatingTask.taskDescription) 
                : 'Без описания'}
            </div>
            <div className="flex justify-between items-center">
              <div className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">
                {getStatusLabel(animationDetails.toStatus)}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

// Добавим вспомогательную функцию для получения метки статуса
const getStatusLabel = (statusType: string): string => {
  switch (statusType) {
    case 'BACKLOG': return 'К выполнению';
    case 'INWORK': return 'В работе';
    case 'REVIEW': return 'На рассмотрении';
    case 'TESTING': return 'Тестирование';
    case 'COMPLETED': return 'Завершено';
    default: return 'Неизвестно';
  }
};

export default TaskBoardPage;
