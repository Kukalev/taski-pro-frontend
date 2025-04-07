import api from '../../api'
import {UserResponseDto} from '../types/types'

// Базовый URL для профиля
const PROFILE_BASE_URL = '/v1/profile';

export const getUserProfileById = async (userId: number): Promise<UserResponseDto> => {
  // Проверяем, передан ли ID
  if (!userId) {
    console.error('[GetUserProfileById] Ошибка: ID пользователя не передан.');
    throw new Error('Необходимо передать ID пользователя.');
  }

  try {
    console.log(`[GetUserProfileById] Запрос данных пользователя с ID: ${userId}...`);
    const response = await api.get<UserResponseDto>(`${PROFILE_BASE_URL}/${userId}`);
    console.log(`[GetUserProfileById] Данные профиля для ID ${userId} успешно получены:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`[GetUserProfileById] Ошибка при получении профиля для ID ${userId}:`, error);
    throw error;
  }
}; 