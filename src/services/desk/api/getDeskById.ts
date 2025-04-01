import api from '../../api'
import {DeskResponseDto} from '../types/desk.types'

const BASE_URL = '/api/v1/desk'

export const getDeskById = async (id: number): Promise<DeskResponseDto> => {
	const response = await api.get(`${BASE_URL}/${id}`)
	console.log('ДАННЫЕ О ДОСКЕ',response.data)
	// Преобразуем строки дат в объекты Date
	return {
		...response.data,
		deskCreateDate: new Date(response.data.deskCreateDate),
		deskFinishDate: new Date(response.data.deskFinishDate)
	}
}
