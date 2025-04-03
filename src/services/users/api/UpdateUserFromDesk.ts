import api from '../../api'
import {invalidateDeskUsersCache} from './GetUsersOnDesk'

const BASE_URL = '/api/v1/desk';

export enum RightType {
  CREATOR = 'CREATOR',
  CONTRIBUTOR = 'CONTRIBUTOR',
  MEMBER = 'MEMBER'
}

export interface ChangeUserRightsDto {
  userId: number;
  rightType: RightType;
}


export const updateUserRightsOnDesk = async (deskId: number, changeUserRightsDto: ChangeUserRightsDto): Promise<void> => {
  try {
    console.log(`Изменение прав пользователя ${changeUserRightsDto.userId} на доске ${deskId} на ${changeUserRightsDto.rightType}`);
    
    const response = await api.put(`${BASE_URL}/${deskId}/users`, changeUserRightsDto);
    console.log('Ответ от сервера:', response.status);
    
    // Инвалидируем кэш для этой доски, чтобы следующий запрос получил свежие данные
    invalidateDeskUsersCache(deskId);
    
    // Возвращаем void, так как API возвращает 200 OK без тела
    return;
  } catch (error: any) {
    if (error.response?.status === 403) {
      console.error('Недостаточно прав на изменение прав пользователя:', error);
      throw new Error('Недостаточно прав на изменение прав пользователя!');
    } else if (error.response?.status === 404) {
      console.error('Пользователь не найден:', error);
      throw new Error('Пользователь не найден!');
    } else {
      console.error('Ошибка при изменении прав пользователя на доске:', error);
      throw error;
    }
  }
};
