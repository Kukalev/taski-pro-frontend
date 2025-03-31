
// Типы для ответов
export interface UserResponseDto {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface AddUserOnDeskDto{
  username: string;
  rightType: string;
}

export interface UsersOnDeskResponseDto {
  id: number;
  username: string;
  rightType: string;
}