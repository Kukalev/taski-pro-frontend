import api from '../../api'
import {DeskCreateDto, DeskResponseDto} from '../types/desk.types'

const BASE_URL = '/api/v1/desk'


export const createDesk = async (data: DeskCreateDto): Promise<DeskResponseDto> => {
	try {
		console.log('DeskService.createDesk вызван с данными:', data)
		const response = await api.post(`${BASE_URL}/create`, data)
		console.log('Ответ от сервера:', response.data)
		return response.data
	} catch (error) {
		console.error('Ошибка в DeskService.createDesk:', error)
		throw error
	}
}
