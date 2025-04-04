import api from '../../api'

const BASE_URL = '/api/v1/user/subscription';


export const cancelSubscription = async (): Promise<void> => {
  try {
    await api.post(`${BASE_URL}/cancel`);
    console.log('Подписка успешно отменена');
  } catch (error) {
    console.error('Ошибка при отмене подписки:', error);
    
    if (error.response?.status === 404) {
      throw new Error('Активная подписка не найдена');
    }
    
    throw error;
  }
};

