import { RightType } from '../../../../services/users/api/UpdateUserFromDesk';

// Простой интерфейс для пользователя на доске
export interface UserOnDesk {
  id: number;
  userName?: string;
  username?: string;
  rightType: string;
  // Добавим опциональные поля, если они могут приходить из разных источников
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface DeskParticipantsProps {
  desk: {
    id: number;
    [key: string]: any;
  };
  deskUsers: UserOnDesk[]; // Получаем актуальный список для проверки прав и начального рендера
  hasEditPermission?: boolean;
  refreshDeskUsers: () => void; // <--- Меняем refreshDesk на refreshDeskUsers
}

export interface ParticipantsListProps {
  participants: UserOnDesk[]; // Используем UserOnDesk
  onDeleteUser: (userId: number) => void;
  onUpdateUserRole: (userId: number, rightType: RightType) => void;
  currentUserRole: string;
}

export interface ParticipantItemProps {
  user: UserOnDesk; // Используем UserOnDesk
  onDeleteUser: (userId: number) => void;
  onUpdateUserRole: (userId: number, rightType: RightType) => void;
  currentUserRole: string;
}

// RoleMenuProps больше не используется, удаляем или оставляем если нужно
/*
export interface RoleMenuProps {
  userId: number;
  currentRole: string;
  onUpdateRole: (userId: number, rightType: RightType) => void;
  isOpen: boolean;
  onClose: () => void;
}
*/
