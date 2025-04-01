import React, {useEffect, useState} from 'react'
import {UserService} from '../../../services/users/Users'
import AddUserModal from './AddUserModal'

// Простой интерфейс для пользователя на доске
interface UserOnDesk {
  id: number;
  userName: string; 
  rightType: string;
}

const DeskParticipants = ({ desk }) => {
  const [participants, setParticipants] = useState<UserOnDesk[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const loadParticipants = async () => {
    if (!desk || !desk.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Загрузка участников для доски ID:', desk.id);
      const users = await UserService.getUsersOnDesk(desk.id);
      console.log('Полученные участники:', users);
      
      // Сортируем пользователей - создатель в начале списка
      const sortedUsers = [...users].sort((a, b) => {
        if (a.rightType === 'CREATOR' && b.rightType !== 'CREATOR') return -1;
        if (a.rightType !== 'CREATOR' && b.rightType === 'CREATOR') return 1;
        return 0;
      });
      
      setParticipants(sortedUsers);
    } catch (error) {
      console.error('Ошибка при загрузке участников:', error);
      setError('Не удалось загрузить участников');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (desk?.id) {
      loadParticipants();
    }
  }, [desk?.id]);
  
  // Функция для получения отображаемого имени роли
  const getRoleDisplayName = (rightType: string) => {
    switch (rightType) {
      case 'CREATOR': return 'Создатель';
      case 'CONTRIBUTOR': return 'Редактирование';
      case 'MEMBER': return 'Чтение';
      default: return 'Участник';
    }
  };
  
  // Функция для определения цвета бейджа роли
  const getRoleBadgeClass = (rightType: string) => {
    switch (rightType) {
      case 'CREATOR': return 'bg-red-100 text-red-800'; // Красный для создателя
      case 'CONTRIBUTOR': return 'bg-blue-100 text-blue-800';
      case 'MEMBER': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className='w-full mb-6'>
      <div className='flex justify-between items-center mb-2'>
        <h3 className='text-lg font-medium'>Участники</h3>
        <button 
          className='text-sm bg-gray-50 rounded-full px-4 py-1.5 hover:bg-gray-100'
          onClick={() => setIsModalOpen(true)}
        >
          Добавить участников
        </button>
      </div>
      
      <div className='bg-white rounded-lg p-4'>
        {isLoading ? (
          <div className='text-center py-4'>
            <div className='animate-spin h-6 w-6 border-2 border-blue-500 rounded-full border-t-transparent mx-auto'></div>
            <div className='mt-2 text-sm text-gray-500'>Загрузка участников...</div>
          </div>
        ) : error ? (
          <div className='text-center py-4 text-red-500'>{error}</div>
        ) : participants && participants.length > 0 ? (
          <div className='space-y-3'>
            {participants.map((user) => (
              <div key={user.id} className='flex items-center justify-between p-2 hover:bg-gray-50 rounded'>
                <div className='flex items-center'>
                  <div className='w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center text-purple-600 mr-3'>
                    {user.userName ? user.userName.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div className='font-medium'>{user.userName || 'Неизвестный пользователь'}</div>
                </div>
                
                <div className={`px-3 py-1 rounded-full text-xs ${getRoleBadgeClass(user.rightType || '')}`}>
                  {getRoleDisplayName(user.rightType || '')}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='text-center py-4 text-gray-500'>
            В этой доске пока нет участников
          </div>
        )}
      </div>
      
      {desk && desk.id && (
        <AddUserModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          deskId={desk.id}
          onUserAdded={loadParticipants}
        />
      )}
    </div>
  );
};

export default DeskParticipants;
