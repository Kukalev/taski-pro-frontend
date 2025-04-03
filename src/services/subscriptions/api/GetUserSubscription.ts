import api from '../../api'
import {UserSubscriptionResponseDto} from '../types'

const BASE_URL = '/api/v1/user/subscription';

/**
 * Получает информацию о текущей подписке пользователя
 * @returns Promise с данными о подписке пользователя
 */
export const getUserSubscription = async (): Promise<UserSubscriptionResponseDto> => {
  try {
    const response = await api.get<UserSubscriptionResponseDto>(BASE_URL);
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении информации о подписке:', error);
    
    if (error.response?.status === 404) {
      throw new Error('Пользователь не имеет подписок');
    }
    
    throw error;
  }
};
