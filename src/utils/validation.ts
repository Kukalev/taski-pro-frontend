import { RegisterFormData, LoginFormData } from '../types/auth.types';

// Типы для результатов валидации
export interface ValidationResult<T> {
  isValid: boolean;
  fieldErrors: Record<keyof T, boolean>;
  message: string | null;
}

// Валидация формы регистрации
export const validateRegisterForm = (data: RegisterFormData): ValidationResult<RegisterFormData> => {
  const errors: Record<keyof RegisterFormData, boolean> = {
    firstName: false,
    lastName: false,
    email: false,
    password: false
  };
  
  let hasError = false;
  let message = null;
  
  // Проверяем имя
  if (!data.firstName.trim()) {
    errors.firstName = true;
    hasError = true;
  }
  
  // Проверяем фамилию
  if (!data.lastName.trim()) {
    errors.lastName = true;
    hasError = true;
  }
  
  // Проверяем email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email.trim() || !emailRegex.test(data.email)) {
    errors.email = true;
    hasError = true;
  }
  
  // Проверяем пароль
  if (!data.password || data.password.length < 6) {
    errors.password = true;
    hasError = true;
  }
  
  if (hasError) {
    message = 'Необходимо заполнить все подсвеченные поля';
  }
  
  return {
    isValid: !hasError,
    fieldErrors: errors,
    message
  };
};

// Валидация формы входа
export const validateLoginForm = (data: LoginFormData): ValidationResult<LoginFormData> => {
  const errors: Record<keyof LoginFormData, boolean> = {
    email: false,
    password: false
  };
  
  let hasError = false;
  let message = null;
  
  // Проверяем email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email.trim() || !emailRegex.test(data.email)) {
    errors.email = true;
    hasError = true;
  }
  
  // Проверяем пароль
  if (!data.password) {
    errors.password = true;
    hasError = true;
  }
  
  if (hasError) {
    message = 'Необходимо заполнить все подсвеченные поля';
  }
  
  return {
    isValid: !hasError,
    fieldErrors: errors,
    message
  };
};

// Вспомогательные функции для проверки отдельных полей
export const isEmailValid = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isPasswordValid = (password: string): boolean => {
  return password.length >= 6;
};

export const isNameValid = (name: string): boolean => {
  return name.trim().length > 0;
};