export const AuthService = {
	isAuthenticated(): boolean {
		const token = localStorage.getItem('token')
		return !!token
	},

	// Добавим новый метод для получения имени пользователя
	getUsername(): string {
		// Напрямую получаем имя пользователя из localStorage
		return localStorage.getItem('username') || ''
	},

	logout() {
		localStorage.removeItem('token')
		localStorage.removeItem('refreshToken')
		localStorage.removeItem('username') // Важно очищать и username при выходе
		window.location.href = '/register'
	}
}
