export interface TokenStorage {
	accessToken: string;
	refreshToken?: string;
	username: string;
}

export const saveTokens = (data: TokenStorage): void => {
	console.log(`[TokenStorage] saveTokens: Сохранение токена для пользователя: ${data.username}`);
	localStorage.setItem('token', data.accessToken)

	if (data.refreshToken) {
		localStorage.setItem('refreshToken', data.refreshToken)
	}

	localStorage.setItem('username', data.username);
	localStorage.removeItem('userData');

	console.log(`[TokenStorage] saveTokens: Токены и username для ${data.username} сохранены.`);
}

export const getTokens = (): TokenStorage | null => {
	const accessToken = localStorage.getItem('token');
	const username = localStorage.getItem('username');

	if (!accessToken || !username) {
		return null;
	}

	return {
		accessToken,
		refreshToken: localStorage.getItem('refreshToken') || undefined,
		username: username
	};
}

export const clearTokens = (): void => {
	localStorage.removeItem('token')
	localStorage.removeItem('refreshToken')
	localStorage.removeItem('username')
	localStorage.removeItem('userData');
	console.log("[TokenStorage] clearTokens: Токены и username удалены.");
}