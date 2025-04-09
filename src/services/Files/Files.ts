// Импортируем все наши API-функции
import {uploadDeskFile} from './api/uploadDeskFile'
import {getDeskFiles} from './api/getDeskFiles'
import {uploadTaskFile} from './api/uploadTaskFile'
import {getTaskFiles} from './api/getTaskFiles'
// Импортируем функции удаления
import {deleteDeskFile} from './api/deleteDeskFile'
import {deleteTaskFile} from './api/deleteTaskFile'


const getDownloadUrl = (deskId: number, filename: string): string => {
    // ЗАМЕНИ НА СВОЙ БАЗОВЫЙ URL API, ЕСЛИ НУЖНО
    const API_BASE_URL = 'http://localhost:8080/api';
    const BASE_STORAGE_URL = '/v1/storage'; // Из других файлов
    // Кодируем имя файла для безопасной вставки в URL
    const encodedFilename = encodeURIComponent(filename);
    return `${API_BASE_URL}${BASE_STORAGE_URL}/desks/${deskId}/documents/${encodedFilename}`;
};


export const FilesService = {

    uploadDeskFile: uploadDeskFile,


    getFiles: getDeskFiles,

    // Добавляем метод удаления
    deleteDeskFile: deleteDeskFile,

    // Добавляем метод удаления файла задачи
    deleteTaskFile: deleteTaskFile,

    /** Формирует URL для скачивания файла */
    getDownloadUrl: getDownloadUrl,

    /** Загружает файл для задачи */
    uploadTaskFile: uploadTaskFile,

    /** Получает список файлов (имен?) для задач */
    getTaskFiles: getTaskFiles,

};

// Экспортируем также типы из types.ts для удобства импорта в компонентах
export * from './types';



