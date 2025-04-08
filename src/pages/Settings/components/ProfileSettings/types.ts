import { UserProfile } from "../../../../services/userSettings/types"; // Импортируем основной тип

export interface ProfileFormProps {
  userProfile: UserProfile | null; // Ожидаем объект профиля (или null во время загрузки)
  onUpdateSuccess?: (updatedProfile?: UserProfile) => void; // Колбэк при успехе
}

export interface UserAvatarProps {
  username: string;
  size?: 'sm' | 'md' | 'lg';
} 