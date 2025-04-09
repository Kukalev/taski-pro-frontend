import React, { useCallback } from 'react'
import { useOutletContext } from 'react-router-dom'

import DeskHeader from './components/DeskHeader/DeskHeader'
import DeskDescription from './components/DeskDescription/DeskDescription'
import DeskParticipants from './components/DeskParticipants/DeskParticipants'

import { DeskData } from '../../contexts/DeskContext'
import { UserOnDesk } from './components/DeskParticipants/types'

import { useDeskActions } from './hooks/useDeskActions'

interface DeskDetailsContext {
  desk: DeskData | null;
  updateLocalDesk: (updatedData: Partial<DeskData>, isOptimistic?: boolean) => void;
  refreshDeskUsers: () => void;
  hasEditPermission: boolean;
  deskUsers: UserOnDesk[];
  updateLocalUsers: (updater: (prevUsers: UserOnDesk[]) => UserOnDesk[]) => void;
  avatarsMap: Record<string, string | null>;
}

const DeskOverviewPage: React.FC = () => {
  const { 
    desk,
    updateLocalDesk,
    refreshDeskUsers,
    hasEditPermission, 
    deskUsers,
    updateLocalUsers,
    avatarsMap
  } = useOutletContext<DeskDetailsContext>();

  const { isLoading, error, updateDeskName, updateDeskDescription, updateDeskDates } = 
    desk ? useDeskActions(desk) : { isLoading: false, error: null, updateDeskName: async () => { throw new Error('Desk not loaded'); }, updateDeskDescription: async () => { throw new Error('Desk not loaded'); }, updateDeskDates: async () => { throw new Error('Desk not loaded'); } };

  const handleUpdateName = useCallback(async (newName: string) => {
    if (!desk || newName === desk.deskName) return;

    const originalDesk = { ...desk };
    const optimisticUpdate = { ...desk, deskName: newName };

    console.log('[DeskOverviewPage] Оптимистичное обновление имени на:', newName);
    updateLocalDesk(optimisticUpdate, true);

    try {
      console.log('[DeskOverviewPage] Отправка запроса на сервер для обновления имени...');
      const updatedDataFromApi = await updateDeskName(newName);
      console.log('[DeskOverviewPage] Сервер успешно обновил имя. Ответ:', updatedDataFromApi);
      
      updateLocalDesk(updatedDataFromApi, false);

    } catch (updateError) {
      console.error('[DeskOverviewPage] Ошибка при обновлении имени на сервере:', updateError);
      console.log('[DeskOverviewPage] Откат оптимистичного обновления из-за ошибки.');
      updateLocalDesk(originalDesk, false);
    }
  }, [desk, updateDeskName, updateLocalDesk]);

  const handleUpdateDescription = useCallback(async (newDescription: string) => {
    if (!desk) return;
    const originalDesk = { ...desk };
    try {
      const updatedData = await updateDeskDescription(newDescription);
      console.log('[DeskOverviewPage] Описание доски успешно обновлено. Response:', updatedData);
      updateLocalDesk(updatedData);
    } catch (updateError) {
      console.error('[DeskOverviewPage] Ошибка при обновлении описания:', updateError);
      updateLocalDesk(originalDesk);
    }
  }, [desk, updateDeskDescription, updateLocalDesk]);

  const handleDateSave = useCallback(async (newFinishDate: Date | null) => {
    if (!desk) return;

    const originalDesk = { ...desk };
    const optimisticUpdate = { ...desk, deskFinishDate: newFinishDate };

    console.log(`[DeskOverviewPage] Оптимистичное обновление даты на: ${newFinishDate}`);
    updateLocalDesk(optimisticUpdate, true);

    try {
      console.log('[DeskOverviewPage] Отправка запроса на сервер для обновления даты...');
      const updatedDataFromApi = await updateDeskDates(newFinishDate);
      console.log('[DeskOverviewPage] Сервер успешно обновил дату. Ответ:', updatedDataFromApi);
      updateLocalDesk(updatedDataFromApi, false);

    } catch (updateError) {
      console.error('[DeskOverviewPage] Ошибка при обновлении даты на сервере:', updateError);
      console.log('[DeskOverviewPage] Откат оптимистичного обновления даты.');
      updateLocalDesk(originalDesk, false);
    }
  }, [desk, updateDeskDates, updateLocalDesk]);

  if (!desk) {
    return <div className="p-6 text-center text-gray-500">Загрузка обзора доски...</div>;
  }

  return (
    <>
      <DeskHeader 
        desk={desk} 
        onNameSave={handleUpdateName}
        onDateOrStatusSave={handleDateSave}
        isLoading={isLoading}
        hasEditPermission={hasEditPermission}
        onDeskUpdate={updateLocalDesk}
      />
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        <DeskDescription 
          desk={desk} 
          onDescriptionSave={handleUpdateDescription}
          isLoading={isLoading}
          hasEditPermission={hasEditPermission}
        />
        
        <DeskParticipants 
          desk={desk} 
          deskUsers={deskUsers}
          hasEditPermission={hasEditPermission}
          refreshDeskUsers={refreshDeskUsers}
          updateLocalUsers={updateLocalUsers}
          avatarsMap={avatarsMap}
        />
      </div>
    </>
  );
};

export default DeskOverviewPage;

