// src/contexts/AuthContext.tsx
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'
import {AuthService} from '../services/auth/Auth' // Импортируем твой AuthService
import { getColorOnUser } from '../services/colors/api/getColorOnUser'; // Убедись, что путь правильный
import { setMainColor, ThemeColorType } from '../styles/theme'; // Импортируем функции темы
import { getTokens } from '../services/auth/utils/TokenStorage'; // Для проверки токена при инициализации

// 5. Обновляем тип контекста
interface AuthContextType {
  isAuthenticated: boolean;
  isLoadingAuth: boolean; // Добавляем флаг загрузки
  // login теперь будет асинхронным, если нужно дождаться загрузки темы
  login: () => Promise<void>; // Изменяем сигнатуру login
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false); // Начинаем с false
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true); // Флаг начальной проверки

  // Функция загрузки и применения темы
  const loadAndApplyTheme = useCallback(async () => {
    console.log('[AuthContext] Загрузка и применение темы пользователя...');
    const savedColor = await getColorOnUser(); // Эта функция возвращает 'orange' при 401/404

    if (savedColor) {
       console.log(`[AuthContext] Тема пользователя ${savedColor} загружена и применена.`);
       setMainColor(savedColor); // Применяем цвет с сервера ИЛИ 'orange' (из getColorOnUser)
    } else {
       // Сюда попадем ТОЛЬКО если getColorOnUser вернул null (НЕОЖИДАННАЯ ошибка)
       console.warn('[AuthContext] getColorOnUser вернул null (неожиданная ошибка). Применение ORANGE по умолчанию.');
       // Устанавливаем ORANGE как fallback даже для неожиданных ошибок
       setMainColor('orange'); // <-- ИЗМЕНЕНО С 'teal'
    }
  }, []);

  // ИЗМЕНЕННАЯ Начальная проверка аутентификации при монтировании
  useEffect(() => {
    const checkInitialAuth = async () => {
      setIsLoadingAuth(true);
      const tokensExist = !!getTokens()?.accessToken; 
      const initialAuthStatus = AuthService.isAuthenticated(); 

      console.log(`[AuthContext Initial Check] Tokens Exist: ${tokensExist}, AuthService reports: ${initialAuthStatus}`);

      if (tokensExist && initialAuthStatus) {
        console.log('[AuthContext Initial Check] Токены есть, статус ОК. Установка isAuthenticated = true.');
        setIsAuthenticated(true);
        console.log('[AuthContext Initial Check] Попытка загрузки темы пользователя при восстановлении сессии...');
        await loadAndApplyTheme(); // Загружаем тему (или 'orange')

      } else {
        console.log('[AuthContext Initial Check] Токены не найдены или невалидны. Установка isAuthenticated = false.');
        setIsAuthenticated(false);
        // Тему не устанавливаем, пусть будет как есть или как CSS задаст
        if (tokensExist && !initialAuthStatus) {
             console.log('[AuthContext Initial Check] Очистка невалидных токенов.');
             AuthService.logout(); 
        }
      }
      // Устанавливаем isLoadingAuth = false ПОСЛЕ всех проверок и установок состояния
      setIsLoadingAuth(false); 
      console.log('[AuthContext Initial Check] Проверка завершена.');
    };
    checkInitialAuth();
  // Зависимости оставляем пустыми, т.к. loadAndApplyTheme используется внутри
  }, []); 

  // Функция login теперь также загружает тему
  const login = useCallback(async () => {
    console.log('[AuthContext] login: Установка isAuthenticated = true и загрузка темы...');
    setIsAuthenticated(true);
    await loadAndApplyTheme(); // Загрузит тему или 'orange'
  }, [loadAndApplyTheme]);

  // Функция logout сбрасывает флаг и применяет дефолтную тему
  const logout = useCallback(() => {
    console.log('[AuthContext] logout: Установка isAuthenticated = false.');
    setIsAuthenticated(false);
    // Тему не трогаем
  }, []);

  // Слушатель storage (оставляем для синхронизации вкладок)
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
       if (event.key === 'token' || event.key === 'username') {
         console.log(`[AuthContext] Storage event: Key '${event.key}' changed. Re-checking auth status.`);
         const currentAuthStatus = AuthService.isAuthenticated();
         if (currentAuthStatus !== isAuthenticated) {
            console.log(`[AuthContext] Storage event: Syncing isAuthenticated to ${currentAuthStatus}`);
            setIsAuthenticated(currentAuthStatus);
            if (!currentAuthStatus) {
                // Если разлогинились, применяем дефолтную тему и редиректим
                setMainColor('teal');
                if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
                    console.log('[AuthContext] Storage event: Logout detected in another tab, redirecting...');
                    window.location.href = '/login'; // Полный редирект
                }
            } else {
                // Если залогинились в другой вкладке, нужно перезагрузить тему и здесь
                console.log('[AuthContext] Storage event: Login detected in another tab, reloading theme...');
                loadAndApplyTheme();
            }
         }
       }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
       window.removeEventListener('storage', handleStorageChange);
    };
  }, [isAuthenticated, loadAndApplyTheme]); // Добавили loadAndApplyTheme

  // Мемоизируем значение контекста
  const value = useMemo(() => ({
     isAuthenticated, isLoadingAuth, login, logout
  }), [isAuthenticated, isLoadingAuth, login, logout]);

  // Можно добавить отображение лоадера на весь экран, пока идет начальная проверка
  // if (isLoadingAuth) {
  //   return <div>Загрузка аутентификации...</div>; // Или компонент лоадера
  // }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};