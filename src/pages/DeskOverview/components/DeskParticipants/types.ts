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
}

export interface ParticipantsListProps {
  participants: UserOnDesk[];
}

export interface ParticipantItemProps {
  user: UserOnDesk;
}
