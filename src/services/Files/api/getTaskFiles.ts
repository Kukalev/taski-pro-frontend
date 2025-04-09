import api from '../../api';
import { BatchTaskFilesResponse } from '../types'; // Импортируем новый тип

const BASE_URL = '/v1/storage';

/**
 * Получает списки имен файлов для нескольких задач в рамках одной доски.
 * @param deskId - ID доски.
 * @param taskIds - Массив ID задач.
 * @returns Promise с объектом, где ключ - ID задачи (строка), значение - объект { filename: base64DataUri }.
 */
export const getTaskFiles = async (deskId: number, taskIds: number[]): Promise<BatchTaskFilesResponse> => {
  console.log(`[getTaskFiles] Запрос файлов для задач ${taskIds.join(', ')} в доске ${deskId}`);
  const url = `${BASE_URL}/desks/${deskId}/tasks/batch`;

  if (taskIds.length === 0) {
    console.log('[getTaskFiles] Массив taskIds пуст, запрос не выполняется.');
    return {}; // Возвращаем пустой объект, если нет ID задач
  }

  try {
    // Используем GET с параметрами запроса
    const response = await api.get<BatchTaskFilesResponse>(url, {
      params: {
        taskIds: taskIds // Передаем массив ID
      },
      paramsSerializer: params => {
        // Сериализатор для отправки массива как ?taskIds=1&taskIds=2&taskIds=3
        let result = '';
        Object.keys(params).forEach(key => {
          const value = params[key];
          if (Array.isArray(value)) {
            value.forEach(val => {
              if (result !== '') result += '&';
              result += key + '=' + encodeURIComponent(val);
            });
          } else {
             if (result !== '') result += '&';
             result += key + '=' + encodeURIComponent(value);
          }
        });
        return result;
      }
    });

    console.log("[getTaskFiles] Ответ API:", response.data);
    return response.data || {}; // Возвращаем данные или пустой объект

  } catch (error) {
    console.error(`[getTaskFiles] Ошибка при получении файлов для задач в доске ${deskId}:`, error);
    return {}; // Возвращаем пустой объект при ошибке
  }
}; 