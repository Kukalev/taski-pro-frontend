/**
 * Метаданные файла, прикрепленного к доске.
 * ПРИМЕЧАНИЕ: Текущий API (/desks/documents/batch) возвращает только filename.
 * Для получения size, contentType, uploadDate нужен отдельный API эндпоинт
 * GET /desks/{deskId}/documents/list (или подобный).
 */
export interface DeskFile {
  id: string; // Используем filename как уникальный идентификатор в рамках доски
  filename: string;
  contentType?: string; // Недоступно из /batch
  size?: number;        // Недоступно из /batch
  uploadDate?: string;  // Недоступно из /batch
  uploaderUsername?: string; // Недоступно из /batch
}

/**
 * Тип ответа от API при загрузке файла для доски.
 */
export type UploadDeskFileResponse = void; // Бэкенд возвращает String/Void

/**
 * Тип ответа от API при загрузке файла для задачи.
 */
export type UploadTaskFileResponse = void; // Бэкенд возвращает String/Void

/**
 * Тип ответа для пакетной загрузки документов задач (GET /desks/{deskId}/tasks/batch).
 * Ключ внешнего Record - ID задачи (в виде строки).
 * Ключ внутреннего Record - имя файла (filename).
 * Значение внутреннего Record - вероятно, Base64 Data URI файла (как для аватаров),
 * но может быть и просто имя файла или другой идентификатор, нужно уточнить по факту ответа API.
 * Пока ставим string | null для гибкости.
 */
export type BatchTaskFilesResponse = Record<string, Record<string, string | null>>; 