/**
 * Получаем инициалы пользователя из имени
 */
export const getUserInitials = (username: string): string => {
	if (!username) return 'U'
	return username.charAt(0).toUpperCase()
}
