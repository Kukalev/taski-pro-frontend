// src/contexts/AuthContext.tsx
import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { AuthService } from '../services/auth/Auth'; // Импортируем твой AuthService

interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void; // Функция для вызова ПОСЛЕ успешного сохранения токенов
  logout: () => void; // Функция для вызова ПЕРЕД очисткой токенов
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Инициализируем состояние на основе localStorage при первой загрузке
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(AuthService.isAuthenticated());

  const login = useCallback(() => {
    console.log('[AuthContext] login: Установка isAuthenticated = true');
    setIsAuthenticated(true);
    console.log('[AuthContext] login: Состояние isAuthenticated УСТАНОВЛЕНО в true');
  }, []);

  const logout = useCallback(() => {
    console.log('[AuthContext] logout: Установка isAuthenticated = false');
    setIsAuthenticated(false);
    // Дополнительно можно вызвать AuthService.logout() здесь, если он не вызывается извне
    // AuthService.logout(); // Раскомментируй, если нужно
  }, []);

  // Дополнительный слушатель storage для синхронизации между вкладками (опционально, но полезно)
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'token') {
        const currentAuthStatus = AuthService.isAuthenticated();
        if (currentAuthStatus !== isAuthenticated) {
          console.log(`[AuthContext] Storage event: Синхронизация состояния isAuthenticated на ${currentAuthStatus}`);
          setIsAuthenticated(currentAuthStatus);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isAuthenticated]); // Зависимость от isAuthenticated, чтобы не было лишних срабатываний

  const value = React.useMemo(() => ({
     isAuthenticated, login, logout
  }), [isAuthenticated, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};