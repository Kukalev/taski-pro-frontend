import React, {useEffect, useRef, useState, useCallback} from 'react'
import {PiUserCircleThin} from 'react-icons/pi'
import {UserService} from '../../../services/users/Users'
import {canEditTask, canManageExecutors, getUserRoleOnDesk, UserRightType, isCurrentUser} from '../../../utils/permissionUtils'

// Кэш для пользователей, чтобы не загружать их много раз
const usersCache = new Map<number, any[]>();

interface TaskExecutorProps {
  task: any;
  deskUsers: any[];
  deskId: number;
  onTaskUpdate: (updates: { executorUsernames?: string[]; removeExecutorUsernames?: string[] }) => void;
  canEdit?: boolean; // Проп для проверки прав редактирования
}

const TaskExecutors: React.FC<TaskExecutorProps> = ({ 
  task, 
  deskUsers, 
  deskId, 
  onTaskUpdate,
  canEdit = true // По умолчанию разрешено редактирование
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const loadingRef = useRef(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Получаем текущих исполнителей задачи с защитой от null
  const executors = task?.executors || [];
  
  // ИЗМЕНЕНО: Проверка, может ли пользователь управлять исполнителями
  // MEMBER не может добавлять/удалять исполнителей, даже если он исполнитель сам
  const actualCanEdit = canEdit && canManageExecutors(deskUsers, task);
  
  // Закрываем dropdown при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Добавляем исполнителя
  const handleAddExecutor = useCallback((username: string, e: React.MouseEvent) => {
    console.log('[TaskExecutors] Попытка добавить:', username);
    e.stopPropagation();
    if (!actualCanEdit) {
      console.log('[TaskExecutors] Нет прав на добавление.');
      return;
    }
    onTaskUpdate({ executorUsernames: [username] });
  }, [actualCanEdit, onTaskUpdate]);

  // Удаляем исполнителя
  const handleRemoveExecutor = useCallback((username: string, e: React.MouseEvent) => {
    console.log('[TaskExecutors] Попытка удалить:', username);
    e.stopPropagation();
    if (!actualCanEdit) {
      console.log('[TaskExecutors] Нет прав на удаление.');
      return;
    }
    onTaskUpdate({ removeExecutorUsernames: [username] });
  }, [actualCanEdit, onTaskUpdate]);

  // Получить инициалы пользователя для аватарки
  const getUserInitials = (username: string) => {
    return username.substring(0, 1).toUpperCase();
  };

  // Определяем цвет обводки в зависимости от роли пользователя
  const getBorderColor = (username: string) => {
    const user = deskUsers.find(u => u.username === username || u.userName === username);
    if (!user) return 'border-gray-300';
    const userRole = user.rightType || user.role;
    switch(userRole) {
      case 'CREATOR':
        return 'border-red-500'; // Красный для CREATOR
      case 'MEMBER':
        return 'border-green-500'; // Зеленый для MEMBER
      case 'CONTRIBUTOR':
        return 'border-yellow-400'; // Желтый для CONTRIBUTOR
    }
    
    return 'border-gray-300'; // Дефолтный цвет, если роль не определена
  };

  // Функция для открытия/закрытия выпадающего списка
  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Проверяем права доступа перед открытием списка
    if (!actualCanEdit) return;
    
    setIsOpen(!isOpen);
  };
  
  // Если задача не определена, возвращаем просто иконку
  if (!task) {
    return (
      <div className="flex items-center text-gray-400">
        <PiUserCircleThin size={20} />
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Фиксированная ширина контейнера для исполнителей */}
      <div 
        className={`inline-flex items-center ${actualCanEdit ? 'cursor-pointer' : 'cursor-default'}`} 
        onClick={toggleDropdown}
        data-interactive-control="true" // Помечаем как интерактивный
      >
        {executors.length > 0 ? (
          // Отображаем только аватарки исполнителей без крестиков
          <div className="flex -space-x-1">
            {executors.map((executor, index) => (
              <div
                key={executor}
                className="relative"
                title={executor}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium text-gray-700 border border-solid ${getBorderColor(executor)} bg-white`}
                >
                  {getUserInitials(executor)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Если исполнителей нет, показываем только иконку пользователя
          <div className={`flex items-center text-gray-400 ${!actualCanEdit && 'opacity-50'}`}>
            <PiUserCircleThin size={20} />
          </div>
        )}
      </div>
      
      {/* Выпадающий список исполнителей - только если пользователь может редактировать */}
      {isOpen && actualCanEdit && (
        <div
          className="absolute z-10 mt-1 w-44 bg-white rounded-md shadow-lg border border-gray-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-2 text-sm text-gray-700 border-b border-gray-200">
            Исполнители:
          </div>
          
          {/* Список исполнителей с крестиками для удаления */}
          <div className="p-2">
            {executors.length === 0 ? (
              <div className="py-1 px-2 text-sm text-gray-500">
                Не назначен
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {executors.map((executor: string) => (
                  <div key={executor} className="flex items-center justify-between px-2 py-1">
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium text-gray-700 border border-solid ${getBorderColor(executor)} bg-white mr-2 shrink-0`}>
                        {getUserInitials(executor)}
                      </div>
                      <span className="text-sm truncate" title={executor}>{executor}</span>
                      {isCurrentUser(executor) && <span className="ml-1 text-gray-400 text-xs">(Вы)</span>}
                    </div>
                    <button 
                      className="ml-2 text-gray-400 hover:text-red-500 cursor-pointer p-1"
                      onClick={(e) => handleRemoveExecutor(executor, e)}
                    >
                      <span className="text-sm font-bold">×</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Разделитель */}
          <div className="border-t border-gray-200 my-1"></div>

          {/* Доступные пользователи доски */}
          <div className="p-2 max-h-48 overflow-y-auto">
            {!deskUsers || deskUsers.length === 0 ? (
              <div className="py-1 px-2 text-sm text-gray-500">
                Нет доступных пользователей
              </div>
            ) : (
              deskUsers
                .filter(user => {
                  // Убедимся, что user и username существуют
                  const username = user?.username || user?.userName;
                  return username && !executors.includes(username);
                 })
                .map(user => {
                  const username = user.username || user.userName; // Гарантируем наличие username
                  return (
                    <div
                      key={username}
                      className="flex items-center py-1 px-2 hover:bg-gray-100 rounded cursor-pointer"
                      onClick={(e) => handleAddExecutor(username, e)}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium text-gray-700 border border-solid ${getBorderColor(username)} bg-white mr-2 shrink-0`}>
                        {getUserInitials(username)}
                      </div>
                      <span className="text-sm truncate" title={username}>{username}</span>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskExecutors;
