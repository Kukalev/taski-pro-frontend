import api from '../../api'

const BASE_URL = '/v1/storage'; // Убедись, что этот URL совпадает с твоим API


export const deleteTaskFile = async (deskId: number, taskId: number, filename: string): Promise<void> => {
    console.log(`[FilesService] Удаление файла задачи "${filename}" (задача ${taskId}, доска ${deskId})`);
    // Кодируем имя файла для безопасной вставки в URL
    const encodedFilename = encodeURIComponent(filename);
    const url = `${BASE_URL}/desks/${deskId}/tasks/${taskId}/documents/${encodedFilename}`;

    try {
        await api.delete(url);
        console.log(`[FilesService] Файл задачи "${filename}" успешно удален.`);
    } catch (error) {
        console.error(`[FilesService] Ошибка при удалении файла задачи "${filename}":`, error);
        // Пробрасываем ошибку дальше
        throw error;
    }
}; 