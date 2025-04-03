import React, {useEffect, useState, useRef} from 'react'
import {TaskColumnProps, StatusType} from '../types'
import TaskCard from './TaskCard'
import TaskInput from './TaskInput'
import TaskDatePicker from './TaskDatePicker'
import {UserService} from '../../../services/users/Users'
import { useParams } from 'react-router-dom'
import { AuthService } from '../../../services/auth/Auth'
import { canCreateTasks, getUserRoleOnDesk, UserRightType } from '../../../utils/permissionUtils'

// Улучшенный синглтон для хранения пользователей доски
const DeskUsersState = {
  usersMap: new Map<number, any[]>(),
  loadingMap: new Map<number, boolean>(),
  
  getUsers(deskId: number) {
    return this.usersMap.get(deskId) || [];
  },
  
  setUsers(deskId: number, users: any[]) {
    this.usersMap.set(deskId, users);
    this.loadingMap.set(deskId, false);
    // Упрощаем логирование
    console.log(`[КЭШИРОВАНИЕ] Сохранены пользователи для доски ${deskId}: ${users.length}`);
  },
  
  hasUsers(deskId: number) {
    return this.usersMap.has(deskId);
  },
  
  isLoading(deskId: number) {
    return this.loadingMap.get(deskId) || false;
  },
  
  setLoading(deskId: number, loading: boolean) {
    this.loadingMap.set(deskId, loading);
  }
};

// Обновить интерфейс TaskColumnProps, добавив deskId и onTaskUpdate
interface ExtendedTaskColumnProps extends TaskColumnProps {
  deskId?: number;
  onTaskUpdate?: (updatedTask: any) => void;
}

const TaskColumn: React.FC<ExtendedTaskColumnProps> = ({
  status,
  tasks,
  deskId,
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
  onDateChange,
  onTaskClick,
  onTaskUpdate,
  setAddingInColumn
}) => {
  const [deskUsers, setDeskUsers] = useState<any[]>([]);
  const { deskId: urlDeskId } = useParams<{ deskId: string }>();
  const loadingRef = useRef(false);
  
  // Добавим ref для инпута добавления задачи
  const addInputRef = useRef<HTMLDivElement>(null);
  
  // Получаем роль пользователя и определяем, может ли он создавать задачи
  const userRole = getUserRoleOnDesk(deskUsers);
  const hasCreatePermission = userRole === UserRightType.CREATOR || userRole === UserRightType.CONTRIBUTOR;
  
  // Проверяем наличие deskId только один раз, убираем лишнее логирование
  useEffect(() => {
    if (!deskId) {
      console.error('TaskColumn: deskId не определен');
    }
  }, [deskId]);
  
  // Используем переданный deskId или ID из URL, или хардкодим для тестирования
  const actualDeskId = deskId || (urlDeskId ? parseInt(urlDeskId, 10) : 72);
  
  // Фильтруем задачи по статусу
  const columnTasks = tasks.filter(task => task.statusType === status.type);
  
  // Загрузка пользователей доски - оптимизирована
  useEffect(() => {
    // Отладочное логирование
    console.log(`Загрузка пользователей для колонки ${status.title}`, {
      actualDeskId,
      fromCache: DeskUsersState.hasUsers(actualDeskId),
      usersCount: DeskUsersState.getUsers(actualDeskId).length,
      isLoading: DeskUsersState.isLoading(actualDeskId)
    });
    
    // Проверяем, есть ли уже пользователи в кэше
    if (DeskUsersState.hasUsers(actualDeskId)) {
      setDeskUsers(DeskUsersState.getUsers(actualDeskId));
      return;
    }
    
    // Проверяем, загружаются ли уже пользователи
    if (DeskUsersState.isLoading(actualDeskId) || loadingRef.current) {
      return;
    }
    
    // Устанавливаем флаги загрузки
    DeskUsersState.setLoading(actualDeskId, true);
    loadingRef.current = true;
    
    const loadUsers = async () => {
      try {
        console.log(`Загрузка пользователей для доски ${actualDeskId}`);
        const users = await UserService.getUsersOnDesk(actualDeskId);
        
        console.log(`Загружены пользователи для доски ${actualDeskId}:`, users);
        
        // Сохраняем пользователей в кэш
        DeskUsersState.setUsers(actualDeskId, users);
        
        // Обновляем локальное состояние
        setDeskUsers(users);
      } catch (error) {
        console.error('Ошибка при загрузке пользователей:', error);
      } finally {
        loadingRef.current = false;
        DeskUsersState.setLoading(actualDeskId, false);
      }
    };

    loadUsers();
  }, [actualDeskId, status.title]);
  
  // Отладка прав доступа
  useEffect(() => {
    const username = AuthService.getUsername();
    console.log('Права на создание задач:', {
      username,
      deskUsers: deskUsers.length,
      hasCreatePermission
    });
    
    // Выводим информацию о всех пользователях
    deskUsers.forEach(user => {
      console.log('Пользователь доски:', {
        username: user.username || user.userName,
        role: user.rightType || user.role,
        isCurrentUser: (user.username === username || user.userName === username)
      });
    });
  }, [deskUsers, hasCreatePermission]);
  
  // Обработчик клика вне инпута для выхода из режима добавления
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isAddingInColumn !== null && 
          addInputRef.current && 
          !addInputRef.current.contains(e.target as Node)) {
        setAddingInColumn(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAddingInColumn, setAddingInColumn]);
  
  return (
    <div 
      className="w-[15%] min-w-[250px] flex flex-col h-[calc(100vh-80px)]"
      data-status={status.type}
    >
      <div className="mb-2 rounded-lg bg-white py-2">
        <h3 className="text-sm font-medium text-gray-700 ml-3">{status.title}</h3>
      </div>

      {/* Показываем кнопку добавления задачи только для CREATOR и CONTRIBUTOR */}
      {hasCreatePermission && (
        <div ref={addInputRef} className="mb-2">
          {isAddingInColumn === status.id ? (
            <TaskInput 
              statusId={status.id}
              value={inputValue[status.id] || ''}
              onChange={onInputChange}
              onKeyDown={onInputKeyDown}
              autoFocus={true}
            />
          ) : (
            <button 
              className="w-full h-10 px-3 bg-white text-[12px] text-gray-500 
                       text-left rounded-lg flex items-center border border-gray-200
                       hover:border-gray-300 transition-all shadow-sm"
              onClick={() => setAddingInColumn(status.id)}
            >
              <span className="text-gray-400 mr-1">+</span>
              <span>Добавить задачу...</span>
            </button>
          )}
        </div>
      )}

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
        
        {columnTasks.map((task, index) => (
          <div key={task.taskId} className="relative" data-task-id={task.taskId}>
            <TaskCard 
              task={task}
              deskUsers={deskUsers}
              deskId={actualDeskId}
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
              onTaskClick={onTaskClick}
              onTaskUpdate={onTaskUpdate}
              canEdit={true} // Проверка прав происходит внутри компонента
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
