// Типы для форм
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

// Типы для API запросов
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstname: string;
  lastname: string;
}

// Типы для API ответов
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

// Тип для ошибок
export interface ApiError {
  message: string;
  status?: number;
}