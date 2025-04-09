import api from '../../api' // Путь к твоему экземпляру axios
import {UploadDeskFileResponse} from '../types'

const BASE_URL = '/v1/storage'; // Базовый URL контроллера


export const uploadDeskFile = async (deskId: number, file: File): Promise<UploadDeskFileResponse> => {
  console.log(`[FilesService] Загрузка файла "${file.name}" для доски ${deskId}`);
  const formData = new FormData();
  formData.append('document', file);

  const url = `${BASE_URL}/desks/${deskId}/documents`;

  try {

    await api.put<string>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log(`[FilesService] Файл "${file.name}" успешно загружен для доски ${deskId}.`);

  } catch (error) {
    console.error(`[FilesService] Ошибка при загрузке файла для доски ${deskId}:`, error);
    throw error; // Пробрасываем ошибку для обработки в UI
  }
}; 