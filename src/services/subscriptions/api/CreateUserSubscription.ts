import api from '../../api'
import {SubscriptionType} from '../types'

const BASE_URL = '/api/v1/user/subscription';


export const createUserSubscription = async (subscriptionType: SubscriptionType): Promise<void> => {
  try {
    await api.post(`${BASE_URL}/${subscriptionType}`);
    console.log(`Подписка типа ${subscriptionType} успешно оформлена`);
  } catch (error) {
    console.error('Ошибка при создании подписки:', error);
    
    if (error.response?.status === 403) {
      throw new Error('У вас уже есть активная подписка');
    } else if (error.response?.status === 404) {
      throw new Error('Указанный тип подписки не найден');
    }
    
    throw error;
  }
};

