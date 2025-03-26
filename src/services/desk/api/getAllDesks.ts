import api from '../../api'
import { DeskResponseDto } from '../types/desk.types'

const BASE_URL = '/api/v1/desk'

export const getAllDesks = async (): Promise<DeskResponseDto[]> => {
	const response = await api.get(`${BASE_URL}`)
	console.log('Ответ от сервера:', response.data)
	return response.data
}
