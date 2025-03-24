import api from '../../api'
import { DeskUpdateDto } from '../types/desk.types'

const BASE_URL = '/api/v1/desk'

export const updateDesk = async (id: number, data: DeskUpdateDto): Promise<string> => {
	const response = await api.put(`${BASE_URL}/${id}`, data)
	return response.data
}
