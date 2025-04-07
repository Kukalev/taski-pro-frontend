import {TokenStorage} from '../types/Auth.types'

export const saveTokens = (data: TokenStorage): void => {
	console.log(`[TokenStorage] saveTokens: Сохранение токена для пользователя: ${data.username}`);
	localStorage.setItem('token', data.accessToken)

	if (data.refreshToken) {
		localStorage.setItem('refreshToken', data.refreshToken)
	}

	localStorage.setItem('username', data.username)
	console.log(`[TokenStorage] saveTokens: Токены для ${data.username} сохранены в localStorage.`);
}

export const getTokens = (): TokenStorage | null => {
	const accessToken = localStorage.getItem('token')

	if (!accessToken) return null

	return {
		accessToken,
		refreshToken: localStorage.getItem('refreshToken') || undefined,
		username: localStorage.getItem('username') || ''
	}
}

export const clearTokens = (): void => {
	localStorage.removeItem('token')
	localStorage.removeItem('refreshToken')
	localStorage.removeItem('username')
}