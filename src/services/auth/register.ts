import {AuthResponse, RegisterRequest} from '../../types/auth.types'
import api from '../api'
import {login} from './login'

export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
	try {
		// Регистрация
		await api.post('/auth/registration', data)

		// Автоматический вход после успешной регистрации
		const loginData = {
			username: data.username,
			password: data.password
		}

		// Используем функцию login для входа
		return await login(loginData)
	} catch (error) {
		// Просто пробрасываем ошибку дальше
		throw error
	}
}
