export const handleUserError = (error: any): never => {
	if (error?.status === 401) {
		throw new Error('Необходима авторизация');
	}
	if (error?.status === 404) {
		throw new Error('Пользователь не найден');
	}
	if (error?.status === 403) {
		throw new Error('Недостаточно прав для выполнения операции');
	}
	throw new Error(error?.message || 'Произошла ошибка при работе с пользователем');
};