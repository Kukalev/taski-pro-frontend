import axios from 'axios'

// Базовый URL API
const BASE_URL = '/api' // Замените на ваш URL

// Интерфейсы для запросов
interface RegisterRequest {
	username: string
	email: string
	password: string
	firstname: string
	lastname: string
}

interface LoginRequest {
	username: string
	password: string
}

// API для работы с аутентификацией
const authAPI = {
	// Регистрация пользователя
	register: async (userData: RegisterRequest): Promise<string> => {
		try {
			const response = await axios.post(`${BASE_URL}/auth/registration`, userData)
			return response.data
		} catch (error: any) {
			// Обрабатываем ошибку и возвращаем сообщение
			if (error.response) {
				throw new Error(error.response.data)
			}
			throw new Error('Ошибка при регистрации')
		}
	},

	// Аутентификация пользователя
	login: async (data: LoginRequest) => {
		try {
			const response = await axios.post(`${BASE_URL}/auth/login`, data)

			// Если в ответе приходит токен, можно сохранить его
			if (response.data.token) {
				localStorage.setItem('token', response.data.token)
			}

			return response.data
		} catch (error) {
			console.error('Ошибка при входе:', error)
			throw new Error('Ошибка при входе')
		}
	}
}

export default authAPI
