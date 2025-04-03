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
  // Проверка на корректность массива пользователей
  if (!Array.isArray(deskUsers) || deskUsers.length === 0) {
    return UserRightType.MEMBER; // По умолчанию даем минимальные права
  }
  
  // Если имя пользователя не указано, используем имя текущего пользователя
  const currentUsername = username || AuthService.getUsername();
  if (!currentUsername) {
    return UserRightType.MEMBER; // Если не удалось получить имя пользователя, даем минимальные права
  }
  
  // Находим пользователя в списке
  const user = deskUsers.find(u => {
    if (!u) return false;
    
    return (u.username && u.username.toLowerCase() === currentUsername.toLowerCase()) || 
           (u.userName && u.userName.toLowerCase() === currentUsername.toLowerCase());
  });
  
  if (!user) {
    return UserRightType.MEMBER; // Если пользователь не найден, даем роль MEMBER
  }
  
  // Проверяем все возможные варианты полей для роли
  const role = user.rightType || user.role || user.type || user.userRightType || UserRightType.MEMBER;
  
  return role;
};

/**
 * Проверяет, может ли текущий пользователь редактировать доску
 */
export const canEditDesk = (deskUsers: any[]) => {
  const role = getUserRoleOnDesk(deskUsers);
  return role === UserRightType.CREATOR || role === UserRightType.CONTRIBUTOR;
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
  return canEditDesk(deskUsers);
};

// Проверка, имеет ли пользователь права на редактирование задачи
export const canEditTask = (deskUsers: any[], task: any): boolean => {
  const username = AuthService.getUsername();
  const role = getUserRoleOnDesk(deskUsers);

  // CREATOR и CONTRIBUTOR могут редактировать любую задачу
  if (role === UserRightType.CREATOR || role === UserRightType.CONTRIBUTOR) {
    return true;
  }

  // MEMBER может редактировать только если назначен исполнителем
  if (role === UserRightType.MEMBER) {
    const isExecutor = task?.executors?.includes(username);
    return isExecutor;
  }

  return false;
};

// Проверка, имеет ли пользователь права на перемещение и изменение статуса задачи
export const canMoveTask = (deskUsers: any[], task: any): boolean => {
  return canEditTask(deskUsers, task);
};

// Проверка, имеет ли пользователь права на изменение названия задачи
export const canEditTaskName = (deskUsers: any[], task: any): boolean => {
  const role = getUserRoleOnDesk(deskUsers);
  return role === UserRightType.CREATOR || role === UserRightType.CONTRIBUTOR;
};

// Проверка, имеет ли пользователь права на изменение описания задачи
export const canEditTaskDescription = (deskUsers: any[], task: any): boolean => {
  const role = getUserRoleOnDesk(deskUsers);
  return role === UserRightType.CREATOR || role === UserRightType.CONTRIBUTOR;
};

// Проверка, имеет ли пользователь права на изменение даты задачи
export const canEditTaskDate = (deskUsers: any[], task: any): boolean => {
  const role = getUserRoleOnDesk(deskUsers);
  return role === UserRightType.CREATOR || role === UserRightType.CONTRIBUTOR;
};

// Проверка, имеет ли пользователь права на изменение приоритета задачи
export const canEditTaskPriority = (deskUsers: any[], task: any): boolean => {
  const role = getUserRoleOnDesk(deskUsers);
  return role === UserRightType.CREATOR || role === UserRightType.CONTRIBUTOR;
};

// Проверка, имеет ли пользователь права на управление участниками
export const canManageParticipants = (deskUsers: any[]): boolean => {
  const role = getUserRoleOnDesk(deskUsers);
  return role === UserRightType.CREATOR || role === UserRightType.CONTRIBUTOR;
};

// Проверка, имеет ли пользователь права на управление исполнителями задачи
export const canManageExecutors = (deskUsers: any[], task: any): boolean => {
  const role = getUserRoleOnDesk(deskUsers);
  return role === UserRightType.CREATOR || role === UserRightType.CONTRIBUTOR;
};

// Проверка, имеет ли пользователь права на удаление задач/доски
export const canDeleteItems = (deskUsers: any[]): boolean => {
  // Проверка на существование и непустоту массива
  if (!Array.isArray(deskUsers) || deskUsers.length === 0) {
    return false; // Если массив не определён или пуст, запрещаем удаление
  }

  const role = getUserRoleOnDesk(deskUsers);
  return role === UserRightType.CREATOR || role === UserRightType.CONTRIBUTOR;
};

// Проверка, является ли пользователь текущим
export const isCurrentUser = (username: string): boolean => {
  const currentUsername = AuthService.getUsername();
  return username.toLowerCase() === currentUsername.toLowerCase();
};