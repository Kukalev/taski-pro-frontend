import React, {useCallback, useEffect, useState} from 'react' // Добавляем useCallback
import {UserService} from '../../../../services/users/Users'
import AddUserModal from '../AddUserModal/AddUserModal'
import {DeskParticipantsProps, UserOnDesk} from './types'
import LoadingState from './components/LoadingState'
import ErrorState from './components/ErrorState'
import EmptyState from './components/EmptyState'
import ParticipantsList from './components/ParticipantsList'
import {
  canManageParticipants,
  getUserRoleOnDesk
} from '../../../../utils/permissionUtils'
import {
  RightType,
  updateUserRightsOnDesk
} from '../../../../services/users/api/UpdateUserFromDesk'
import {
  deleteUserFromDesk
} from '../../../../services/users/api/DeleteUserFromDesk'
import {
  DeleteUserModal
} from '../../../../components/modals/deleteUserModal/DeleteUserModal'
import {getUserName} from './utilities'

const DeskParticipants: React.FC<DeskParticipantsProps> = ({ desk, hasEditPermission = true }) => {
  const [participants, setParticipants] = useState<UserOnDesk[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState(false); // Для блокировки кнопок во время запроса

  // Состояние для модального окна удаления пользователя
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserOnDesk | null>(null);

  // Загрузка участников (используем useCallback)
  const loadParticipants = useCallback(async () => {
    if (!desk?.id) return;

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
  }, [desk?.id]); // Зависимость от ID доски

  // Загрузка при монтировании или смене доски
  useEffect(() => {
    loadParticipants();
  }, [loadParticipants]);

  // Получаем роль текущего пользователя (обновляется при изменении participants)
  const currentUserRole = getUserRoleOnDesk(participants);

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

  // Удаление пользователя с доски (обновляем локально)
  const handleDeleteUser = async (userId: number) => {
    if (!desk?.id) {
      setError('Ошибка: ID доски не определен');
      return Promise.reject(new Error('Desk ID not defined'));
    }

    setActionInProgress(true);
    setError(null);

    try {
      await deleteUserFromDesk(desk.id, userId);
      // Обновляем локальное состояние
      setParticipants(prevParticipants =>
        prevParticipants.filter(p => p.id !== userId)
      );
      console.log('Пользователь удален локально и с сервера');
      setDeleteModalOpen(false);
      setSelectedUser(null);
      return Promise.resolve();
    } catch (error) {
      console.error('Ошибка при удалении пользователя:', error);
      setError('Не удалось удалить пользователя');
      return Promise.reject(error);
    } finally {
      setActionInProgress(false);
    }
  };

  // Обновление роли пользователя (оптимистичное обновление)
  const handleUpdateUserRole = async (userId: number, rightType: RightType) => {
    if (!desk?.id) {
      setError('Ошибка: ID доски не определен');
      return;
    }

    const originalParticipants = [...participants]; // Сохраняем для отката

    // Оптимистично обновляем UI
    setParticipants(prevParticipants =>
      prevParticipants.map(p =>
        p.id === userId ? { ...p, rightType: rightType } : p
      )
    );

    setActionInProgress(true);
    setError(null);

    try {
      await updateUserRightsOnDesk(desk.id, { userId, rightType });
      console.log('Роль пользователя обновлена на сервере');
      // Ничего больше не делаем, UI уже обновлен
    } catch (error) {
      console.error('Ошибка при обновлении роли пользователя:', error);
      setError('Не удалось обновить роль пользователя');
      // Откатываем изменения UI при ошибке
      setParticipants(originalParticipants);
    } finally {
      setActionInProgress(false);
    }
  };

  // Обработчик для AddUserModal, вызывающий перезагрузку списка
  const handleUserAdded = useCallback(() => {
    loadParticipants();
  }, [loadParticipants]); // Используем useCallback

  // Обработчик закрытия модального окна удаления
  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedUser(null); // Сбрасываем выбранного пользователя
  };

  return (
    <div className='w-full mb-6'>
      <div className='flex justify-between items-center mb-2'>
        <h3 className='text-lg font-medium'>Участники</h3>
        {hasManagePermission && (
          <button
            className='text-sm bg-gray-50 rounded-full px-4 py-1.5 hover:bg-gray-100 cursor-pointer'
            onClick={() => setIsModalOpen(true)}
            disabled={actionInProgress} // Блокируем во время запросов
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
            onDeleteUser={openDeleteModal} // Передаем функцию открытия модалки
            onUpdateUserRole={handleUpdateUserRole} // Передаем функцию обновления
            currentUserRole={currentUserRole}
          />
        ) : (
          <EmptyState />
        )}
      </div>

      {/* Модальное окно добавления */}
      {desk && desk.id && hasManagePermission && (
        <AddUserModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          deskId={desk.id}
          onUserAdded={handleUserAdded} // Используем новый обработчик
        />
      )}

      {/* Модальное окно удаления */}
      {selectedUser && (
        <DeleteUserModal
          isOpen={deleteModalOpen}
          userId={selectedUser.id}
          userName={getUserName(selectedUser)}
          deskId={desk?.id || null}
          onClose={handleCloseDeleteModal} // Используем обработчик закрытия
          onConfirm={handleDeleteUser} // Передаем обновленный handleDeleteUser
          isLoading={actionInProgress} // Передаем состояние загрузки
        />
      )}
    </div>
  );
};

export default DeskParticipants;