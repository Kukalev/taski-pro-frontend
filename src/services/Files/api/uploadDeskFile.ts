import api from '../../api'; // Путь к твоему экземпляру axios
import { UploadFileResponse } from '../types';

const BASE_URL = '/v1/storage'; // Базовый URL контроллера

/**
 * Загружает файл для указанной доски.
 * @param deskId ID доски
 * @param file Файл для загрузки
 * @returns Метаданные загруженного файла (в идеале) или void
 */
export const uploadDeskFile = async (deskId: number, file: File): Promise<UploadFileResponse | void> => {
  console.log(`[FilesService] Загрузка файла "${file.name}" для доски ${deskId}`);
  const formData = new FormData();
  formData.append('document', file); // Имя поля должно совпадать с @RequestParam на бэке ('document')

  const url = `${BASE_URL}/desks/${deskId}/documents`;

  try {
    // Бэкенд возвращает ResponseEntity<String>, поэтому тип ответа может быть не DeskFile
    // Если нужно получить метаданные, бэкенд должен их вернуть.
    // Пока что ожидаем void или обрабатываем как string, если нужно тело ответа.
    await api.put<string>(url, formData, { // Ожидаем string в ответе, но не используем его
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log(`[FilesService] Файл "${file.name}" успешно загружен для доски ${deskId}.`);
    // Если бы API возвращал DeskFile: return response.data;
    // Так как API возвращает String/Void, просто завершаем.
    // Можно вернуть мок-объект файла, если это нужно для UI немедленно:
    // return { id: file.name, filename: file.name, contentType: file.type, size: file.size, uploadDate: new Date().toISOString() };
  } catch (error) {
    console.error(`[FilesService] Ошибка при загрузке файла для доски ${deskId}:`, error);
    throw error; // Пробрасываем ошибку для обработки в UI
  }
}; 