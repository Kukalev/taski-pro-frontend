import {UserService} from '../../../services/users/Users'
import api from '../../api'
import {UserResponseDto} from '../types/types'

const BASE_URL = '/v1/desk';


export const getAllUsers = async (): Promise<UserResponseDto[]> => {
  try {
    const response = await api.get(`${BASE_URL}/users`);

    // Преобразуем строки дат в объекты Date
    return response.data.map((user: UserResponseDto) => ({
      ...user,
    }));
  } catch (error) {
    console.error('Ошибка при получении списка пользователей:', error);
    throw error;
  }
};

export const getUsersOnDesk = async (deskId: string | number): Promise<UserResponseDto[]> => {
  try {
    const numericDeskId = typeof deskId === 'string' ? parseInt(deskId, 10) : deskId;
    const response = await UserService.getUsersOnDesk(numericDeskId);
    
    // Преобразуем UsersOnDeskResponseDto в UserResponseDto
    return response.map(user => ({
      username: user.userName || user.username || '',
      firstName: '',  // Эти поля отсутствуют в UsersOnDeskResponseDto, заполняем пустыми значениями
      lastName: '',
      email: ''
    }));
  } catch (error) {
    console.error('Ошибка при получении списка пользователей на столе:', error);
    throw error;
  }
};