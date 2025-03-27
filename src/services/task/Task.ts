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

// Обновить задачу - одна общая функция для любых обновлений
export const updateTask = async (deskId: number, taskId: number, updateData: Partial<Task>): Promise<Task> => {
	try {
		console.log(`Обновляем задачу ${taskId} в доске ${deskId}:`, updateData);
		const response = await api.put(`${BASE_URL}/${deskId}/tasks/${taskId}`, updateData);
		console.log('Ответ сервера:', response.data);
		return response.data;
	} catch (error) {
		console.error('Ошибка при обновлении задачи:', error);
		throw error;
	}
};

