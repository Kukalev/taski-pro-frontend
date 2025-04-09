import api from '../../api'

const BASE_URL = '/v1/storage'; // Убедись, что этот URL совпадает с твоим API


export const deleteDeskFile = async (deskId: number, filename: string): Promise<void> => {
    console.log(`[FilesService] Удаление файла "${filename}" с доски ${deskId}`);
    // Кодируем имя файла для безопасной вставки в URL
    const encodedFilename = encodeURIComponent(filename);
    const url = `${BASE_URL}/desks/${deskId}/documents/${encodedFilename}`;

    try {
        await api.delete(url);
        console.log(`[FilesService] Файл "${filename}" успешно удален с доски ${deskId}.`);
    } catch (error) {
        console.error(`[FilesService] Ошибка при удалении файла "${filename}" с доски ${deskId}:`, error);
        // Пробрасываем ошибку дальше, чтобы компонент мог ее обработать (например, показать уведомление)
        throw error; 
    }
}; 