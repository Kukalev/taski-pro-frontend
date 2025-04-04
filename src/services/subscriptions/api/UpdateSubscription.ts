import api from '../../api'
import {SubscriptionType} from '../types'

const BASE_URL = '/api/v1/user/subscription';


export const updateSubscription = async (subscriptionType: SubscriptionType): Promise<void> => {
  try {
    await api.post(`${BASE_URL}/update/${subscriptionType}`);
    console.log(`Подписка успешно обновлена до типа ${subscriptionType}`);
  } catch (error) {
    console.error('Ошибка при обновлении подписки:', error);
    
    if (error.response?.status === 404) {
      throw new Error('Активная подписка не найдена');
    }
    
    throw error;
  }
};

