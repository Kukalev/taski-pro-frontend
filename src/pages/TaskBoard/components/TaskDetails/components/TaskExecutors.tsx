import React, { useState, useRef, useEffect } from 'react';
import { PiUserCircleThin } from 'react-icons/pi';
import { updateTask } from '../../../../../services/task/Task';
import { AuthService } from '../../../../../services/auth/Auth';
import { isCurrentUser, canManageExecutors } from '../../../../../utils/permissionUtils';

interface TaskExecutorsProps {
  executors: string[];
  deskUsers: any[];
  taskId: number;
  deskId: number;
  onTaskUpdate: (task: any) => void;
  canEdit?: boolean;
}

const TaskExecutors: React.FC<TaskExecutorsProps> = ({ 
  executors, 
  deskUsers, 
  taskId, 
  deskId, 
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
  const handleAddExecutor = async (username: string) => {
    if (!actualCanEdit) return;
    
    try {
      const updatedTask = await updateTask(deskId, taskId, {
        executorUsernames: [username]
      });
      
      if (updatedTask) {
        onTaskUpdate(updatedTask);
      }
    } catch (error) {
      console.error('Ошибка при добавлении исполнителя:', error);
    }
  };
  
  // Удаление исполнителя
  const handleRemoveExecutor = async (username: string) => {
    if (!actualCanEdit) return;
    
    try {
      const updatedTask = await updateTask(deskId, taskId, {
        removeExecutorUsernames: [username]
      });
      
      if (updatedTask) {
        onTaskUpdate(updatedTask);
      }
    } catch (error) {
      console.error('Ошибка при удалении исполнителя:', error);
    }
  };
  
  // Получаем первую букву имени пользователя
  const getUserInitial = (username: string) => {
    return username.charAt(0).toUpperCase();
  };
  
  // Определяем цвет для аватарки на основе роли
  const getAvatarColor = (username: string) => {
    const user = deskUsers.find(u => u.username === username || u.userName === username);
    if (!user) return 'border-gray-300';
    
    const role = user.rightType || user.role || '';
    
    switch(role) {
      case 'CREATOR':
        return 'border-red-500';
      case 'MEMBER':
        return 'border-green-500';
      case 'CONTRIBUTOR':
        return 'border-yellow-400';
      default:
        return 'border-gray-300';
    }
  };
  
  return (
    <div className="flex items-center py-2 border-b border-gray-100 relative" ref={dropdownRef}>
      <div className="w-6 flex justify-center text-gray-400">
        <PiUserCircleThin size={22} />
      </div>
      
      <div className="flex items-center ml-4 w-full">
        <span className="text-gray-500 mr-2">Исполнители:</span>
        
        <div 
          className={`flex items-center ${actualCanEdit ? 'cursor-pointer' : 'cursor-default'}`} 
          onClick={() => actualCanEdit && setIsDropdownOpen(!isDropdownOpen)}
        >
          {executors && executors.length > 0 ? (
            <div className="flex -space-x-2">
              {executors.map(username => (
                <div 
                  key={username}
                  className={`w-6 h-6 rounded-full border flex items-center justify-center font-medium ${getAvatarColor(username)} bg-white text-gray-800`}
                >
                  {getUserInitial(username)}
                </div>
              ))}
            </div>
          ) : (
            <span className="text-gray-400">Назначить...</span>
          )}
        </div>
      </div>
      
      {isDropdownOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white rounded-md shadow-md z-10 w-56 border border-gray-200">
          <div className="px-3 py-2 border-b border-gray-100 text-gray-600 font-medium">
            Исполнители:
          </div>
          
          {/* Список текущих исполнителей */}
          <div className="p-2">
            {(!executors || executors.length === 0) ? (
              <div className="py-2 px-2 text-gray-500">
                Не назначен
              </div>
            ) : (
              executors.map(username => (
                <div key={username} className="flex items-center justify-between py-1 px-2">
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center font-medium mr-2 ${getAvatarColor(username)} bg-white text-gray-800`}>
                      {getUserInitial(username)}
                    </div>
                    <span>{username} {isCurrentUser(username) && <span className="text-gray-400 text-xs">(Вы)</span>}</span>
                  </div>
                  {actualCanEdit && (
                    <span 
                      className="text-gray-400 hover:text-gray-600 cursor-pointer text-xl"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveExecutor(username);
                      }}
                    >
                      ×
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
          
          {/* Список доступных пользователей */}
          {actualCanEdit && (
            <div className="border-t border-gray-100 p-2">
              {deskUsers
                .filter(user => {
                  const username = user.username || user.userName;
                  return !executors.includes(username);
                })
                .map(user => {
                  const username = user.username || user.userName;
                  return (
                    <div 
                      key={username}
                      className="flex items-center py-2 px-2 hover:bg-gray-50 rounded cursor-pointer"
                      onClick={() => handleAddExecutor(username)}
                    >
                      <div className={`w-6 h-6 rounded-full border flex items-center justify-center font-medium mr-2 ${getAvatarColor(username)} bg-white text-gray-800`}>
                        {getUserInitial(username)}
                      </div>
                      <span>{username}</span>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskExecutors;
