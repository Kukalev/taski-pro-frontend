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
import DatePicker from '../../components/DatePicker/DatePicker'
import { AvatarService } from '../../services/Avatar/Avatar'
import { addHours } from 'date-fns'

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
  const [addingInColumn, setAddingInColumn] = useState<number | null>(null);
  const [newTaskTexts, setNewTaskTexts] = useState<Record<number, string>>({});
  const [hoveredCheckCircle, setHoveredCheckCircle] = useState<number | null>(null);
  const [hoveredCalendar, setHoveredCalendar] = useState<number | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [deskName, setDeskName] = useState('');
  const [isClosingTaskDetails, setIsClosingTaskDetails] = useState(false);
  const taskDetailsRef = useRef<HTMLDivElement>(null);
  const currentDeskIdRef = useRef<number | null>(null);
  const [avatarsMap, setAvatarsMap] = useState<Record<string, string | null>>({});
  const previousAvatarsRef = useRef<Record<string, string | null>>({});
  const [datePickerTarget, setDatePickerTarget] = useState<{ taskId: number; anchorEl: HTMLElement } | null>(null);

  const {
    draggedTask,
    dropTarget,
    showDropZone,
    dropZoneHovered,
    setDropTarget,
    setDropZoneHovered,
    handleDragStart,
    setShowDropZone
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
    updates: Partial<Task> | { executorUsernames?: string[]; removeExecutorUsernames?: string[] }
  ) => {
    console.log(`[TaskBoardPage] updateTaskOptimistically для задачи: ${taskId} с изменениями:`, updates);

    const originalTasks = tasks;
    const taskToUpdate = tasks.find(t => t.taskId === taskId); // Находим задачу
    if (!taskToUpdate) {
      console.error('[ОПТИМИСТИЧНОЕ ОБНОВЛЕНИЕ] Задача не найдена:', taskId);
      return; // Выходим, если задачи нет
    }

    let updatedTaskPreview: Task;

    // Обрабатываем обновление исполнителей для превью
    if ('executorUsernames' in updates && updates.executorUsernames) {
      const currentExecutors = taskToUpdate.executors || [];
      // Используем Set для гарантии уникальности и правильного добавления
      const newExecutors = [...new Set([...currentExecutors, ...updates.executorUsernames])];
      updatedTaskPreview = { ...taskToUpdate, executors: newExecutors };
    } else if ('removeExecutorUsernames' in updates && updates.removeExecutorUsernames) {
      const currentExecutors = taskToUpdate.executors || [];
      const executorsToRemove = updates.removeExecutorUsernames;
      updatedTaskPreview = { ...taskToUpdate, executors: currentExecutors.filter(u => !executorsToRemove.includes(u)) };
    } else {
      // Обычное обновление других полей (статус, дата и т.д.)
      updatedTaskPreview = { ...taskToUpdate, ...(updates as Partial<Task>) };
    }

    // 1. Обновляем UI немедленно
    setTasks(prev => prev.map(t => (t.taskId === taskId ? updatedTaskPreview : t)));
    if (selectedTask?.taskId === taskId) {
      setSelectedTask(updatedTaskPreview); // Обновляем и открытую задачу, если она совпадает
    }

    // 2. Отправляем запрос к API
    try {
      const apiPayload = updates; // Отправляем полученные updates напрямую
      const actualUpdatedTask = await updateTask(deskId, taskId, apiPayload);

      // 3. Обновляем UI окончательными данными из API (на случай расхождений)
      setTasks(prev => prev.map(t => (t.taskId === taskId ? actualUpdatedTask : t)));
       if (selectedTask?.taskId === taskId) {
           setSelectedTask(actualUpdatedTask);
       }
    } catch (error: any) { // Явно типизируем error
      console.error('[ОПТИМИСТИЧНОЕ ОБНОВЛЕНИЕ] Ошибка API:', error);
      // 4. Откат изменений в UI при ошибке API
      setTasks(originalTasks);
      if (selectedTask?.taskId === taskId && taskToUpdate) {
         setSelectedTask(taskToUpdate); // Возвращаем старую версию открытой задачи
      }
      // Показываем сообщение об ошибке
      const action = 'executorUsernames' in updates ? 'добавить' : ('removeExecutorUsernames' in updates ? 'удалить' : 'обновить');
      const target = 'executorUsernames' in updates ? updates.executorUsernames.join(', ') : ('removeExecutorUsernames' in updates ? updates.removeExecutorUsernames.join(', ') : '');
      // Проверяем на 401 ошибку
      if (error.response?.status === 401) {
         alert(`Ошибка авторизации при попытке ${action} исполнителей. Пожалуйста, войдите снова.`);
      } else {
        alert(`Не удалось ${action} ${target ? `"${target}"` : ''} для задачи "${taskToUpdate.taskName}". Изменения отменены.`);
      }
    }
  }, [tasks, deskId, selectedTask]); // Зависимости

  // Коллбэк для TaskCard и DatePicker - универсальный обработчик обновлений
  const handleRequestTaskUpdate = useCallback((
      taskId: number,
      updates: Partial<Task> | { executorUsernames?: string[]; removeExecutorUsernames?: string[] } // Принимает любые апдейты
  ) => {
      console.log(`[TaskBoardPage] Получен запрос на обновление для задачи ${taskId} с изменениями:`, updates);
      updateTaskOptimistically(taskId, updates); // Вызываем оптимистичное обновление
  }, [updateTaskOptimistically]); // Зависимость от основной функции

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
  const handleDateClick = useCallback((taskId: number, event: React.MouseEvent<HTMLElement>) => {
    // Сохраняем ID задачи и элемент, к которому привяжем DatePicker
    setDatePickerTarget({ taskId, anchorEl: event.currentTarget });
  }, []);

  const handleDatePickerClose = useCallback(() => {
    setDatePickerTarget(null);
  }, []);

  // Обработка выбора даты в DatePicker
  const handleDateSelect = useCallback((taskIdStr: string, newDate: Date | null) => {
    const taskId = Number(taskIdStr);
    console.log(`[TaskBoardPage] Выбрана дата для задачи ${taskId}:`, newDate);

    let dateToSend : string | null = null; // Будем отправлять ISO строку или null

    if (newDate instanceof Date && !isNaN(newDate.getTime())) {
        // --- НАЧАЛО: Коррекция часового пояса +3 часа ---
        // Добавляем 3 часа к выбранной дате, чтобы компенсировать UTC-смещение
        const adjustedDate = addHours(newDate, 3);
        dateToSend = adjustedDate.toISOString(); // Преобразуем скорректированную дату в ISO строку
         console.log(`[TaskBoardPage] Исходная дата: ${newDate.toISOString()}, Скорректированная (+3ч) для API: ${dateToSend}`);
        // --- КОНЕЦ: Коррекция часового пояса ---
    } else {
        console.log(`[TaskBoardPage] Дата сброшена или невалидна`);
        dateToSend = null; // Если дата сброшена или невалидна
    }

    // Вызываем централизованную функцию обновления со скорректированной датой
    handleRequestTaskUpdate(taskId, { taskFinishDate: dateToSend });
    handleDatePickerClose(); // Закрываем DatePicker
  }, [handleRequestTaskUpdate, handleDatePickerClose]); // Зависимости включают handleRequestTaskUpdate

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

  // Обработка drop на колонку
  const handleDropOnColumn = useCallback((targetStatusType: string) => {
    // Немедленно скрываем зону при любом дропе на колонку
    console.log('[handleDropOnColumn] Hiding drop zone immediately.');
    setShowDropZone(false); // <--- ВЫЗЫВАЕМ СРАЗУ

    if (!draggedTask || !draggedTask.taskId) {
      console.warn("[handleDropOnColumn] Drop failed: draggedTask or taskId is missing");
      return; // Зона уже скрыта
    }

    const taskId = draggedTask.taskId;
    const currentStatus = draggedTask.statusType;

    if (currentStatus !== targetStatusType) {
      console.log(`[TaskBoardPage] Dropped task ${taskId} onto ${targetStatusType}. Updating...`);
      updateTaskOptimistically(taskId, { statusType: targetStatusType as StatusType }, draggedTask);
    } else {
      console.log(`[TaskBoardPage] Dropped task ${taskId} onto same status ${targetStatusType}, no update needed.`);
    }
    // Состояние dropTarget сбросится в dragend
  }, [draggedTask, updateTaskOptimistically, setShowDropZone]); // Добавили setShowDropZone в зависимости

  // Обработчик drop на зону удаления
  const handleDeleteZoneDrop = useCallback(() => {
     // Немедленно скрываем зону при дропе на удаление
    console.log('[handleDeleteZoneDrop] Hiding drop zone immediately.');
    setShowDropZone(false); // <--- ВЫЗЫВАЕМ СРАЗУ

    if (!draggedTask || !draggedTask.taskId) {
      console.warn("[handleDeleteZoneDrop] Drop failed: draggedTask or taskId is missing");
      return; // Зона уже скрыта
    }
    console.log(`[TaskBoardPage] Dropped task ${draggedTask.taskId} onto delete zone. Showing modal...`);
    setTaskToDelete(draggedTask.taskId);
    setShowDeleteModal(true);
    // Состояние dropZoneHovered сбросится в dragend
  }, [draggedTask, setShowDropZone]); // Добавили setShowDropZone в зависимости

  // Коллбэк для TaskDetails (может остаться здесь, т.к. не зависит от других коллбэков в этом файле)
  const handleTaskUpdateFromDetails = useCallback((updatedTaskFromApi: Task) => {
      const taskId = updatedTaskFromApi.taskId;
      console.log(`[TaskBoardPage] Получены финальные данные для задачи ${taskId} из TaskDetails.`);
      // Просто обновляем состояние финальными данными, API вызов был ВНУТРИ TaskDetails
      setTasks(prevTasks =>
          prevTasks.map(t => (t.taskId === taskId ? updatedTaskFromApi : t))
      );
      if (selectedTask?.taskId === taskId) {
          setSelectedTask(updatedTaskFromApi); // Обновляем открытую задачу
      }
  }, [selectedTask]); // Зависит только от selectedTask

  // Лог для рендера (оставляем для проверки)
  console.log(`[TaskBoardPage Render] showDropZone state from hook: ${showDropZone}`);

  // --- Логика загрузки и управления аватарками ---
  const clearAvatarsMap = useCallback(() => {
      console.log("[TaskBoardPage] Очистка URL аватарок...");
      Object.values(previousAvatarsRef.current).forEach(url => {
          if (url) {
              URL.revokeObjectURL(url);
          }
      });
      previousAvatarsRef.current = {};
      setAvatarsMap({});
  }, []);

  useEffect(() => {
      previousAvatarsRef.current = avatarsMap;
  }, [avatarsMap]);

  // Функция для преобразования Base64 в Object URL (можно вынести в utils)
  const createObjectUrlsFromBatchResponse = (batchResponse: Record<string, string | null>): Record<string, string | null> => {
      const newAvatarsMap: Record<string, string | null> = {};
      for (const username in batchResponse) {
          const base64Data = batchResponse[username];
          let newUrl: string | null = null;
          if (base64Data && typeof base64Data === 'string' && base64Data.startsWith('data:image')) {
              try {
                  const byteCharacters = atob(base64Data.split(',')[1]);
                  const byteNumbers = new Array(byteCharacters.length);
                  for (let i = 0; i < byteCharacters.length; i++) {
                      byteNumbers[i] = byteCharacters.charCodeAt(i);
                  }
                  const byteArray = new Uint8Array(byteNumbers);
                  const mimeType = base64Data.match(/data:(.*);/)?.[1] || 'image/png';
                  const blob = new Blob([byteArray], { type: mimeType });
                  newUrl = URL.createObjectURL(blob);
              } catch (e) {
                  console.error(`[TaskBoardPage] Ошибка создания Object URL для ${username}:`, e);
              }
          } else if (base64Data) {
               console.warn(`[TaskBoardPage] Некорректный формат Base64 для ${username}`);
          }
          newAvatarsMap[username] = newUrl;
      }
      return newAvatarsMap;
  };

  // Загрузка аватарок при изменении deskUsers
  useEffect(() => {
      if (deskUsers && deskUsers.length > 0) {
          const usernamesToFetch = [...new Set(deskUsers
              .map(u => u.username || u.userName)
              .filter((name): name is string => !!name))];

          if (usernamesToFetch.length > 0) {
              console.log('[TaskBoardPage] Запрос аватарок для пользователей доски:', usernamesToFetch);
              clearAvatarsMap(); // Очищаем старые перед загрузкой новых
              AvatarService.getAllAvatars(usernamesToFetch)
                  .then(batchResponse => {
                      const objectUrlsMap = createObjectUrlsFromBatchResponse(batchResponse);
                      setAvatarsMap(objectUrlsMap);
                      console.log('[TaskBoardPage] Загружены и сохранены аватарки (Object URLs).');
                  })
                  .catch(error => {
                      console.error('[TaskBoardPage] Ошибка загрузки аватарок:', error);
                      clearAvatarsMap(); // Очищаем при ошибке
                  });
          } else {
              clearAvatarsMap(); // Нет имен для запроса
          }
      } else {
          clearAvatarsMap(); // Нет пользователей на доске
      }

      // Очистка при размонтировании или изменении deskUsers
      return () => {
          clearAvatarsMap();
      }
  }, [deskUsers, clearAvatarsMap]); // Зависимость от deskUsers и функции очистки

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
                avatarsMap={avatarsMap}
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
                onTaskComplete={handleCompleteTask}
                onDateClick={handleDateClick}
                setHoveredCheckCircle={setHoveredCheckCircle}
                setHoveredCalendar={setHoveredCalendar}
                onDragStart={handleDragStart}
                onTaskClick={handleTaskClick}
                onTaskUpdate={handleRequestTaskUpdate}
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
            avatarsMap={avatarsMap}
            onClose={handleCloseTaskDetails}
            onTaskUpdate={handleTaskUpdateFromDetails}
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
      
      {/* Рендеринг DatePicker */}
      {datePickerTarget && (() => {
          // Находим задачу, для которой открыт DatePicker
          const taskForPicker = tasks.find(t => t.taskId === datePickerTarget.taskId);
          // Получаем текущую дату из задачи или null
          const currentTaskDate = taskForPicker?.taskFinishDate
              ? new Date(taskForPicker.taskFinishDate) // Парсим строку ISO в Date
              : null;
          // Проверяем валидность после парсинга
          const validDate = currentTaskDate && !isNaN(currentTaskDate.getTime()) ? currentTaskDate : null;

          return (
              <DatePicker
                  // Используем taskId из datePickerTarget
                  taskId={datePickerTarget.taskId.toString()}
                  // Передаем текущую дату из найденной задачи (или null)
                  selectedDate={validDate}
                  // Передаем обработчик выбора даты
                  onDateChange={handleDateSelect}
                  // Передаем обработчик закрытия
                  onClose={handleDatePickerClose}
                  // Передаем anchorEl, если DatePicker его использует (опционально)
                  // anchorEl={datePickerTarget.anchorEl}
              />
          );
      })()}
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
