import {useState} from 'react'
import {DeskData} from '../../../components/sidebar/types/sidebar.types'
import {DeskService} from '../../../services/desk/Desk'

// Добавляем только экспорт константы для исправления ошибки в Sidebar
export const DESK_UPDATE_EVENT = 'desk_update';

// Экспортируем API


// Экспортируем константы

// Хук для работы с действиями доски
export const useDeskActions = (desk: DeskData, onDeskUpdate?: (updatedDesk: Partial<DeskData>) => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Обновление названия доски
  const updateDeskName = async (newName: string) => {
    if (!desk || !desk.id) return;
    
    setIsLoading(true);
    setError(null);

    try {
      await DeskService.updateDesk(desk.id, {
        deskName: newName,
        deskDescription: desk.deskDescription || '',
        deskFinishDate: desk.deskFinishDate || new Date()
      });
      
      if (onDeskUpdate) {
        onDeskUpdate({ deskName: newName });
      }
    } catch (err: any) {
      setError(err.message || 'Не удалось обновить название доски');
      console.error('Ошибка при обновлении названия доски:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Обновление описания доски
  const updateDeskDescription = async (newDescription: string) => {
    if (!desk || !desk.id) return;
    
    setIsLoading(true);
    setError(null);

    try {
      await DeskService.updateDesk(desk.id, {
        deskName: desk.deskName || '',
        deskDescription: newDescription,
        deskFinishDate: desk.deskFinishDate || new Date()
      });
      
      if (onDeskUpdate) {
        onDeskUpdate({ deskDescription: newDescription });
      }
    } catch (err: any) {
      setError(err.message || 'Не удалось обновить описание доски');
      console.error('Ошибка при обновлении описания доски:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    updateDeskName,
    updateDeskDescription
  };
};
