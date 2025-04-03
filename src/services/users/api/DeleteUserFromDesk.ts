import api from '../../api'
import {invalidateDeskUsersCache} from './GetUsersOnDesk'

const BASE_URL = '/api/v1/desk';


export const deleteUserFromDesk = async (deskId: number, userId: number): Promise<void> => {
  try {
    console.log(`Удаление пользователя с ID ${userId} с доски ${deskId}`);
    
    const response = await api.delete(`${BASE_URL}/${deskId}/users/${userId}`);
    console.log('Ответ от сервера:', response.status);
    
    // Инвалидируем кэш для этой доски, чтобы следующий запрос получил свежие данные
    invalidateDeskUsersCache(deskId);
    
    // Возвращаем void, так как API возвращает 200 OK без тела
    return;
  } catch (error: any) {
    if (error.response?.status === 403) {
      console.error('Недостаточно прав для удаления пользователя с доски:', error);
      throw new Error('Недостаточно прав для удаления пользователя с доски');
    } else if (error.response?.status === 404) {
      console.error('Пользователь или доска не найдены:', error);
      throw new Error('Пользователь или доска не найдены');
    } else {
      console.error('Ошибка при удалении пользователя с доски:', error);
      throw error;
    }
  }
};
