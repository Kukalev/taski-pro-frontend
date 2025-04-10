import api from '../../../services/api' // Предполагаемый путь к вашему API клиенту
import {Task} from '../../task/types/task.types' // Предполагаемый путь к типу Task


export const getAllMyTasks = async (): Promise<Task[]> => {
  try {

    const response = await api.get<Task[]>('/v1/desk/mytasks');

    console.log("[GetAllMyTasks] Ответ сервера:", response.data);

    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    console.error("[GetAllMyTasks] Ошибка при получении задач пользователя:", error.response?.data || error.message);

    return [];
  }
};

