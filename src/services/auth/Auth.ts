import {login} from './api/LoginApi'
import {register} from './api/RegisterApi'
import {clearTokens} from './utils/TokenStorage'

export const AuthService = {
	login,
	register,

	isAuthenticated(): boolean {
		const token = localStorage.getItem('token')
		return !!token
	},

	getUsername(): string {
		return localStorage.getItem('username') || ''
	},

	logout() {
		clearTokens()
		window.location.href = '/login'
	}
}
