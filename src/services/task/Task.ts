import api from '../api'
// Убедимся, что все нужные типы импортированы
import {Task, TaskUpdate, UpdateTaskStackData} from './types/task.types'

// Базовый URL для API задач
const BASE_URL = '/v1/desk';

// Получить все задачи для конкретной доски
export const getTasksByDeskId = async (deskId: number): Promise<Task[]> => {
	try {
		const response = await api.get(`${BASE_URL}/${deskId}/tasks`);
		// Добавим проверку, что response.data существует перед проверкой на массив
		return response?.data && Array.isArray(response.data) ? response.data : [];
	} catch (error) {
		console.error('Ошибка при получении задач:', error);
		return []; // Возвращаем пустой массив в случае любой ошибки
	}
};

// Создать новую задачу
export const createTask = async (deskId: number, taskName: string, statusType: string): Promise<Task> => {
	try {
		const response = await api.post<Task>(`${BASE_URL}/${deskId}/tasks/create`, {
			taskName, statusType
		});
		return response.data;
	} catch (error) {
		console.error('Ошибка при создании задачи:', error);
		throw error; // Пробрасываем ошибку для обработки выше
	}
};

// Обновить задачу - одна общая функция для любых обновлений
export const updateTask = async (deskId: number, taskId: number, updateData: Partial<TaskUpdate>): Promise<Task> => {
	try {
		console.log(`[TaskService.updateTask] Обновляем задачу ${taskId} в доске ${deskId}:`, updateData);
		const response = await api.put<Task>(`${BASE_URL}/${deskId}/tasks/${taskId}`, updateData);
		console.log('[TaskService.updateTask] Ответ сервера:', response.data);
		return response.data; // Возвращаем обновленную задачу
	} catch (error) {
		console.error(`[TaskService.updateTask] Ошибка при обновлении задачи ${taskId}:`, error);
		throw error;
	}
};

// Удалить задачу
export const deleteTask = async (deskId: number, taskId: number): Promise<void> => {
	try {
		console.log(`[TaskService.deleteTask] Удаление задачи ${taskId} в доске ${deskId}`);
		await api.delete(`${BASE_URL}/${deskId}/tasks/${taskId}`);
		console.log(`[TaskService.deleteTask] Задача ${taskId} успешно удалена.`);
	} catch (error) {
		console.error(`[TaskService.deleteTask] Ошибка при удалении задачи ${taskId}:`, error);
		throw error;
	}
};

// Обновить стек задачи
export const updateTaskStack = async (deskId: number, taskId: number, stackData: UpdateTaskStackData): Promise<void> => {
	try {
		const url = `${BASE_URL}/${deskId}/tasks/${taskId}/stack`;
		console.log(`[TaskService.updateTaskStack] Отправка PUT запроса на ${url} с телом:`, stackData);
		await api.put<void>(url, stackData);
		console.log(`[TaskService.updateTaskStack] Стек для задачи ${taskId} успешно обновлен.`);
	} catch (error) {
		console.error(`[TaskService.updateTaskStack] Ошибка при обновлении стека для задачи ${taskId}:`, error);
		throw error;
	}
};

// Группируем все функции в один объект TaskService для удобного импорта
export const TaskService = {
	getTasksByDeskId,
	createTask,
	updateTask,
	deleteTask,
	updateTaskStack
};

// Можно удалить отдельные export'ы, если используется только TaskService