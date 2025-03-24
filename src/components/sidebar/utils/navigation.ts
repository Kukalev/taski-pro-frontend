/**
 * Проверяет, активен ли текущий путь или один из его подпутей
 * @param currentPath текущий путь (из location)
 * @param path путь для сравнения
 * @param exact требовать точное совпадение пути
 */
export const isPathActive = (currentPath: string, path: string, exact = false): boolean => {
	if (exact) {
			return currentPath === path
	}
	
	// Проверка на корневой путь /desk
	if (path === '/desk' && (currentPath === '/desk' || currentPath === '/desk/')) {
			return true
	}
	
	return currentPath.startsWith(path)
}

/**
* Возвращает путь к доске по ID
*/
export const getDeskPath = (id: number): string => {
	return `/desk/${id}`
}