import React, {useEffect, useRef, useState} from 'react'
import {STATUSES, TaskBoardProps} from './types'
import {useTaskDragAndDrop} from './hooks/useTaskDragAndDrop'
import TaskColumn from './components/TaskColumn'
import DeleteZone from './components/DeleteZone'
import DeleteModal from './components/DeleteModal'
import TaskDetails from './components/TaskDetails'
import {fadeInAnimation} from './styles/animations'
import {getTasksByDeskId, createTask, updateTask, deleteTask} from '../../services/task/Task'
import {Task} from '../../services/task/types/task.types'
import {StatusType} from './types'
import {UserService} from '../../services/users/Users'
import {DeskService} from '../../services/desk/Desk'
import { createPortal } from 'react-dom';

// Основной компонент
const TaskBoardPage: React.FC<TaskBoardProps> = ({ deskId }) => {
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
  const [deskUsers, setDeskUsers] = useState<any[]>([]);
  const [deskName, setDeskName] = useState('');
  
  const calendarRef = useRef<HTMLDivElement>(null);
  const currentDeskIdRef = useRef<number | null>(null);
  const loadingUsersRef = useRef(false);
  
  // Драг-н-дроп
  const {
    draggedTask,
    dropTarget,
    dropZoneHovered,
    handleDragStart,
    handleDragEnd,
    handleTaskDragOver,
    handleDropZoneDragOver,
    handleDropZoneDragLeave
  } = useTaskDragAndDrop();
  
  // Добавляем состояние для отслеживания анимации закрытия и смены задачи
  const [isTaskTransitioning, setIsTaskTransitioning] = useState(false);
  const [nextTask, setNextTask] = useState<Task | null>(null);
  
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
    if (loadingUsersRef.current) return;
    
    loadingUsersRef.current = true;
    
    const loadUsers = async () => {
      try {
        const users = await UserService.getUsersOnDesk(deskId);
        setDeskUsers(users);
      } catch (error) {
        console.error('Ошибка при загрузке пользователей:', error);
      } finally {
        loadingUsersRef.current = false;
      }
    };
    
    loadUsers();
  }, [deskId]);
  
  // ЗАГРУЗКА ЗАДАЧ - при монтировании и при изменении deskId
  useEffect(() => {
    // Проверяем, изменился ли deskId
    if (currentDeskIdRef.current === deskId) {
      return;
    }
    
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

  // ОСНОВНЫЕ ФУНКЦИИ ДЛЯ РАБОТЫ С ЗАДАЧАМИ
  
  // Получение задач по статусу
  const getTasksByStatus = (statusType: string) => {
    return tasks.filter(task => task.statusType === statusType);
  };
  
  // Создание новой задачи
  const handleCreateTask = async (statusId: number, taskText: string, statusType: string) => {
    try {
      const newTask = await createTask(deskId, taskText.trim(), statusType);
      setTasks(prev => [...prev, newTask]);
      return true;
    } catch (error) {
      console.error('[СОЗДАНИЕ] Ошибка:', error);
      return false;
    }
  };
  
  // Изменение статуса задачи
  const handleUpdateTaskStatus = async (taskId: number, statusType: string) => {
    try {
      const updatedTask = await updateTask(deskId, taskId, { statusType });
      setTasks(prev => prev.map(t => t.taskId === taskId ? updatedTask : t));
      
      // Если это выбранная задача, обновляем ее
      if (selectedTask && selectedTask.taskId === taskId) {
        setSelectedTask(updatedTask);
      }
      
      return true;
    } catch (error) {
      console.error('[СТАТУС] Ошибка:', error);
      return false;
    }
  };
  
  // Обновление даты
  const handleUpdateTaskDate = async (taskId: number, date: Date | null) => {
    try {
      const updatedTask = await updateTask(deskId, taskId, {
        taskFinishDate: date ? date.toISOString() : null
      });
      
      setTasks(prev => prev.map(t => t.taskId === taskId ? updatedTask : t));
      setSelectedDate(prev => ({...prev, [taskId]: date}));
      
      // Если это выбранная задача, обновляем ее
      if (selectedTask && selectedTask.taskId === taskId) {
        setSelectedTask(updatedTask);
      }
      
      return true;
    } catch (error) {
      console.error('[ДАТА] Ошибка:', error);
      return false;
    }
  };
  
  // Изменение статуса завершения
  const handleCompleteTask = async (taskId: number) => {
    try {
      const task = tasks.find(t => t.taskId === taskId);
      if (!task) return false;
      
      const newStatus = task.statusType === StatusType.COMPLETED 
        ? StatusType.BACKLOG 
        : StatusType.COMPLETED;
        
      const updatedTask = await updateTask(deskId, taskId, { statusType: newStatus });
      setTasks(prev => prev.map(t => t.taskId === taskId ? updatedTask : t));
      
      // Если это выбранная задача, обновляем ее
      if (selectedTask && selectedTask.taskId === taskId) {
        setSelectedTask(updatedTask);
      }
      
      return true;
    } catch (error) {
      console.error('[ЗАВЕРШЕНИЕ] Ошибка:', error);
      return false;
    }
  };
  
  // Удаление задачи
  const handleDeleteTask = async (taskId: number) => {
    try {
      await deleteTask(deskId, taskId);
      setTasks(prev => prev.filter(t => t.taskId !== taskId));
      
      // Если это выбранная задача, закрываем панель
      if (selectedTask && selectedTask.taskId === taskId) {
        setSelectedTask(null);
      }
      
      return true;
    } catch (error) {
      console.error('[УДАЛЕНИЕ] Ошибка:', error);
      return false;
    }
  };
  
  // Обработчик клика по задаче
  const handleTaskClick = (task: Task) => {
    // Если клик по той же задаче - закрываем панель
    if (selectedTask && selectedTask.taskId === task.taskId) {
      setIsTaskTransitioning(true);
      setNextTask(null);
      return;
    }
    
    // Если уже открыта другая задача - запускаем анимацию переключения
    if (selectedTask) {
      setIsTaskTransitioning(true);
      setNextTask(task);
    } else {
      // Иначе просто открываем панель
      setSelectedTask(task);
    }
  };
  
  // Обработчик закрытия панели задачи
  const handleCloseTaskDetails = () => {
    // Запускаем анимацию закрытия
    setIsTaskTransitioning(true);
    // Устанавливаем следующую задачу в null (полностью закрываем панель)
    setNextTask(null);
  };
  
  // Обработчик завершения анимации
  const handleTransitionEnd = () => {
    if (isTaskTransitioning) {
      // Обновляем задачу только после завершения анимации
      setSelectedTask(nextTask);
      setIsTaskTransitioning(false);
    }
  };
  
  // ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
  
  // Редактирование текста новой задачи
  const handleInputChange = (columnId: number, text: string) => {
    setNewTaskTexts(prev => ({
      ...prev,
      [columnId]: text
    }));
  };
  
  // Обработка клавиш при вводе текста
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
  
  // Сброс задачи в новый статус
  const handleDrop = async (e: React.DragEvent, targetStatusType: string) => {
    e.preventDefault();
    if (!draggedTask || !dropTarget) return;
    
    try {
      if (draggedTask.statusType !== targetStatusType) {
        await handleUpdateTaskStatus(draggedTask.taskId!, targetStatusType);
      }
    } catch (error) {
      console.error('[ПЕРЕМЕЩЕНИЕ] Ошибка:', error);
    }
  };
  
  // Клик по иконке даты
  const handleDateClick = (taskId: number) => {
    setDatePickerTaskId(datePickerTaskId === taskId ? null : taskId);
  };
  
  // Сброс в зону удаления
  const handleDeleteZoneDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedTask) return;
    
    setTaskToDelete(draggedTask.taskId!);
    setShowDeleteModal(true);
  };
  
  // Подтверждение удаления
  const handleDeleteConfirm = async () => {
    if (taskToDelete !== null) {
      await handleDeleteTask(taskToDelete);
      setShowDeleteModal(false);
      setTaskToDelete(null);
    }
  };
  
  // Обновление задачи
  const handleTaskUpdate = (updatedTask: Task) => {
    if (!updatedTask || !updatedTask.taskId) return;
    
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.taskId === updatedTask.taskId ? updatedTask : task
      )
    );
    
    // Если это выбранная задача, обновляем ее
    if (selectedTask && selectedTask.taskId === updatedTask.taskId) {
      setSelectedTask(updatedTask);
    }
  };

  // Также добавим отключение выбранной задачи при размонтировании компонента
  useEffect(() => {
    return () => {
      setSelectedTask(null);
      setNextTask(null);
      setIsTaskTransitioning(false);
    };
  }, []);

  // Функция для расчета позиций карточек задач
  const calculateTaskPosition = (statusType: string, taskId: number) => {
    const columnElement = document.querySelector(`[data-status="${statusType}"]`);
    if (!columnElement) return { x: 0, y: 0 };
    
    // Если задача уже существует в колонке, найдем её позицию
    const taskElement = columnElement.querySelector(`[data-task-id="${taskId}"]`);
    if (taskElement) {
      const rect = taskElement.getBoundingClientRect();
      return {
        x: rect.left + window.scrollX,
        y: rect.top + window.scrollY
      };
    }
    
    // Если задачи нет, берем позицию плейсхолдера или верх колонки
    const placeholder = columnElement.querySelector('.task-placeholder') || columnElement;
    const rect = placeholder.getBoundingClientRect();
    return {
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY
    };
  };
  
  // Функция для запуска анимации перемещения задачи
  const handleAnimateStatusChange = (taskId: number, fromStatus: string, toStatus: string) => {
    // Находим задачу
    const task = tasks.find(t => t.taskId === taskId);
    if (!task) return;
    
    // Вычисляем позиции начала и конца
    const startPos = calculateTaskPosition(fromStatus, taskId);
    const endPos = calculateTaskPosition(toStatus, taskId);
    
    // Устанавливаем состояние для анимации
    setAnimatingTask(task);
    setAnimationDetails({
      fromStatus,
      toStatus,
      startPos,
      endPos
    });
    
    // Запускаем анимацию
    setIsAnimating(true);
    
    // Завершаем анимацию через 500мс
    setTimeout(() => {
      setIsAnimating(false);
      setAnimatingTask(null);
    }, 500);
  };

  // РЕНДЕРИНГ
  return (
    <div className="flex-1 p-4 overflow-x-auto h-full">
      {loading ? (
        <div className="flex justify-center items-center h-[100vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 -mt-150"></div>
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
                onTaskClick={handleTaskClick}
                onTaskUpdate={handleTaskUpdate}
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
      
      {/* Панель с деталями задачи */}
      {selectedTask && (
        <TaskDetails 
          task={selectedTask}
          deskId={deskId}
          deskUsers={deskUsers}
          onClose={handleCloseTaskDetails}
          onTaskUpdate={handleTaskUpdate}
          isTransitioning={isTaskTransitioning}
          onTransitionEnd={handleTransitionEnd}
          deskName={deskName}
          onAnimateStatusChange={handleAnimateStatusChange}
        />
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
