import api from '../../api'
import {UsersOnDeskResponseDto} from '../types/types'

const BASE_URL = '/api/v1/desk';

export const getUsersOnDesk = async (deskId: number): Promise<UsersOnDeskResponseDto[]> => {
	try {
		const response = await api.get<UsersOnDeskResponseDto[]>(`${BASE_URL}/${deskId}/users`);
		console.log('Юзеры на доске',response.data);
		return response.data;
	} catch (error) {
		console.error('Ошибка при получении списка пользователей доски:', error);
		throw error;
	}
};