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
    desk: import('../../../contexts/DeskContext').DeskData | null;
    updateLocalDesk: (updatedData: Partial<import('../../../contexts/DeskContext').DeskData>, isOptimistic?: boolean) => void;
    refreshDeskUsers: () => void;
    hasEditPermission: boolean;
    deskUsers: import('../../DeskOverview/components/DeskParticipants/types').UserOnDesk[];
    updateLocalUsers: (updater: (prevUsers: import('../../DeskOverview/components/DeskParticipants/types').UserOnDesk[]) => import('../../DeskOverview/components/DeskParticipants/types').UserOnDesk[]) => void;
    avatarsMap: Record<string, string | null>;
}



