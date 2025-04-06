import React, {useCallback, useEffect, useState} from 'react'
import { UserService } from '../../../../services/users/Users' // Импортируем UserService для загрузки
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
import { getTasksByDeskId, updateTask } from '../../../../services/task/Task'

const DeskParticipants: React.FC<DeskParticipantsProps> = ({ desk, deskUsers, hasEditPermission = true, refreshDeskUsers }) => {
  const deskId = desk?.id;
  console.log(`DeskParticipants RENDER - Desk ID: ${deskId}, Users Count: ${deskUsers?.length}`);

  const [participants, setParticipants] = useState<UserOnDesk[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserOnDesk | null>(null);

  const loadParticipants = useCallback(async () => {
    if (!deskId) {
        setParticipants([]);
        setIsLoading(false);
        return;
    }
    console.log(`>>> loadParticipants CALLED for desk ID: ${deskId}`);
    setIsLoading(true);
    setError(null);

    try {
      const users = await UserService.getUsersOnDesk(deskId, false);
      const sortedUsers = [...users].sort((a, b) => {
        if (a.rightType === 'CREATOR' && b.rightType !== 'CREATOR') return -1;
        if (a.rightType !== 'CREATOR' && b.rightType === 'CREATOR') return 1;
        return (getUserName(a) || '').localeCompare(getUserName(b) || '');
      });
      setParticipants(sortedUsers);
      console.log("Участники загружены локально:", sortedUsers);
    } catch (error) {
      console.error('Ошибка при загрузке участников:', error);
      setError('Не удалось загрузить участников');
      setParticipants([]);
    } finally {
      setIsLoading(false);
    }
  }, [deskId]);

  useEffect(() => {
    console.log(`--- useEffect [deskId] TRIGGERED --- Desk ID: ${deskId}`);
    loadParticipants();
  }, [loadParticipants]);

  const currentUserRole = getUserRoleOnDesk(participants);
  const hasManagePermission = canManageParticipants(deskUsers || []) && hasEditPermission;

  const openDeleteModal = (userId: number) => {
    const user = participants.find(p => p.id === userId);
    if (user) {
      setSelectedUser(user);
      setDeleteModalOpen(true);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!deskId || !selectedUser) return Promise.reject(new Error('Desk ID или selectedUser не определены'));
    const deletedUsername = getUserName(selectedUser);

    setActionInProgress(true);
    setError(null);
    console.log(`--- handleDeleteUser STARTED for user ID: ${userId}, username: ${deletedUsername} ---`);

    try {
      await deleteUserFromDesk(deskId, userId);
      console.log('--- handleDeleteUser: API call deleteUserFromDesk SUCCESS ---');

      setParticipants(prev => prev.filter(p => p.id !== userId));

      console.log(`--- handleDeleteUser: Fetching tasks for desk ${deskId} to remove executor ${deletedUsername} ---`);
      const tasks = await getTasksByDeskId(deskId);
      console.log(`--- handleDeleteUser: Found ${tasks.length} tasks ---`);
      const updatePromises = tasks
        .filter(task => task.executors?.includes(deletedUsername))
        .map(task => {
          console.log(`--- handleDeleteUser: Updating task ${task.taskId} to remove executor ${deletedUsername} ---`);
          return updateTask(deskId, task.taskId, { removeExecutorUsernames: [deletedUsername] })
            .catch(err => console.error(`Ошибка при удалении исполнителя ${deletedUsername} из задачи ${task.taskId}:`, err));
        });
      await Promise.all(updatePromises);
      console.log(`--- handleDeleteUser: Finished updating tasks for executor ${deletedUsername} ---`);

      refreshDeskUsers();
      console.log('--- handleDeleteUser: Called refreshDeskUsers ---');

      setDeleteModalOpen(false);
      setSelectedUser(null);
      console.log('--- handleDeleteUser FINISHED ---');
      return Promise.resolve();
    } catch (error) {
      console.error('Ошибка при удалении пользователя или обновлении задач:', error);
      setError('Не удалось удалить пользователя или обновить связанные задачи');
      console.log('--- handleDeleteUser ERRORED ---');
      loadParticipants();
      refreshDeskUsers();
      return Promise.reject(error);
    } finally {
      setActionInProgress(false);
      setDeleteModalOpen(false);
      setSelectedUser(null);
    }
  };

  const handleUpdateUserRole = async (userId: number, rightType: RightType) => {
    if (!deskId || actionInProgress) return;
    const originalParticipants = [...participants];

    console.log(`--- handleUpdateUserRole STARTED for user ID: ${userId}, new role: ${rightType} ---`);

    setParticipants(prev => prev.map(p => p.id === userId ? { ...p, rightType } : p));

    setActionInProgress(true);
    setError(null);

    try {
      await updateUserRightsOnDesk(deskId, { userId, rightType });
      console.log('--- handleUpdateUserRole: API call SUCCESS ---');
      refreshDeskUsers();
      console.log('--- handleUpdateUserRole FINISHED ---');
    } catch (error) {
      console.error('Ошибка при обновлении роли пользователя:', error);
      setError('Не удалось обновить роль пользователя');
      console.log('--- handleUpdateUserRole: ERRORED - Rolling back UI ---');
      setParticipants(originalParticipants);
      refreshDeskUsers();
    } finally {
      setActionInProgress(false);
    }
  };

  const handleAddSuccess = useCallback((newUser: UserOnDesk) => {
    console.log('--- handleAddSuccess CALLED ---', newUser);
    setIsModalOpen(false);

    setParticipants(prevParticipants => {
        const exists = prevParticipants.some(p => p.id === newUser.id || (p.username || p.userName) === (newUser.username || newUser.userName));
        if (exists) {
            console.warn("Попытка добавить существующего пользователя локально, пропускаем UI обновление.");
            refreshDeskUsers();
            return prevParticipants;
        }
        const updatedList = [...prevParticipants, newUser].sort((a, b) => {
           if (a.rightType === 'CREATOR' && b.rightType !== 'CREATOR') return -1;
           if (a.rightType !== 'CREATOR' && b.rightType === 'CREATOR') return 1;
           return (getUserName(a) || '').localeCompare(getUserName(b) || '');
        });
        return updatedList;
    });

    refreshDeskUsers();
  }, [refreshDeskUsers]);

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedUser(null);
  };

  return (
    <div className='w-full mb-6'>
      <div className='flex justify-between items-center mb-2'>
        <h3 className='text-lg font-medium'>Участники</h3>
        {hasManagePermission && (
          <button
            className='text-sm bg-gray-50 rounded-full px-4 py-1.5 hover:bg-gray-100 cursor-pointer'
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

      {deskId && hasManagePermission && (
        <AddUserModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          deskId={deskId}
          onAddSuccess={handleAddSuccess}
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