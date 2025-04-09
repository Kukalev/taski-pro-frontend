// src/contexts/AuthContext.tsx
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef
} from 'react'
import {AuthService} from '../services/auth/Auth' // Импортируем твой AuthService
import { getColorOnUser } from '../services/colors/api/getColorOnUser'; // Убедись, что путь правильный
import { setMainColor, ThemeColorType } from '../styles/theme'; // Импортируем функции темы
import { getTokens } from '../services/auth/utils/TokenStorage'; // Для проверки токена при инициализации
import { UserProfile } from '../services/userSettings/types'; // <<< Импорт типа профиля
import { UserSettingsService } from '../services/userSettings/UserSettings'; // <<< Импорт сервиса профиля
import { AvatarService } from '../services/Avatar/Avatar'; // <<< Импорт сервиса аватара

// 5. Обновляем тип контекста
interface AuthContextType {
  isAuthenticated: boolean;
  isLoadingAuth: boolean; // Добавляем флаг загрузки
  currentUser: UserProfile | null; // <<< Добавляем пользователя
  avatarObjectUrl: string | null; // <<< Добавляем URL аватара
  // login теперь будет асинхронным, если нужно дождаться загрузки темы
  login: () => Promise<void>; // Изменяем сигнатуру login
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false); // Начинаем с false
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true); // Флаг начальной проверки
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null); // <<< Состояние для пользователя
  const [avatarObjectUrl, setAvatarObjectUrl] = useState<string | null>(null); // <<< Состояние для URL аватара

  // Ссылка для хранения *предыдущего* URL аватара, который нужно отозвать
  const previousAvatarUrlRef = useRef<string | null>(null);

  // Функция очистки Object URL
  const clearAvatarUrl = useCallback(() => {
      if (previousAvatarUrlRef.current) {
          console.log("[AuthContext] Отзыв предыдущего Object URL аватара:", previousAvatarUrlRef.current);
          URL.revokeObjectURL(previousAvatarUrlRef.current);
          previousAvatarUrlRef.current = null;
      }
      setAvatarObjectUrl(null);
  }, []);

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

  // Функция загрузки профиля и аватара
  const loadUserData = useCallback(async () => {
      console.log('[AuthContext] Попытка загрузки данных пользователя (профиль и аватар)...');
      try {
          const profile = await UserSettingsService.getCurrentUser();
          console.log('[AuthContext] Профиль пользователя загружен:', profile);
          setCurrentUser(profile);

          if (profile?.username) {
              console.log('[AuthContext] Запрос Blob аватара для', profile.username);
              const avatarBlob = await AvatarService.fetchUserAvatarBlob(profile.username);

              // Отзываем старый URL перед созданием нового
              clearAvatarUrl();

              if (avatarBlob) {
                  const newObjectUrl = URL.createObjectURL(avatarBlob);
                  setAvatarObjectUrl(newObjectUrl);
                  previousAvatarUrlRef.current = newObjectUrl; // Сохраняем для будущего отзыва
                  console.log('[AuthContext] Создан Object URL для аватара:', newObjectUrl);
              } else {
                  console.log('[AuthContext] Blob аватара не получен (возможно, 404).');
              }
          } else {
              // Если профиль есть, но нет username, или профиля нет - очищаем аватар
              clearAvatarUrl();
              console.log('[AuthContext] Профиль не содержит username, аватар не загружен.');
          }
          return profile; // Возвращаем профиль для дальнейшего использования если нужно
      } catch (error) {
          console.error('[AuthContext] Ошибка загрузки данных пользователя:', error);
          setCurrentUser(null);
          clearAvatarUrl(); // Очищаем аватар при ошибке
          return null; // Возвращаем null при ошибке
      }
  }, [clearAvatarUrl]); // Добавляем clearAvatarUrl в зависимости

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
        console.log('[AuthContext Initial Check] Загрузка данных пользователя и темы...');
        await loadUserData(); // <<< Загружаем профиль и аватар
        await loadAndApplyTheme();

      } else {
        console.log('[AuthContext Initial Check] Токены не найдены или невалидны. Установка isAuthenticated = false.');
        setIsAuthenticated(false);
        setCurrentUser(null); // <<< Сбрасываем пользователя
        clearAvatarUrl();    // <<< Сбрасываем аватар
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

  // Функция login теперь также загружает данные пользователя
  const login = useCallback(async () => {
    console.log('[AuthContext] login: Установка isAuthenticated = true и загрузка данных/темы...');
    setIsAuthenticated(true);
    await loadUserData(); // <<< Загружаем профиль и аватар
    await loadAndApplyTheme();
  }, [loadUserData, loadAndApplyTheme]);

  // Функция logout сбрасывает все
  const logout = useCallback(() => {
    console.log('[AuthContext] logout: Сброс состояния.');
    AuthService.logout(); // <<< Вызываем logout из сервиса (он удалит токены)
    setIsAuthenticated(false);
    setCurrentUser(null);
    clearAvatarUrl(); // <<< Очищаем аватар
    // Можно сбросить тему к дефолтной
    // setMainColor('teal');
    // Можно добавить редирект на страницу логина, если это еще не сделано где-то
    // window.location.href = '/login';
  }, [clearAvatarUrl]);

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
     isAuthenticated, isLoadingAuth, currentUser, avatarObjectUrl, login, logout
  }), [isAuthenticated, isLoadingAuth, currentUser, avatarObjectUrl, login, logout]);

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