import api from '../../api'
import {AddUserOnDeskDto} from '../types/types'

const BASE_URL = '/api/v1/desk';


export const addUserForDesk = async (deskId: number, addUserDto: AddUserOnDeskDto): Promise<void> => {
  try {

    const response = await api.post(`${BASE_URL}/${deskId}/user`, addUserDto);
    console.log('Ответ от сервера:', response.status);
    // Возвращаем void, так как API возвращает 200 OK без тела
    return;
  } catch (error: any) {
    if (error.response?.status === 403) {
      console.error('Недостаточно прав для добавления пользователя на доску:', error);
      throw new Error('Недостаточно прав для добавления пользователя на доску');
    } else if (error.response?.status === 404) {
      console.error('Пользователь или доска не найдены:', error);
      throw new Error('Пользователь или доска не найдены');
    } else {
      console.error('Ошибка при добавлении пользователя на доску:', error);
      throw error;
    }
  }
};
