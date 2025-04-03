import React, { useEffect, useState } from 'react';
import { UserService } from '../../../../services/users/Users';
import AddUserModal from '../AddUserModal/AddUserModal';
import { DeskParticipantsProps, UserOnDesk } from './types';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';
import EmptyState from './components/EmptyState';
import ParticipantsList from './components/ParticipantsList';
import { canManageParticipants, getUserRoleOnDesk } from '../../../../utils/permissionUtils';
import { updateUserRightsOnDesk, RightType } from '../../../../services/users/api/UpdateUserFromDesk';
import { deleteUserFromDesk } from '../../../../services/users/api/DeleteUserFromDesk';
import { DeleteUserModal } from '../../../../components/modals/deleteUserModal/DeleteUserModal';
import { getUserName } from './utilities';

const DeskParticipants: React.FC<DeskParticipantsProps> = ({ desk, hasEditPermission = true }) => {
  const [participants, setParticipants] = useState<UserOnDesk[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState(false);
  
  // Состояние для модального окна удаления пользователя
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserOnDesk | null>(null);
  
  // Получаем роль текущего пользователя
  const currentUserRole = getUserRoleOnDesk(participants);
  
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
  const hasManagePermission = canManageParticipants(participants) && hasEditPermission;
  
  // Открыть модальное окно удаления
  const openDeleteModal = (userId: number) => {
    const user = participants.find(p => p.id === userId);
    if (user) {
      setSelectedUser(user);
      setDeleteModalOpen(true);
    }
  };
  
  // Удаление пользователя с доски
  const handleDeleteUser = async (userId: number) => {
    if (!desk?.id) {
      setError('Ошибка: ID доски не определен');
      return;
    }
    
    setActionInProgress(true);
    
    try {
      await deleteUserFromDesk(desk.id, userId);
      // Обновляем список участников
      await loadParticipants();
      return Promise.resolve();
    } catch (error) {
      console.error('Ошибка при удалении пользователя:', error);
      setError('Не удалось удалить пользователя');
      return Promise.reject(error);
    } finally {
      setActionInProgress(false);
    }
  };
  
  // Обновление роли пользователя
  const handleUpdateUserRole = async (userId: number, rightType: RightType) => {
    if (!desk?.id) {
      setError('Ошибка: ID доски не определен');
      return;
    }
    
    setActionInProgress(true);
    
    try {
      await updateUserRightsOnDesk(desk.id, { userId, rightType });
      // Обновляем список участников
      await loadParticipants();
    } catch (error) {
      console.error('Ошибка при обновлении роли пользователя:', error);
      setError('Не удалось обновить роль пользователя');
    } finally {
      setActionInProgress(false);
    }
  };

  return (
    <div className='w-full mb-6'>
      <div className='flex justify-between items-center mb-2'>
        <h3 className='text-lg font-medium'>Участники</h3>
        {/* Показываем кнопку добавления только пользователям с правами управления */}
        {hasManagePermission && (
          <button 
            className='text-sm bg-gray-50 rounded-full px-4 py-1.5 hover:bg-gray-100'
            onClick={() => setIsModalOpen(true)}
            disabled={actionInProgress}
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
          <ParticipantsList 
            participants={participants} 
            onDeleteUser={openDeleteModal}
            onUpdateUserRole={handleUpdateUserRole}
            currentUserRole={currentUserRole}
          />
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
      
      {/* Модальное окно удаления пользователя */}
      {selectedUser && (
        <DeleteUserModal
          isOpen={deleteModalOpen}
          userId={selectedUser.id}
          userName={getUserName(selectedUser)}
          deskId={desk?.id || null}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleDeleteUser}
          isLoading={actionInProgress}
        />
      )}
    </div>
  );
};

export default DeskParticipants;
