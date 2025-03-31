import api from '../../api'
import {UserResponseDto} from '../types/types'

const BASE_URL = '/api/v1/desk';


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