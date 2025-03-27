import api from '../api'
import {Task} from './types/task.types'

// Базовый URL для API задач
const BASE_URL = 'api/v1/desk';

// Получить все задачи для конкретной доски
export const getTasksByDeskId = async (deskId: number): Promise<Task[]> => {
	try {
		const response = await api.get(`${BASE_URL}/${deskId}/tasks`);
		return Array.isArray(response.data) ? response.data : [];
	} catch (error) {
		console.error('Ошибка при получении задач:', error);
		return [];
	}
};

// Создать новую задачу
export const createTask = async (deskId: number, taskName: string, statusType: string): Promise<Task> => {
	try {
		const response = await api.post(`${BASE_URL}/${deskId}/tasks/create`, {
			taskName, statusType
		});
		return response.data;
	} catch (error) {
		console.error('Ошибка при создании задачи:', error);
		throw error;
	}
};

