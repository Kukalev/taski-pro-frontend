// src/services/github/api/getRepositoriesByDeskId.ts
import api from '../../api'
import {GitRepositoryResponseDto} from '../types'

const BASE_URL = '/api/v1/desk/'; // Уточнен

// Переименовано в camelCase
export const getRepositoriesByDeskId = async (
	deskId: number
): Promise<GitRepositoryResponseDto[]> => {
	const url = `${BASE_URL}${deskId}/repositories`;
	console.log(`[getRepositoriesByDeskId] Запрос репозиториев для доски ID: ${deskId} по URL: ${url}...`);
	try {
		const response = await api.get<GitRepositoryResponseDto[]>(url);
		console.log(`[getRepositoriesByDeskId] Успешно получено ${response.data.length} репозиториев.`);
		return response.data;
	} catch (error) {
		console.error('[getRepositoriesByDeskId] Ошибка при получении репозиториев:', error);
		throw error;
	}
};