import { UserOnDesk } from './types';

// Функция для получения имени пользователя (username или userName)
export const getUserName = (user: UserOnDesk): string => {
  return user.username || user.userName || 'Неизвестный пользователь';
};

// Функция для получения инициалов пользователя
export const getUserInitials = (user: UserOnDesk): string => {
  const name = getUserName(user);
  return name !== 'Неизвестный пользователь' ? name.charAt(0).toUpperCase() : '?';
};

// Функция для получения отображаемого имени роли
export const getRoleDisplayName = (rightType: string) => {
  switch (rightType) {
    case 'CREATOR': return 'Создатель';
    case 'CONTRIBUTOR': return 'Редактирование';
    case 'MEMBER': return 'Чтение';
    default: return 'Участник';
  }
};

// Функция для определения цвета бейджа роли
export const getRoleBadgeClass = (rightType: string) => {
  switch (rightType) {
    case 'CREATOR': return 'bg-red-100 text-red-800'; // Красный для создателя
    case 'CONTRIBUTOR': return 'bg-blue-100 text-blue-800';
    case 'MEMBER': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};
