// src/services/github/api/syncRepository.ts
import api from '../../api'

const BASE_URL = '/v1/desk/'; // Уточнен

// Переименовано в camelCase
export const syncRepository = async (
	deskId: number,
	repositoryId: number
): Promise<void> => {
	const url = `${BASE_URL}${deskId}/repositories/${repositoryId}`;
	console.log(`[syncRepository] Запрос на синхронизацию репозитория ID: ${repositoryId} на доске ID: ${deskId} по URL: ${url}...`);
	try {
		await api.post(url); // POST запрос согласно контроллеру
		console.log('[syncRepository] Запрос на синхронизацию успешно отправлен.');
	} catch (error) {
		console.error('[syncRepository] Ошибка при запросе синхронизации:', error);
		throw error;
	}
};