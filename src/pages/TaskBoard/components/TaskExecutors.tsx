import React, {useEffect, useRef, useState, useCallback} from 'react'
import { PiUserCircleThin } from 'react-icons/pi' // <--- Убедимся, что иконка импортирована
import {UserService} from '../../../services/users/Users'
import {canEditTask, canManageExecutors, getUserRoleOnDesk, UserRightType, isCurrentUser} from '../../../utils/permissionUtils'
import { TaskExecutorProps } from '../types' // Используем импортированный тип
import { UserAvatar } from '../../../components/header/components/UserAvatar' // <--- Импортируем UserAvatar

// Кэш для пользователей, чтобы не загружать их много раз
const usersCache = new Map<number, any[]>();

// Убираем локальный интерфейс, используем импортированный TaskExecutorProps
// interface TaskExecutorProps { ... }

const TaskExecutors: React.FC<TaskExecutorProps> = ({ // Используем импортированный TaskExecutorProps
  task,
  deskUsers,
  deskId,
  avatarsMap, // <--- Получаем проп
  onTaskUpdate,
  canEdit = true
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

  // Функция для открытия/закрытия выпадающего списка
  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Проверяем права доступа перед открытием списка
    if (!actualCanEdit) return;
    
    setIsOpen(!isOpen);
  };
  
  // Определяем цвет обводки в зависимости от роли пользователя
  const getBorderColor = (username: string) => {
    const user = deskUsers.find(u => u.username === username || u.userName === username);
    if (!user) return 'border-gray-300'; // Серый по умолчанию
    const userRole = user.rightType || user.role;
    switch(userRole) {
      case 'CREATOR': return 'border-red-500';
      case 'MEMBER': return 'border-green-500';
      case 'CONTRIBUTOR': return 'border-yellow-400';
      default: return 'border-gray-300';
    }
  };

  // Определяем примерную высоту UserAvatar xs + border (1px * 2)
  // Допустим, xs = 20px, итого 22px. Возьмем min-h-6 (24px) для запаса.
  const avatarDisplayHeightClass = "min-h-6"; // Tailwind class for min-height: 1.5rem (24px)

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
      {/* Контейнер для исполнителей */}
      <div
        className={`inline-flex items-center ${avatarDisplayHeightClass} ${actualCanEdit ? 'cursor-pointer' : 'cursor-default'}`}
        onClick={toggleDropdown}
        data-interactive-control="true"
      >
        {executors.length > 0 ? (
          <div className="flex -space-x-2">
            {executors.map((executorUsername: string) => (
              <div
                key={executorUsername}
                className={`relative border rounded-full ${getBorderColor(executorUsername)} flex items-center justify-center`}
                title={executorUsername}
              >
                <UserAvatar
                    username={executorUsername}
                    avatarUrl={avatarsMap[executorUsername] || null}
                    size="xs"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className={`flex items-center text-gray-400 ${!actualCanEdit && 'opacity-50'}`}>
             <PiUserCircleThin size={20} />
          </div>
        )}
      </div>
      
      {/* Выпадающий список исполнителей - только если пользователь может редактировать */}
      {isOpen && actualCanEdit && (
        <div
          className="absolute z-10 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200"
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
                {executors.map((executorUsername: string) => (
                  <div key={executorUsername} className="flex items-center justify-between px-2 py-1">
                    <div className="flex items-center overflow-hidden mr-1">
                      <div className={`border-2 rounded-full ${getBorderColor(executorUsername)} mr-2 shrink-0`}>
                        <UserAvatar
                            username={executorUsername}
                            avatarUrl={avatarsMap[executorUsername] || null}
                            size="xs"
                        />
                      </div>
                      <span className="text-sm truncate" title={executorUsername}>{executorUsername}</span>
                      {isCurrentUser(executorUsername) && <span className="ml-1 text-gray-400 text-xs">(Вы)</span>}
                    </div>
                    <button 
                      className="ml-1 text-gray-400 hover:text-red-500 cursor-pointer p-1 shrink-0"
                      onClick={(e) => handleRemoveExecutor(executorUsername, e)}
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
                      <div className={`border-2 rounded-full ${getBorderColor(username)} mr-2 shrink-0`}>
                        <UserAvatar
                            username={username}
                            avatarUrl={avatarsMap[username] || null}
                            size="xs"
                        />
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
