import { RightType } from '../../../../services/users/api/UpdateUserFromDesk';

// Простой интерфейс для пользователя на доске
export interface UserOnDesk {
  id: number;
  userName?: string; 
  username?: string;
  rightType: string;
}

export interface DeskParticipantsProps {
  desk: {
    id: number;
    [key: string]: any;
  };
  hasEditPermission?: boolean;
}

export interface ParticipantsListProps {
  participants: UserOnDesk[];
  onDeleteUser: (userId: number) => void;
  onUpdateUserRole: (userId: number, rightType: RightType) => void;
  currentUserRole: string;
}

export interface ParticipantItemProps {
  user: UserOnDesk;
  onDeleteUser: (userId: number) => void;
  onUpdateUserRole: (userId: number, rightType: RightType) => void;
  currentUserRole: string;
}

export interface RoleMenuProps {
  userId: number;
  currentRole: string;
  onUpdateRole: (userId: number, rightType: RightType) => void;
  isOpen: boolean;
  onClose: () => void;
}
