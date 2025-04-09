// src/services/github/api/removeRepositoryFromDesk.ts
import api from '../../api'

const BASE_URL = '/v1/desk/'; // Уточнен

// Переименовано в camelCase
export const removeRepositoryFromDesk = async (
	deskId: number,
	repositoryId: number
): Promise<void> => {
	const url = `${BASE_URL}${deskId}/repositories/${repositoryId}`;
	console.log(`[removeRepositoryFromDesk] Удаление репозитория ID: ${repositoryId} с доски ID: ${deskId} по URL: ${url}...`);
	try {
		await api.delete(url);
		console.log('[removeRepositoryFromDesk] Репозиторий успешно удален.');
	} catch (error) {
		console.error('[removeRepositoryFromDesk] Ошибка при удалении репозитория:', error);
		throw error;
	}
};