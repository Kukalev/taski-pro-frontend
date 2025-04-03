import React, { useEffect, useState } from 'react';
import { UserService } from '../../../../services/users/Users';
import AddUserModal from '../AddUserModal/AddUserModal';
import { DeskParticipantsProps, UserOnDesk } from './types';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';
import EmptyState from './components/EmptyState';
import ParticipantsList from './components/ParticipantsList';
import { canManageParticipants } from '../../../../utils/permissionUtils';

const DeskParticipants: React.FC<DeskParticipantsProps> = ({ desk }) => {
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

  // Проверка прав на управление участниками
  const hasManagePermission = canManageParticipants(participants);

  return (
    <div className='w-full mb-6'>
      <div className='flex justify-between items-center mb-2'>
        <h3 className='text-lg font-medium'>Участники</h3>
        {/* Показываем кнопку добавления только пользователям с правами управления */}
        {hasManagePermission && (
          <button 
            className='text-sm bg-gray-50 rounded-full px-4 py-1.5 hover:bg-gray-100'
            onClick={() => setIsModalOpen(true)}
          >
            Добавить участников
          </button>
        )}
      </div>
      
      <div className='bg-white rounded-lg p-4'>
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState error={error} />
        ) : participants && participants.length > 0 ? (
          <ParticipantsList participants={participants} />
        ) : (
          <EmptyState />
        )}
      </div>
      
      {desk && desk.id && hasManagePermission && (
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
