export const handleDeskError = (error: any): never => {
	if (error?.status === 401) {
		throw new Error('Необходима авторизация')
	}
	if (error?.status === 404) {
		throw new Error('Доска не найдена')
	}
	throw new Error(error?.message || 'Произошла ошибка при работе с доской')
}
