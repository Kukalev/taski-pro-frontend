// Импортируем все наши API-функции
import {uploadDeskFile} from './api/uploadDeskFile'
import {getDeskFiles} from './api/getDeskFiles'
import {deleteDeskFile} from './api/deleteDeskFile'
import {getDeskFileDownloadUrl} from './api/getDeskFileDownloadUrl'


export const FilesService = {

    uploadFile: uploadDeskFile,


    getFiles: getDeskFiles,


    deleteFile: deleteDeskFile,


    getDownloadUrl: getDeskFileDownloadUrl,
};

// Экспортируем также типы из types.ts для удобства импорта в компонентах
export * from './types';


