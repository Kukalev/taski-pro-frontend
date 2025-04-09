import api from '../../api'
import {DeskResponseDto} from '../types/desk.types'

const BASE_URL = '/v1/desk'

export const getAllDesks = async (): Promise<DeskResponseDto[]> => {
	console.log('[getAllDesks] Запрос на получение всех досок...')
	try {
		const response = await api.get(BASE_URL)
		console.log('[getAllDesks] Успешный ответ:', response.data)
		// Преобразуем строки дат в объекты Date, если нужно
		// (Проверяем, действительно ли response.data - это массив)
		if (Array.isArray(response.data)) {
			return response.data.map((desk: DeskResponseDto) => ({
				...desk,
				deskCreateDate: new Date(desk.deskCreateDate),
				deskFinishDate: desk.deskFinishDate ? new Date(desk.deskFinishDate) : null
			}))
		}
		console.warn('[getAllDesks] Ответ сервера не является массивом:', response.data)
		return [] // Возвращаем пустой массив, если формат ответа неожиданый
	} catch (error) {
		console.error('[getAllDesks] Ошибка при получении досок:', error) // Лог ошибки
		throw error // Пробрасываем ошибку дальше
	}
}
