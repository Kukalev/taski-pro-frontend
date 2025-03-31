import React, { useState, useEffect } from 'react';
import { DeskData } from '../../../components/sidebar/types/sidebar.types';
import { UserService } from '../../../services/users/Users';
import { UsersOnDeskResponseDto } from '../../../services/users/types/types';
import AddUserModal from './AddUserModal';

interface DeskParticipantsProps {
  desk: DeskData;
}

const DeskParticipants: React.FC<DeskParticipantsProps> = ({ desk }) => {
  const [participants, setParticipants] = useState<UsersOnDeskResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const loadParticipants = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const users = await UserService.getUsersOnDesk(desk.id);
      setParticipants(users);
    } catch (error: any) {
      console.error('Ошибка при загрузке участников:', error);
      setError(error.message || 'Не удалось загрузить участников');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadParticipants();
  }, [desk.id]);
  
  // Функция для получения отображаемого имени роли
  const getRoleDisplayName = (rightType: string) => {
    switch (rightType) {
      case 'CREATOR':
        return 'Редактирование';
      case 'CONTRIBUTOR':
        return 'Комментирование';
      case 'MEMBER':
        return 'Чтение';
      default:
        return 'Участник';
    }
  };
  
  // Получение инициалов пользователя (из username)
  const getUserInitials = (username: string) => {
    if (!username) return '?';
    
    // Получаем первые буквы из username
    // Если username содержит разделитель (пробел, точка, подчеркивание), 
    // берем первые буквы частей, иначе первую букву
    const parts = username.split(/[\s._-]/);
    if (parts.length > 1) {
      return parts.slice(0, 2)
        .map(part => part.charAt(0).toUpperCase())
        .join('');
    }
    
    return username.charAt(0).toUpperCase();
  };
  
  // Определение класса бейджа в зависимости от роли
  const getRoleBadgeClass = (rightType: string) => {
    switch (rightType) {
      case 'CREATOR':
        return 'bg-orange-100 text-orange-800';
      case 'CONTRIBUTOR':
        return 'bg-blue-100 text-blue-800';
      case 'MEMBER':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className='w-full mb-6'>
      <div className='flex justify-between items-center mb-2'>
        <h3 className='text-lg font-medium'>Участники</h3>
        <button 
          className='text-gray-400 text-sm font-medium bg-gray-50 rounded-full px-4 py-1.5 transition-colors hover:bg-gray-100 hover:cursor-pointer'
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
        ) : participants.length > 0 ? (
          <div className='space-y-3'>
            {participants.map((user) => (
              <div key={user.id} className='flex items-center justify-between'>
                <div className='flex items-center'>
                  <div className='w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center text-purple-600 mr-3'>
                    {getUserInitials(user.username)}
                  </div>
                  <div>
                    <div className='font-medium'>{user.username}</div>
                  </div>
                </div>
                
                <div>
                  <div 
                    className={`px-3 py-1 rounded-full text-xs ${getRoleBadgeClass(user.rightType)}`}
                  >
                    {getRoleDisplayName(user.rightType)}
                  </div>
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
      
      <AddUserModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        deskId={desk.id}
        onUserAdded={loadParticipants}
      />
    </div>
  );
};

export default DeskParticipants;
