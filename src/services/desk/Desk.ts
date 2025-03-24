import api from '../api'

// Типы
interface DeskCreateDto {
	deskName: string
	deskDescription: string
}

interface DeskResponseDto {
	id: number
	deskName: string
	deskDescription: string
	deskCreateDate: Date
	deskFinishDate: Date
	userLimit: number
}

interface DeskUpdateDto {
	deskName: string
	deskDescription: string
	deskFinishDate: Date
}

const BASE_URL = '/api/v1/desk'

export const DeskService = {
	handleError(error: any): never {
		if (error?.status === 401) {
			throw new Error('Необходима авторизация')
		}
		if (error?.status === 404) {
			throw new Error('Доска не найдена')
		}
		throw new Error(error?.message || 'Произошла ошибка при работе с доской')
	},

	// Создание новой доски
	async createDesk(data: DeskCreateDto): Promise<string> {
		try {
			console.log('DeskService.createDesk вызван с данными:', data)
			const response = await api.post(`${BASE_URL}/create`, data)
			console.log('Ответ от сервера:', response.data)
			return response.data
		} catch (error) {
			console.error('Ошибка в DeskService.createDesk:', error)
			throw error
		}
	},

	// Удаление доски по ID
	async deleteDesk(id: number): Promise<string> {
		const response = await api.delete(`${BASE_URL}/${id}`)
		return response.data
	},

	// Получение доски по ID
	async getDeskById(id: number): Promise<DeskResponseDto> {
		const response = await api.get(`${BASE_URL}/${id}`)
		// Преобразуем строки дат в объекты Date
		return {
			...response.data,
			deskCreateDate: new Date(response.data.deskCreateDate),
			deskFinishDate: new Date(response.data.deskFinishDate)
		}
	},

	// Обновление доски
	async updateDesk(id: number, data: DeskUpdateDto): Promise<string> {
		const response = await api.put(`${BASE_URL}/${id}`, data)
		return response.data
	},

	// Получение всех досок
	async getAllDesks(): Promise<DeskResponseDto[]> {
		const response = await api.get(`${BASE_URL}`)
		return response.data
	}
}
