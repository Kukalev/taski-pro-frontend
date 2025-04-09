
export interface DeskFile {
  id: string; // Используем filename как уникальный идентификатор в рамках доски
  filename: string;
  contentType?: string; // Недоступно из /batch
  size?: number;        // Недоступно из /batch
  uploadDate?: string;  // Недоступно из /batch
  uploaderUsername?: string; // Недоступно из /batch
}


export type UploadDeskFileResponse = void; // Бэкенд возвращает String/Void


export type UploadTaskFileResponse = void; // Бэкенд возвращает String/Void


export type BatchTaskFilesResponse = Record<string, Record<string, string | null>>; 