import api from '../../api'
import {BatchTaskFilesResponse, DeskFile} from '../types'

const BASE_URL = '/v1/storage';


export const getTaskFiles = async (deskId: number, taskIds: number[]): Promise<DeskFile[]> => {
  console.log(`[getTaskFiles] Запрос файлов для задач ${taskIds.join(', ')} в доске ${deskId}`);
  const url = `${BASE_URL}/desks/${deskId}/tasks/batch`;

  if (taskIds.length === 0) {
    console.log('[getTaskFiles] Массив taskIds пуст, запрос не выполняется.');
    return []; // Возвращаем пустой массив
  }

  // Берем ID первой задачи для извлечения данных
  const targetTaskId = taskIds[0];

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

    // Извлекаем данные для конкретной (первой) задачи
    const taskFilesMap = response.data?.[targetTaskId.toString()];

    if (!taskFilesMap) {
        console.log(`[getTaskFiles] Файлы для задачи ${targetTaskId} не найдены в ответе.`);
        return []; // Файлов нет или ошибка в ответе
    }

    // Преобразуем ключи (имена файлов) в массив DeskFile (только с filename)
    const fileList: DeskFile[] = Object.keys(taskFilesMap).map(filename => ({
        id: filename, // Используем имя файла как ID
        filename: filename,
        // Остальные поля недоступны из этого API
        contentType: undefined,
        size: undefined,
        uploadDate: undefined,
    }));

    console.log(`[getTaskFiles] Сформирован список файлов для задачи ${targetTaskId}:`, fileList);
    return fileList; // Возвращаем массив файлов

  } catch (error) {
    console.error(`[getTaskFiles] Ошибка при получении файлов для задач в доске ${deskId}:`, error);
    return []; // Возвращаем пустой массив при ошибке
  }
}; 