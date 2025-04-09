/**
 * Представляет файл, прикрепленный к доске.
 */
export interface DeskFile {
  id: string | number; // Уникальный идентификатор файла (может быть UUID или число)
  filename: string;    // Имя файла
  contentType: string; // MIME-тип (e.g., 'image/png', 'application/pdf')
  size: number;        // Размер файла в байтах
  uploadDate: string;  // Дата загрузки в формате ISO строки
  downloadUrl: string; // URL для скачивания файла
  uploaderUsername?: string; // Кто загрузил (опционально)
}

/**
 * Тип для контекста, передаваемого через Outlet в DeskDetails
 */
export interface DeskOutletContext {
    desk: import('../desk/deskDetails/types').DeskData | null; // Тип доски из DeskDetails
    updateLocalDesk: (updatedData: Partial<import('../desk/deskDetails/types').DeskData>, isOptimistic?: boolean) => void;
    refreshDeskUsers: () => void;
    hasEditPermission: boolean;
    deskUsers: import('../../services/desk/types/desk.types').UserOnDesk[];
    updateLocalUsers: (updater: (prevUsers: import('../../services/desk/types/desk.types').UserOnDesk[]) => import('../../services/desk/types/desk.types').UserOnDesk[]) => void;
    avatarsMap: Record<string, string | null>;
}


