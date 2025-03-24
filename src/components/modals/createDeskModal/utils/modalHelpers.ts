/**
 * Проверяет валидность данных доски
 */
export const validateDeskData = (name: string): boolean => {
	return name.trim() !== ''
}

/**
 * Форматирует сообщение об ошибке для отображения в модальном окне
 */
export const formatErrorMessage = (error: unknown): string => {
	if (typeof error === 'string') return error
	if (error instanceof Error) return error.message
	return 'Произошла неизвестная ошибка'
}
