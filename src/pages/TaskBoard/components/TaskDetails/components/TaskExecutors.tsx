import React, {useEffect, useRef, useState, useCallback} from 'react'
import { Task } from '../../../../../services/task/types/task.types';
import {
  canManageExecutors,
  isCurrentUser
} from '../../../../../utils/permissionUtils'
import {
  UserAvatar
} from '../../../../../components/header/components/UserAvatar'
import {FaRegUser} from 'react-icons/fa6'
import { UserOnDesk } from '../../../../../pages/DeskOverview/components/DeskParticipants/types';
import { BatchAvatarResponse } from '../../../../../services/Avatar/type';

interface TaskExecutorsProps {
  executors: string[];
  deskUsers: UserOnDesk[];
  taskId: number;
  deskId: number;
  avatarsMap: BatchAvatarResponse;
  onTaskUpdate: (updates: { executorUsernames?: string[]; removeExecutorUsernames?: string[] }) => void;
  canEdit?: boolean;
}

const TaskExecutors: React.FC<TaskExecutorsProps> = ({ 
  executors = [], 
  deskUsers, 
  taskId, 
  deskId, 
  avatarsMap,
  onTaskUpdate,
  canEdit = true
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Проверка может ли пользователь управлять исполнителями (MEMBER не может)
  const actualCanEdit = canEdit && canManageExecutors(deskUsers, {taskId, executors});
  
  // Закрытие выпадающего списка при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Добавление исполнителя
  const handleAddExecutor = useCallback((username: string) => {
    if (!actualCanEdit || !onTaskUpdate) return;
    console.log('[TaskExecutors Details] Запрос на добавление:', username);
    onTaskUpdate({ executorUsernames: [username] });
    setIsDropdownOpen(false);
  }, [actualCanEdit, onTaskUpdate]);
  
  // Удаление исполнителя
  const handleRemoveExecutor = useCallback((username: string) => {
    if (!actualCanEdit || !onTaskUpdate) return;
    console.log('[TaskExecutors Details] Запрос на удаление:', username);
    onTaskUpdate({ removeExecutorUsernames: [username] });
  }, [actualCanEdit, onTaskUpdate]);
  
  // Функция цвета рамки (убедись, что она здесь есть)
  const getAvatarBorderColor = (username: string) => {
    const user = deskUsers.find(u => u.username === username || u.userName === username);
    if (!user) return 'border-gray-300';
    const role = user.rightType || user.role || '';
    switch(role) {
      case 'CREATOR': return 'border-red-500';
      case 'MEMBER': return 'border-green-500';
      case 'CONTRIBUTOR': return 'border-yellow-400';
      default: return 'border-gray-300';
    }
  };
  
  return (
    <div className="flex items-center py-2 border-b border-gray-100 relative" ref={dropdownRef}>
      <div className="w-6 flex justify-center text-gray-400">
        <FaRegUser className='w-5 h-5'/>
      </div>
      
      <div className="flex items-center ml-4 w-full">
        <span className="text-gray-500 mr-2">Исполнители:</span>
        
        <div 
          className={`flex items-center ${actualCanEdit ? 'cursor-pointer' : 'cursor-default'}`} 
          onClick={() => actualCanEdit && setIsDropdownOpen(!isDropdownOpen)}
        >
          {executors.length > 0 ? (
            <div className="flex -space-x-2">
              {executors.map(username => (
                <div
                  key={username}
                  title={username}
                  className={`border-2 rounded-full ${getAvatarBorderColor(username)}`}
                >
                  <UserAvatar
                    username={username}
                    avatarUrl={avatarsMap[username] || null}
                    size="xs"
                  />
                </div>
              ))}
            </div>
          ) : (
            <span className="text-gray-400">Назначить...</span>
          )}
        </div>
      </div>
      
      {isDropdownOpen && actualCanEdit && (
        <div className="absolute top-full left-0 mt-1 bg-white rounded-md shadow-md z-10 w-56 border border-gray-200 max-h-60 overflow-y-auto">
          <div className="px-3 py-2 border-b border-gray-100 text-gray-600 font-medium sticky top-0 bg-white">Исполнители:</div>
          
          {/* Список текущих исполнителей */}
          <div className="p-2">
            {(!executors || executors.length === 0) ? (
              <div className="py-2 px-2 text-gray-500">
                Не назначен
              </div>
            ) : (
              executors.map(username => (
                <div key={username} className="flex items-center justify-between py-1 px-2">
                  <div className="flex items-center overflow-hidden mr-1">
                    <div className={`border-2 rounded-full ${getAvatarBorderColor(username)} mr-2 shrink-0`}>
                      <UserAvatar
                        username={username}
                        avatarUrl={avatarsMap[username] || null}
                        size="xs"
                      />
                    </div>
                    <span className="text-sm truncate" title={username}>{username} {isCurrentUser(username) && <span className="text-gray-400 text-xs">(Вы)</span>}</span>
                  </div>
                  <span 
                    className="ml-1 text-gray-400 hover:text-red-500 cursor-pointer text-xl shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveExecutor(username);
                    }}
                  >
                    ×
                  </span>
                </div>
              ))
            )}
          </div>
          
          {/* Список доступных пользователей */}
          <div className="border-t border-gray-100 p-2">
            {deskUsers
              .filter(user => {
                const username = user.username || user.userName;
                return username && !executors.includes(username);
              })
              .map(user => {
                const username = user.username || user.userName;
                return (
                  <div 
                    key={username}
                    className="flex items-center py-2 px-2 hover:bg-gray-50 rounded cursor-pointer"
                    onClick={() => handleAddExecutor(username)}
                  >
                    <div className={`border-2 rounded-full ${getAvatarBorderColor(username)} mr-2 shrink-0`}>
                      <UserAvatar
                        username={username}
                        avatarUrl={avatarsMap[username] || null}
                        size="xs"
                      />
                    </div>
                    <span className="text-sm truncate" title={username}>{username}</span>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskExecutors;
