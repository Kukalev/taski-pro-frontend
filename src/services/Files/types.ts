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
 * Тип ответа от API при загрузке файла.
 * Бэкенд возвращает String/Void, поэтому здесь void.
 */
export type UploadFileResponse = void; 