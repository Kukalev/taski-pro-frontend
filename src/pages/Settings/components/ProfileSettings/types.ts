import { UserProfile } from "../../../../services/userSettings/types"; // Импортируем основной тип

export interface ProfileFormProps {
  userProfile: UserProfile | null; // Ожидаем объект профиля (или null во время загрузки)
  onUpdateSuccess?: (updatedProfile?: UserProfile) => void; // Колбэк при успехе
  onEmailChangeClick: () => void;
}

export interface UserAvatarProps {
  username: string;
  size?: 'sm' | 'md' | 'lg';
  avatarUrl?: string | null; // <-- Добавлено: URL аватара (может быть null)
  isEditable?: boolean;     // <-- Добавлено: Флаг редактируемости
  onClick?: () => void;       // <-- Добавлено: Обработчик клика
} 