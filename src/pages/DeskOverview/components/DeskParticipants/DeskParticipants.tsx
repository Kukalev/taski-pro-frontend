import React, {useCallback, useEffect, useState} from 'react'
import AddUserModal from '../AddUserModal/AddUserModal'
import {DeskParticipantsProps, UserOnDesk} from './types'
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
import { getTasksByDeskId, updateTask } from '../../../../services/task/Task'

const DeskParticipants: React.FC<DeskParticipantsProps> = ({ desk, deskUsers, hasEditPermission = true, refreshDeskUsers, updateLocalUsers }) => {
  const deskId = desk?.id;
  console.log(`DeskParticipants RENDER - Desk ID: ${deskId}, Users Count from props: ${deskUsers?.length}`);

  const [actionInProgress, setActionInProgress] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserOnDesk | null>(null);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    console.log('[DeskParticipants] ==> Получены НОВЫЕ пропсы deskUsers:', deskUsers);
    setLocalError(null);
  }, [deskUsers]);

  const currentUserRole = getUserRoleOnDesk(deskUsers || []);
  const hasManagePermission = canManageParticipants(deskUsers || []) && hasEditPermission;

  const openDeleteModal = (userId: number) => {
    const user = deskUsers?.find(p => p.id === userId);
    if (user) {
      setSelectedUser(user);
      setDeleteModalOpen(true);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!deskId || !selectedUser) return Promise.reject(new Error('Desk ID или selectedUser не определены'));

    const originalUsers = [...deskUsers];
    const deletedUsername = getUserName(selectedUser);

    // 1. Оптимистичное удаление
    updateLocalUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
    setDeleteModalOpen(false);
    setSelectedUser(null);
    setActionInProgress(true);
    setLocalError(null);

    try {
      // 2. Вызов API
      await deleteUserFromDesk(deskId, userId);
      // 3. Обновление задач
      const tasks = await getTasksByDeskId(deskId);
      const updatePromises = tasks
        .filter(task => task.executors?.includes(deletedUsername))
        .map(task => updateTask(deskId, task.taskId, { removeExecutorUsernames: [deletedUsername] }).catch(err => console.error(`Ошибка при удалении исполнителя ${deletedUsername} из задачи ${task.taskId}:`, err)));
      await Promise.all(updatePromises);

      // --- УБИРАЕМ refreshDeskUsers при УСПЕХЕ ---
      // refreshDeskUsers();
      console.log('--- handleDeleteUser FINISHED (API OK, UI already updated) ---');
      return Promise.resolve();

    } catch (error) {
      console.error('Ошибка при удалении пользователя или обновлении задач:', error);
      setLocalError('Не удалось удалить пользователя');
      // 5. Откат при ошибке API (оставляем)
      console.log('--- handleDeleteUser ERRORED - Rolling back ---');
      updateLocalUsers(() => originalUsers);
      refreshDeskUsers(); // Обновляем для синхронизации после ошибки
      return Promise.reject(error);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleUpdateUserRole = async (userId: number, rightType: RightType) => {
    if (!deskId || actionInProgress) return;

    const originalUsers = [...deskUsers];
    const userIndex = originalUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) return; // Пользователь не найден

    // Проверяем, нужно ли вообще обновление
    if (originalUsers[userIndex].rightType === rightType) {
        console.log(`Роль пользователя ${userId} уже ${rightType}. Обновление не требуется.`);
        return;
    }

    // 1. Оптимистичное обновление
    updateLocalUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, rightType: rightType } : u ));
    setActionInProgress(true);
    setLocalError(null);

    try {
      // 2. Вызов API
      await updateUserRightsOnDesk(deskId, { userId, rightType });

      // --- УБИРАЕМ refreshDeskUsers при УСПЕХЕ ---
      // refreshDeskUsers();
      console.log('--- handleUpdateUserRole FINISHED (API OK, UI already updated) ---');
    } catch (error) {
      console.error('Ошибка при обновлении роли пользователя:', error);
      setLocalError('Не удалось обновить роль пользователя');
      // 4. Откат при ошибке API (оставляем)
      console.log('--- handleUpdateUserRole ERRORED - Rolling back ---');
      updateLocalUsers(() => originalUsers);
      refreshDeskUsers(); // Обновляем для синхронизации после ошибки
    } finally {
      setActionInProgress(false);
    }
  };

  const handleAddUserSuccess = () => {
    console.log('[DeskParticipants] Пользователь успешно добавлен на сервер, обновляем список...');
    refreshDeskUsers(); // Здесь refresh нужен, чтобы получить ID нового юзера
    setIsAddUserModalOpen(false);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedUser(null);
  };

  const hasParticipants = deskUsers && deskUsers.length > 0;

  return (
    <div className='w-full mb-6'>
      <div className='flex justify-between items-center mb-2'>
        <h3 className='text-lg font-medium'>Участники</h3>
        {hasManagePermission && (
          <button
            className='text-sm bg-gray-50 rounded-full px-4 py-1.5 hover:bg-gray-100 cursor-pointer'
            onClick={() => setIsAddUserModalOpen(true)}
            disabled={actionInProgress}
          >
            Добавить участников
          </button>
        )}
      </div>

      {localError && <div className="mb-2 p-2 bg-red-50 text-red-600 rounded-md text-sm">{localError}</div>}

      <div className='bg-white rounded-lg p-4'>
        {hasParticipants ? (
          <ParticipantsList
            key={JSON.stringify(deskUsers.map(u => u.id))}
            participants={deskUsers}
            onDeleteUser={openDeleteModal}
            onUpdateUserRole={handleUpdateUserRole}
            currentUserRole={currentUserRole}
          />
        ) : (
          <EmptyState />
        )}
      </div>

      {deskId && hasManagePermission && (
        <AddUserModal
          isOpen={isAddUserModalOpen}
          onClose={() => setIsAddUserModalOpen(false)}
          deskId={deskId}
          onAddSuccess={handleAddUserSuccess}
        />
      )}
      {selectedUser && (
        <DeleteUserModal
          isOpen={deleteModalOpen}
          userId={selectedUser.id}
          userName={getUserName(selectedUser)}
          deskId={deskId || null}
          onClose={handleCloseDeleteModal}
          onConfirm={() => handleDeleteUser(selectedUser.id)}
          isLoading={actionInProgress}
        />
      )}
    </div>
  );
};

export default DeskParticipants;