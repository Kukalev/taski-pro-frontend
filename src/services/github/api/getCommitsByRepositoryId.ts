// src/services/github/api/getCommitsByRepositoryId.ts
import api from '../../api'
import {GitCommitResponseDto} from '../types'

const BASE_URL = '/v1/desk/'; // Уточнен

// Переименовано в camelCase
export const getCommitsByRepositoryId = async (
	deskId: number,
	repositoryId: number
): Promise<GitCommitResponseDto[]> => {
	const url = `${BASE_URL}${deskId}/repositories/${repositoryId}`;
	console.log(`[getCommitsByRepositoryId] Запрос коммитов для репозитория ID: ${repositoryId} на доске ID: ${deskId} по URL: ${url}...`);
	try {
		const response = await api.get<GitCommitResponseDto[]>(url);
		console.log(`[getCommitsByRepositoryId] Успешно получено ${response.data.length} коммитов.`);
		return response.data; // Возвращаем как есть, без преобразования Date
	} catch (error) {
		console.error('[getCommitsByRepositoryId] Ошибка при получении коммитов:', error);
		throw error;
	}
};