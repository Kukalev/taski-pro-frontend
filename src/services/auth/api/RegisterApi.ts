import api from '../../api'
import {AuthResponse, RegisterRequest} from '../types/Auth.types'
import {login} from './LoginApi'


const BASE_URL = '/v1/auth'
export const register = async (data: RegisterRequest, authContextLogin: () => void): Promise<AuthResponse> => {
	try {
		// Регистрация
		console.log(`[RegisterApi] Отправка запроса на /auth/registration для пользователя: ${data.username}`);
		await api.post(`${BASE_URL}/registration`, data)
		console.log(`[RegisterApi] Регистрация для ${data.username} УСПЕШНА. Выполняется автоматический вход...`);

		// Автоматический вход после успешной регистрации
		const loginData = {
			username: data.username,
			password: data.password
		}

		// ---> Передаем authContextLogin в login <---
		console.log(`[RegisterApi] Вызов login() для автоматического входа ${data.username} и обновления AuthContext...`);
		return await login(loginData, authContextLogin)
	} catch (error) {
		console.error(`[RegisterApi] Ошибка при регистрации или автоматическом входе для ${data.username}:`, error);
		// Просто пробрасываем ошибку дальше
		throw error
	}
}
