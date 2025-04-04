import React, {useEffect, useRef, useState} from 'react'
import {ParticipantItemProps} from '../types'
import {
  getRoleBadgeClass,
  getRoleDisplayName,
  getUserInitials,
  getUserName
} from '../utilities'
import {GrEdit} from 'react-icons/gr'
import {FaTimes} from 'react-icons/fa'
import {RightType} from '../../../../../services/users/api/UpdateUserFromDesk'
import {isCurrentUser} from '../../../../../utils/permissionUtils'

const ParticipantItem: React.FC<ParticipantItemProps> = ({ 
  user, 
  onDeleteUser, 
  onUpdateUserRole, 
  currentUserRole 
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Проверяем, является ли текущий участник создателем
  const isCreator = user.rightType === 'CREATOR';
  
  // Проверяем, является ли это текущий пользователь
  const isCurrentUserItem = isCurrentUser(getUserName(user));
  
  // Проверяем, может ли текущий пользователь редактировать/удалять этого участника
  const canModify = currentUserRole === 'CREATOR' || (currentUserRole === 'CONTRIBUTOR' && user.rightType === 'MEMBER');
  
  // Закрытие меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowRoleMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Обработчик изменения роли
  const handleRoleChange = (rightType: RightType) => {
    if (user.rightType === rightType) {
      setShowRoleMenu(false);
      return; // Не делаем запрос, если роль не меняется
    }
    onUpdateUserRole(user.id, rightType);
    setShowRoleMenu(false);
  };
  
  // Получаем цвет бейджа текущей роли для использования в заголовке меню
  const getBadgeColorForMenu = () => {
    if (user.rightType === 'CONTRIBUTOR') {
      return 'bg-blue-100 text-blue-800';
    }
    return 'bg-green-100 text-green-800'; // MEMBER
  };
  
  return (
    <div className='flex items-center justify-between p-2 hover:bg-gray-50 rounded'>
      <div className='flex items-center'>
        <div className='w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center text-purple-600 mr-3'>
          {getUserInitials(user)}
        </div>
        <div className='font-medium'>
          {getUserName(user)}
          {isCurrentUserItem && <span className="ml-1 text-gray-400 text-xs">(Вы)</span>}
        </div>
      </div>
      
      <div className='flex items-center'>
        <div className={`px-3 py-1 rounded-full text-xs ${getRoleBadgeClass(user.rightType || '')}`}>
          {getRoleDisplayName(user.rightType || '')}
        </div>
        
        {/* Кнопки управления - показываем только если пользователь не создатель и текущий пользователь может управлять */}
        {canModify && !isCreator && (
          <div className="flex ml-2">
            {/* Кнопка редактирования */}
            <div className="relative" ref={menuRef}>
              <button 
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 cursor-pointer"
                onClick={() => setShowRoleMenu(!showRoleMenu)}
              >
                <GrEdit size={14} />
              </button>
              
              {/* Выпадающее меню с ролями - фиксированная ширина и позиционирование */}
              {showRoleMenu && (
                <div 
                  className="fixed mt-1 z-50 bg-white rounded-md shadow-lg border border-gray-200 w-56 overflow-hidden" 
                  style={{
                    top: menuRef.current ? menuRef.current.getBoundingClientRect().bottom + 5 : 0,
                    right: menuRef.current ? window.innerWidth - menuRef.current.getBoundingClientRect().right : 0
                  }}
                >
                  <div className="border-b border-gray-100">
                    <div className="px-4 py-2 text-sm font-medium text-gray-700">
                      Изменить роль
                    </div>
                  </div>
                  
                  <div className="py-1">
                    {/* Опция MEMBER (Чтение) */}
                    <button 
                      className={`w-full text-left px-4 py-2.5 cursor-pointer ${
                        user.rightType === 'MEMBER' 
                          ? 'bg-green-100 text-green-700 font-medium' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => handleRoleChange(RightType.MEMBER)}
                    >
                      <div className="flex items-center">
                        <span className={`inline-block w-2 h-2 rounded-full ${
                          user.rightType === 'MEMBER' ? 'bg-green-500' : 'bg-gray-300'
                        } mr-2`}></span>
                        Чтение
                      </div>
                    </button>
                    
                    {/* Опция CONTRIBUTOR (Редактирование) */}
                    <button 
                      className={`w-full text-left px-4 py-2.5 cursor-pointer ${
                        user.rightType === 'CONTRIBUTOR' 
                          ? 'bg-blue-50 text-blue-700 font-medium' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => handleRoleChange(RightType.CONTRIBUTOR)}
                    >
                      <div className="flex items-center">
                        <span className={`inline-block w-2 h-2 rounded-full ${
                          user.rightType === 'CONTRIBUTOR' ? 'bg-blue-500' : 'bg-gray-300'
                        } mr-2`}></span>
                        Редактирование
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Кнопка удаления */}
            <button 
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 ml-1 cursor-pointer"
              onClick={() => onDeleteUser(user.id)}
            >
              <FaTimes size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantItem;
