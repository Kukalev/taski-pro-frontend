import api from '../../api' // Путь к твоему экземпляру axios

const BASE_URL = '/v1/storage'; // Базовый URL контроллера

export const uploadTaskFile = async (deskId: number, taskId: number, file: File): Promise<void> => {
  console.log(`[uploadTaskFile] Загрузка файла "${file.name}" для задачи ${taskId} в доске ${deskId}`);
  const formData = new FormData();
  // Ключ 'document' совпадает с @RequestParam MultipartFile document в контроллере
  formData.append('document', file);

  const url = `${BASE_URL}/desks/${deskId}/tasks/${taskId}`;

  try {
    // Используем PUT, как в контроллере
    await api.put<string>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log(`[uploadTaskFile] Файл "${file.name}" успешно загружен для задачи ${taskId}.`);
  } catch (error) {
    console.error(`[uploadTaskFile] Ошибка при загрузке файла для задачи ${taskId}:`, error);
    throw error; // Пробрасываем ошибку для обработки в UI
  }
}; 