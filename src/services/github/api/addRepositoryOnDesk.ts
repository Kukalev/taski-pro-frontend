// src/services/github/api/addRepositoryOnDesk.ts
import api from '../../api'
import {AddGitRepositoryDto, GitRepositoryResponseDto} from '../types'

const BASE_URL = '/api/v1/desk/'; // Уточнен

// Переименовано в camelCase
export const addRepositoryOnDesk = async (
	deskId: number,
	repositoryData: AddGitRepositoryDto
): Promise<GitRepositoryResponseDto> => {
	const url = `${BASE_URL}${deskId}/repositories`;
	console.log(`[addRepositoryOnDesk] Добавление репозитория к доске ID: ${deskId} по URL: ${url}...`);
	try {
		const response = await api.post<GitRepositoryResponseDto>(
			url,
			repositoryData
		);
		console.log('[addRepositoryOnDesk] Репозиторий успешно добавлен:', response.data);
		return response.data;
	} catch (error) {
		console.error('[addRepositoryOnDesk] Ошибка при добавлении репозитория:', error);
		throw error; // Перебрасываем для обработки выше
	}
};