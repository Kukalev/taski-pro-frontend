import api from '../../api'
import {DeskUpdateDto} from '../types/desk.types'
import {AxiosResponse} from 'axios'

const BASE_URL = '/v1/desk'

export const updateDesk = async (id: number, data: Partial<DeskUpdateDto>): Promise<AxiosResponse<DeskUpdateDto>> => {
	console.log(`Обновление доски ID: ${id} с данными:`, data)
	try {
		const response = await api.put(`${BASE_URL}/${id}`, data)
		console.log('Ответ от сервера при обновлении:', response.status, response.data)
		return response
	} catch (error) {
		console.error('Ошибка при обновлении доски:', error)
		throw error
	}
}
