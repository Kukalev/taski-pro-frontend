import api from '../../api'
import {DeskFile} from '../types'

const BASE_URL = '/v1/storage';


export const getDeskFiles = async (deskId: number): Promise<DeskFile[]> => {
  console.log(`[getDeskFiles] Запрос файлов для доски ${deskId} через /batch`);
  const url = `${BASE_URL}/desks/documents/batch`;

  try {
    const response = await api.get<Record<string, Record<string, string>>>(url, {
      params: {
        deskIds: [deskId]
      },
      paramsSerializer: params => {
          // Стандартный способ - несколько параметров с одинаковым именем
          return Object.entries(params)
            .map(([key, value]) => Array.isArray(value) ? value.map(v => `${key}=${encodeURIComponent(v)}`).join('&') : `${key}=${encodeURIComponent(value)}`)
            .join('&');
      }
    });

    console.log("[getDeskFiles] Ответ API:", response.data);

    // Извлекаем данные для нашего deskId
    const deskFilesMap = response.data?.[deskId.toString()];

    if (!deskFilesMap) {
        console.log(`[getDeskFiles] Файлы для доски ${deskId} не найдены в ответе.`);
        return []; // Файлов нет или ошибка в ответе
    }

    // Преобразуем ключи (имена файлов) в массив DeskFile (только с filename)
    const fileList: DeskFile[] = Object.keys(deskFilesMap).map(filename => ({
        id: filename, // Используем имя файла как ID
        filename: filename,
        // Остальные поля недоступны из этого API
        contentType: undefined,
        size: undefined,
        uploadDate: undefined,
    }));

    console.log(`[getDeskFiles] Сформирован список файлов:`, fileList);
    return fileList;

  } catch (error) {
    console.error(`[getDeskFiles] Ошибка при получении файлов для доски ${deskId} через /batch:`, error);
    return []; // Возвращаем пустой массив при ошибке
  }
}; 