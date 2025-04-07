// src/contexts/AuthContext.tsx
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'
import {AuthService} from '../services/auth/Auth' // Импортируем твой AuthService


// 5. Обновляем тип контекста
interface AuthContextType {
  isAuthenticated: boolean;
  // login больше не принимает данные
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);



export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // --- Оставляем только isAuthenticated ---
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => AuthService.isAuthenticated());
  

  // login просто устанавливает флаг
  const login = useCallback(() => {
    console.log('[AuthContext] login: Установка isAuthenticated = true');
    setIsAuthenticated(true);
  }, []);

  // logout просто сбрасывает флаг
  const logout = useCallback(() => {
    console.log('[AuthContext] logout: Установка isAuthenticated = false');
    setIsAuthenticated(false);
    // Фактический выход (очистка localStorage, редирект) делается через AuthService.logout() извне
  }, []);

  // --- Убираем useEffect для восстановления сессии по данным пользователя ---
  // useEffect(() => { ... });

  // --- Слушатель storage --- (можно оставить, но он будет реагировать только на 'token')
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
       // Слушаем только изменение токена или username
       if (event.key === 'token' || event.key === 'username') {
         console.log(`[AuthContext] Storage event: Обнаружено изменение ключа '${event.key}'. Проверка статуса аутентификации...`);
         const currentAuthStatus = AuthService.isAuthenticated();
         if (currentAuthStatus !== isAuthenticated) {
            console.log(`[AuthContext] Storage event: Синхронизация состояния isAuthenticated на ${currentAuthStatus}`);
            setIsAuthenticated(currentAuthStatus);
            // Если разлогинились в другой вкладке, делаем редирект и здесь
            if (!currentAuthStatus && window.location.pathname !== '/login' && window.location.pathname !== '/register') {
                 console.log('[AuthContext] Storage event: Обнаружен выход в другой вкладке, редирект на /login');
                 window.location.href = '/login';
            }
         }
       }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
       window.removeEventListener('storage', handleStorageChange);
    };
  }, [isAuthenticated]); // Добавляем зависимость, чтобы сравнивать с актуальным состоянием

  // Обновляем значение контекста
  const value = useMemo(() => ({
     isAuthenticated, login, logout
  }), [isAuthenticated, login, logout]);

  // --- Убираем проверку isLoading ---
  // if (isLoading) { ... }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};