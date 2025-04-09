// Импортируем все наши API-функции
import {uploadDeskFile} from './api/uploadDeskFile'
import {getDeskFiles} from './api/getDeskFiles'
// Импортируем и функцию удаления, если она есть (или будет)
// import { deleteDeskFile } from './api/deleteDeskFile';

/**
 * Формирует полный URL для скачивания файла.
 * @param deskId - ID доски.
 * @param filename - Имя файла.
 * @returns Полный URL для скачивания.
 */
const getDownloadUrl = (deskId: number, filename: string): string => {
    // ЗАМЕНИ НА СВОЙ БАЗОВЫЙ URL API, ЕСЛИ НУЖНО
    const API_BASE_URL = 'http://localhost:8080/api';
    const BASE_STORAGE_URL = '/v1/storage'; // Из других файлов
    // Кодируем имя файла для безопасной вставки в URL
    const encodedFilename = encodeURIComponent(filename);
    return `${API_BASE_URL}${BASE_STORAGE_URL}/desks/${deskId}/documents/${encodedFilename}`;
};

export const FilesService = {

    uploadFile: uploadDeskFile,


    getFiles: getDeskFiles,

    // /** Удаляет файл с доски (раскомментируй, если есть функция) */
    // deleteFile: deleteDeskFile,

    /** Формирует URL для скачивания файла */
    getDownloadUrl: getDownloadUrl,

};

// Экспортируем также типы из types.ts для удобства импорта в компонентах
export * from './types';



