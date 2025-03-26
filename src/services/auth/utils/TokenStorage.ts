import { TokenStorage } from '../types/Auth.types'

export const saveTokens = (data: TokenStorage): void => {
	localStorage.setItem('token', data.accessToken)

	if (data.refreshToken) {
		localStorage.setItem('refreshToken', data.refreshToken)
	}

	localStorage.setItem('username', data.username)
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
