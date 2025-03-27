import api from '../../api'
import {AuthResponse, LoginRequest} from '../types/Auth.types'
import {saveTokens} from '../utils/TokenStorage.ts'

export const login = async (data: LoginRequest): Promise<AuthResponse> => {
	try {
		const response = await api.post<AuthResponse>('/auth/login', data)

		// Сохраняем токены
		if (response.data.accessToken) {
			saveTokens({
				accessToken: response.data.accessToken,
				refreshToken: response.data.refreshToken,
				username: data.username
			})
		}

		return response.data
	} catch (error) {
		throw error
	}
}
