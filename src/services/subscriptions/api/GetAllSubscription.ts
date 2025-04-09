import api from '../../api'
import {SubscriptionInfoDto} from '../types'

const BASE_URL = '/v1/user/subscription';


export const getAllSubscriptionTypes = async (): Promise<SubscriptionInfoDto[]> => {
	try {
		const response = await api.get<SubscriptionInfoDto[]>(`${BASE_URL}/types`);
		return response.data;
	} catch (error) {
		console.error('Ошибка при получении списка типов подписок:', error);
		throw error;
	}
};