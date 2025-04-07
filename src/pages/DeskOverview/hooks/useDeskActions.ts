import {useState} from 'react'
import {DeskData} from '../../../contexts/DeskContext'
import {DeskService} from '../../../services/desk/Desk'
import {DeskUpdateDto} from '../../../services/desk/types/desk.types'
import { DeskStatus } from '../components/DeskHeader/types'

// Добавляем только экспорт константы для исправления ошибки в Sidebar
export const DESK_UPDATE_EVENT = 'desk_update';

// Экспортируем API


// Экспортируем константы

// Хук для работы с действиями доски
export const useDeskActions = (desk: DeskData | null) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Обновление названия доски
  const updateDeskName = async (newName: string): Promise<DeskData> => {
    if (!desk?.id) {
        console.error('Desk ID is missing in useDeskActions.updateDeskName');
        throw new Error('Desk ID is missing');
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log(`[useDeskActions] Обновление имени доски ${desk.id} на "${newName}"`);
      // Собираем ПОЛНЫЙ (или более полный) DTO
      const updateData: DeskUpdateDto = {
        deskName: newName, // Новое имя
        deskDescription: desk.deskDescription ?? '', // Текущее описание (или пустая строка)
        deskFinishDate: desk.deskFinishDate ? new Date(desk.deskFinishDate) : null, // Текущая дата завершения
        // Добавь сюда status, если он тоже часть DTO
      };
      console.log('[useDeskActions] Отправка данных для обновления имени:', updateData);
      const response = await DeskService.updateDesk(desk.id, updateData);
      console.log(`[useDeskActions] Имя доски ${desk.id} успешно обновлено. Raw Response Status:`, response.status);

      const updatedDeskData: DeskData = response.data;

      if (!updatedDeskData || typeof updatedDeskData.id !== 'number') {
          console.error('[useDeskActions] !!! ОШИБКА: API вернул некорректные данные после обновления имени!', updatedDeskData);
          throw new Error('API returned invalid data after name update');
      }

      console.log('[useDeskActions] Возвращаем извлеченные данные:', updatedDeskData);
      return updatedDeskData;

    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Не удалось обновить название доски';
      setError(errorMessage);
      console.error('[useDeskActions] Ошибка при обновлении названия доски:', err);
      throw err; // Перебрасываем ошибку для обработки выше
    } finally {
      setIsLoading(false);
    }
  };

  // Обновление описания доски
  const updateDeskDescription = async (newDescription: string): Promise<DeskData> => {
    if (!desk?.id) {
        console.error('Desk ID is missing in useDeskActions.updateDeskDescription');
        throw new Error('Desk ID is missing');
    }

    setIsLoading(true);
    setError(null);

    try {
        console.log(`[useDeskActions] Обновление описания доски ${desk.id}`);
      // Собираем ПОЛНЫЙ DTO
      const updateData: DeskUpdateDto = {
        deskName: desk.deskName, // Текущее имя
        deskDescription: newDescription, // Новое описание
        deskFinishDate: desk.deskFinishDate ? new Date(desk.deskFinishDate) : null, // Текущая дата завершения
        // Добавь сюда status, если он тоже часть DTO
      };
      console.log('[useDeskActions] Отправка данных для обновления описания:', updateData);
      const response = await DeskService.updateDesk(desk.id, updateData);
      console.log(`[useDeskActions] Описание доски ${desk.id} успешно обновлено. Raw Response Status:`, response.status);

      const updatedDeskData: DeskData = response.data;

       if (!updatedDeskData || typeof updatedDeskData.id !== 'number') {
          console.error('[useDeskActions] !!! ОШИБКА: API вернул некорректные данные после обновления описания!', updatedDeskData);
          throw new Error('API returned invalid data after description update');
      }

      console.log('[useDeskActions] Возвращаем извлеченные данные:', updatedDeskData);
      return updatedDeskData;

    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Не удалось обновить описание доски';
      setError(errorMessage);
      console.error('[useDeskActions] Ошибка при обновлении описания доски:', err);
      throw err; // Перебрасываем ошибку
    } finally {
      setIsLoading(false);
    }
  };

  // Обновление дат доски (пока только даты завершения)
  const updateDeskDates = async (finishDate: Date | null): Promise<DeskData> => {
    if (!desk?.id) {
        console.error('Desk ID is missing in useDeskActions.updateDeskDates');
        throw new Error('Desk ID is missing');
    }

    setIsLoading(true);
    setError(null);

    // Проверяем тип finishDate перед вызовом toISOString
    let finishDateISO: string | null = null;
    if (finishDate instanceof Date && !isNaN(finishDate.getTime())) {
       // Проверка isNaN добавлена на всякий случай
       try {
         finishDateISO = finishDate.toISOString();
       } catch (e) {
         console.error("[useDeskActions] Ошибка при вызове toISOString:", e, "для даты:", finishDate);
         // Если toISOString падает, отправляем null
       }
    } else if (finishDate !== null) {
       // Логируем, если пришло что-то неожиданное, но не Date
       console.warn(`[useDeskActions] updateDeskDates получил некорректный тип для finishDate: ${typeof finishDate}`, finishDate);
    }

    console.log(`[useDeskActions] Обновление даты завершения доски ${desk.id} на ${finishDateISO}`);

    try {
      const updateData: DeskUpdateDto = {
         deskName: desk.deskName,
         deskDescription: desk.deskDescription ?? '',
         deskFinishDate: finishDateISO, // Используем ISO строку или null
         status: desk.status || DeskStatus.IN_PROGRESS,
      };
      console.log('[useDeskActions] Отправка данных для обновления даты (ISO):', updateData);
      const response = await DeskService.updateDesk(desk.id, updateData);
      console.log(`[useDeskActions] Даты доски ${desk.id} успешно обновлены. Response Status:`, response.status);

      const updatedDeskData: DeskData = response.data;

      // Парсинг даты из ответа API
      if (updatedDeskData.deskFinishDate && typeof updatedDeskData.deskFinishDate === 'string') {
         try {
           updatedDeskData.deskFinishDate = new Date(updatedDeskData.deskFinishDate);
           if (isNaN(updatedDeskData.deskFinishDate.getTime())) {
               console.error("[useDeskActions] API вернул невалидную строку даты:", response.data.deskFinishDate);
               updatedDeskData.deskFinishDate = null; // Сбрасываем в null если парсинг не удался
           }
         } catch(e) {
             console.error("[useDeskActions] Ошибка парсинга даты из ответа API:", e);
             updatedDeskData.deskFinishDate = null;
         }
      } else if (!(updatedDeskData.deskFinishDate instanceof Date) && updatedDeskData.deskFinishDate !== null) {
          // Если пришло не строка, не Date и не null - логируем и сбрасываем
          console.warn("[useDeskActions] API вернул неожиданный тип для deskFinishDate:", updatedDeskData.deskFinishDate);
          updatedDeskData.deskFinishDate = null;
      }

      if (!updatedDeskData || typeof updatedDeskData.id !== 'number') {
          console.error('[useDeskActions] !!! ОШИБКА: API вернул некорректные данные после обновления дат!', updatedDeskData);
          throw new Error('API returned invalid data after date update');
      }

      console.log('[useDeskActions] Возвращаем извлеченные данные после обновления дат:', updatedDeskData);
      return updatedDeskData;

    } catch (err: any) {
       if (err.response && err.response.status === 401) {
          console.error('[useDeskActions] ОШИБКА 401 (Unauthorized) при обновлении даты!', err.response.data);
          setError('Сессия истекла или недействительна.');
       } else {
          const errorMessage = err.response?.data?.message || err.message || 'Не удалось обновить даты доски';
          setError(errorMessage);
          console.error('[useDeskActions] Ошибка при обновлении дат доски:', err);
       }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    updateDeskName,
    updateDeskDescription,
    updateDeskDates,
  };
};
