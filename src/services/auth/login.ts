import api from '../api';
import { LoginRequest, AuthResponse } from '../../types/auth.types';

export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/auth/login', data);
    
    // Сохраняем токены
    if (response.data.accessToken) {
      localStorage.setItem('token', response.data.accessToken);
      
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
    }
    localStorage.setItem('username', data.username)
    
    return response.data;
  } catch (error) {
    throw error;
  }
};