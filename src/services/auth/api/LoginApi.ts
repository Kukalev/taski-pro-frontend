import api from '../../api'
import {AuthResponse, LoginRequest} from '../types/Auth.types'
import {saveTokens} from '../utils/TokenStorage.ts'

const BASE_URL = '/api/v1/auth'
export const login = async (data: LoginRequest, authContextLogin: () => void): Promise<AuthResponse> => {
	try {
		console.log(`[LoginApi] Отправка запроса на /auth/login для пользователя: ${data.username}`);
		console.log(`[LoginApi] Выполнение api.post('/auth/login', ...) для ${data.username}`);
		const response = await api.post<AuthResponse>(`${BASE_URL}/login`, data)
		console.log(`[LoginApi] Получен ответ от /auth/login для ${data.username}. Статус: ${response.status}`);
		console.log(`[LoginApi] Данные ответа:`, response.data);

		console.log(`[LoginApi] Успешный ответ от /auth/login для ${data.username}. Токен получен: ${!!response.data?.accessToken}`);

		// Сохраняем токены
		if (response.data?.accessToken) {
			console.log(`[LoginApi] Вызов saveTokens для ${data.username}...`);
			saveTokens({
				accessToken: response.data.accessToken,
				refreshToken: response.data.refreshToken,
				username: data.username
			})
			console.log(`[LoginApi] Вызов authContextLogin() для обновления состояния AuthContext.`);
			authContextLogin();
		} else {
			console.warn(`[LoginApi] Токен доступа (accessToken) не получен в ответе для ${data.username}!`);
		}

		return response.data
	} catch (error) {
		console.error(`[LoginApi] Ошибка ВНУТРИ try...catch при входе для ${data.username}:`, error);
		throw error
	}
}
