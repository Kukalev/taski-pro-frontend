import {AuthService} from '../services/auth/Auth'

export enum UserRightType {
  CREATOR = 'CREATOR',
  CONTRIBUTOR = 'CONTRIBUTOR',
  MEMBER = 'MEMBER'
}

/**
 * Получает роль пользователя на указанной доске с логированием для отладки
 */
export const getUserRoleOnDesk = (deskUsers: any[], username?: string) => {
  // Отладочное логирование
  console.log('Получение роли на доске:', { deskUsers, providedUsername: username });
  
  if (!deskUsers || deskUsers.length === 0) {
    console.warn('DeskUsers массив пуст или не определен');
    return null;
  }
  
  // Если имя пользователя не указано, используем имя текущего пользователя
  const currentUsername = username || AuthService.getUsername();
  if (!currentUsername) {
    console.warn('Не удалось получить имя текущего пользователя');
    return null;
  }
  
  console.log('Ищем пользователя с именем:', currentUsername);
  
  // Находим пользователя в списке, с поддержкой разных форматов имен
  const user = deskUsers.find(u => {
    const userMatch = 
      (u.username && u.username.toLowerCase() === currentUsername.toLowerCase()) || 
      (u.userName && u.userName.toLowerCase() === currentUsername.toLowerCase());
    
    console.log('Проверяем пользователя:', u, 'Совпадение:', userMatch);
    return userMatch;
  });
  
  if (!user) {
    console.warn('Пользователь не найден в списке пользователей доски');
    return UserRightType.MEMBER; // По умолчанию даем роль MEMBER, если не найден
  }
  
  // Проверяем все возможные варианты полей для роли
  const role = user.rightType || user.role || user.type || user.userRightType || 'MEMBER';
  console.log('Определенная роль пользователя:', role);
  
  return role;
};

/**
 * Проверяет, может ли текущий пользователь редактировать доску
 */
export const canEditDesk = (deskUsers: any[]) => {
  const role = getUserRoleOnDesk(deskUsers);
  const canEdit = role === UserRightType.CREATOR || role === UserRightType.CONTRIBUTOR;
  console.log('Права на редактирование доски:', canEdit);
  return canEdit;
};

/**
 * Проверяет, является ли пользователь создателем доски
 */
export const isCreator = (deskUsers: any[]) => {
  const role = getUserRoleOnDesk(deskUsers);
  return role === UserRightType.CREATOR;
};

// Проверка, имеет ли пользователь права на создание задачи
export const canCreateTasks = (deskUsers: any[]): boolean => {
  const result = canEditDesk(deskUsers);
  console.log('Права на создание задач:', result);
  return result;
};

// Проверка, имеет ли пользователь права на редактирование задачи
export const canEditTask = (deskUsers: any[], task: any): boolean => {
  const username = AuthService.getUsername();
  const role = getUserRoleOnDesk(deskUsers);
  
  console.log('Проверка прав на редактирование задачи:', {
    username,
    role,
    task
  });

  // CREATOR и CONTRIBUTOR могут редактировать любую задачу
  if (role === UserRightType.CREATOR || role === UserRightType.CONTRIBUTOR) {
    console.log('Пользователь имеет роль CREATOR или CONTRIBUTOR, разрешено редактирование');
    return true;
  }

  // MEMBER может редактировать только если назначен исполнителем
  if (role === UserRightType.MEMBER) {
    const isExecutor = task?.executors?.includes(username);
    console.log('Пользователь имеет роль MEMBER, является исполнителем:', isExecutor);
    return isExecutor;
  }

  console.log('Роль пользователя не определена, редактирование запрещено');
  return false;
};

// Проверка, имеет ли пользователь права на управление участниками
export const canManageParticipants = (deskUsers: any[]): boolean => {
  const role = getUserRoleOnDesk(deskUsers);
  return role === UserRightType.CREATOR || role === UserRightType.CONTRIBUTOR;
};

// Проверка, имеет ли пользователь права на удаление задач/доски
export const canDeleteItems = (deskUsers: any[]): boolean => {
  const role = getUserRoleOnDesk(deskUsers);
  return role === UserRightType.CREATOR || role === UserRightType.CONTRIBUTOR;
};

// Проверка, является ли пользователь текущим
export const isCurrentUser = (username: string): boolean => {
  const currentUsername = AuthService.getUsername();
  return username.toLowerCase() === currentUsername.toLowerCase();
};