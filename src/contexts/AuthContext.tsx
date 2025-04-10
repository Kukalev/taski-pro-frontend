import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import {AuthService} from '../services/auth/Auth'
import {getColorOnUser} from '../services/colors/api/getColorOnUser'
import {setMainColor, ThemeColorType} from '../styles/theme'
import {getTokens} from '../services/auth/utils/TokenStorage'
import {UserProfile} from '../services/userSettings/types'
import {UserSettingsService} from '../services/userSettings/UserSettings'
import {AvatarService} from '../services/Avatar/Avatar'
// --- ДОБАВЛЕНЫ ПРАВИЛЬНЫЕ ИМПОРТЫ ДЛЯ ФОНА ---
import {AppearanceService} from '../services/colors/Appearance'
import {BackgroundOption, backgroundOptions} from '../styles/backgrounds'
// --- КОНЕЦ ДОБАВЛЕННЫХ ИМПОРТОВ ---

// --- Функция применения фона ---
const applyBackgroundTheme = (bgThemeId: string) => {
  const selectedOption = backgroundOptions.find(opt => opt.id === bgThemeId);
  const styleValue = selectedOption ? selectedOption.styleValue : "url('/default.png')"; // Дефолт, если не найден

  console.log(`[applyBackgroundTheme] Применение фона ID: ${bgThemeId}, CSS: ${styleValue}`);
  document.documentElement.style.setProperty('--app-background-image', styleValue);
  document.documentElement.style.setProperty('--app-background-size', 'cover');
  document.documentElement.style.setProperty('--app-background-position', 'center');
  document.documentElement.style.setProperty('--app-background-repeat', 'no-repeat');
};

// Обновляем тип контекста, добавляя управление фоном
interface AuthContextType {
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  currentUser: UserProfile | null;
  avatarObjectUrl: string | null;
  selectedBgThemeId: string; // ID текущего фона (строка)
  login: () => Promise<void>;
  logout: () => void;
  changeBgTheme: (bgThemeId: string) => Promise<void>; // Функция смены фона
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [avatarObjectUrl, setAvatarObjectUrl] = useState<string | null>(null);
  const [selectedBgThemeId, setSelectedBgThemeId] = useState<string>('default'); // Начинаем с дефолтного

  const previousAvatarUrlRef = useRef<string | null>(null);

  const clearAvatarUrl = useCallback(() => {
    if (previousAvatarUrlRef.current) {
      console.log("[AuthContext] Отзыв предыдущего Object URL аватара:", previousAvatarUrlRef.current);
      URL.revokeObjectURL(previousAvatarUrlRef.current);
      previousAvatarUrlRef.current = null;
    }
    setAvatarObjectUrl(null);
  }, []);

  // Функция загрузки и применения ЦВЕТОВОЙ темы
  const loadAndApplyColorTheme = useCallback(async () => {
    console.log('[AuthContext] Загрузка и применение ЦВЕТОВОЙ темы пользователя...');
    const savedColor = await getColorOnUser();
    if (savedColor) {
      console.log(`[AuthContext] ЦВЕТОВАЯ тема ${savedColor} загружена и применена.`);
      setMainColor(savedColor);
    } else {
      console.warn('[AuthContext] getColorOnUser вернул null/ошибку. Применение ORANGE по умолчанию.');
      setMainColor('orange');
    }
  }, []);

  // Функция загрузки и применения ФОНОВОЙ темы
  const loadAndApplyBackgroundTheme = useCallback(async () => {
    console.log('[AuthContext] Загрузка и применение ФОНОВОЙ темы пользователя...');
    const savedBgId = await AppearanceService.getBackgroundId(); // Получаем строковый ID
    console.log(`[AuthContext] ФОНОВАЯ тема ${savedBgId} загружена.`);
    setSelectedBgThemeId(savedBgId); // Обновляем состояние
    applyBackgroundTheme(savedBgId); // Применяем стили
  }, []); // Зависимостей нет, т.к. использует только AppearanceService и applyBackgroundTheme


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
        clearAvatarUrl();
        if (avatarBlob) {
          const newObjectUrl = URL.createObjectURL(avatarBlob);
          setAvatarObjectUrl(newObjectUrl);
          previousAvatarUrlRef.current = newObjectUrl;
          console.log('[AuthContext] Создан Object URL для аватара:', newObjectUrl);
        } else {
          console.log('[AuthContext] Blob аватара не получен.');
        }
      } else {
        clearAvatarUrl();
        console.log('[AuthContext] Профиль не содержит username или отсутствует, аватар не загружен.');
      }
      return profile;
    } catch (error) {
      console.error('[AuthContext] Ошибка загрузки данных пользователя:', error);
      setCurrentUser(null);
      clearAvatarUrl();
      return null;
    }
  }, [clearAvatarUrl]);

  // Начальная проверка аутентификации
  useEffect(() => {
    const checkInitialAuth = async () => {
      setIsLoadingAuth(true);
      const tokensExist = !!getTokens()?.accessToken;
      const initialAuthStatus = AuthService.isAuthenticated();

      console.log(`[AuthContext Initial Check] Tokens Exist: ${tokensExist}, AuthService reports: ${initialAuthStatus}`);

      if (tokensExist && initialAuthStatus) {
        console.log('[AuthContext Initial Check] Токены есть, статус ОК. Установка isAuthenticated = true.');
        setIsAuthenticated(true);
        console.log('[AuthContext Initial Check] Загрузка данных пользователя, цветовой и фоновой темы...');
        await loadUserData();
        await loadAndApplyColorTheme();
        await loadAndApplyBackgroundTheme(); // <<< ВЫЗОВ ФОНА

      } else {
        console.log('[AuthContext Initial Check] Токены не найдены или невалидны. Установка isAuthenticated = false.');
        setIsAuthenticated(false);
        setCurrentUser(null);
        clearAvatarUrl();
        console.log('[AuthContext] Пользователь не аутентифицирован, применяю дефолтный фон...');
        applyBackgroundTheme('default'); // <<< УСТАНАВЛИВАЕМ ДЕФОЛТНЫЙ ФОН
        setSelectedBgThemeId('default'); // Сбрасываем состояние фона
        setMainColor('teal');
        if (tokensExist && !initialAuthStatus) {
          console.log('[AuthContext Initial Check] Очистка невалидных токенов.');
          AuthService.logout();
        }
      }
      setIsLoadingAuth(false);
      console.log('[AuthContext Initial Check] Проверка завершена.');
    };
    checkInitialAuth();
  }, [loadUserData, loadAndApplyColorTheme, loadAndApplyBackgroundTheme, clearAvatarUrl]); // <<< ДОБАВЛЕНА ЗАВИСИМОСТЬ

  // Функция login
  const login = useCallback(async () => {
    console.log('[AuthContext] login: Установка isAuthenticated = true и загрузка данных/тем...');
    setIsAuthenticated(true);
    await loadUserData();
    await loadAndApplyColorTheme();
    await loadAndApplyBackgroundTheme(); // <<< Загружаем фон при логине
  }, [loadUserData, loadAndApplyColorTheme, loadAndApplyBackgroundTheme]); // <<< ДОБАВЛЕНА ЗАВИСИМОСТЬ

  // Функция logout
  const logout = useCallback(() => {
    console.log('[AuthContext] logout: Сброс состояния.');
    AuthService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    clearAvatarUrl();
    console.log('[AuthContext] Применяю дефолтный фон при logout...');
    applyBackgroundTheme('default'); // <<< СБРАСЫВАЕМ ФОН НА ДЕФОЛТНЫЙ
    setSelectedBgThemeId('default'); // Сбрасываем состояние фона
    setMainColor('teal');
  }, [clearAvatarUrl]);

  // Функция смены фона
  const changeBgTheme = useCallback(async (bgThemeId: string) => {
    const previousBgId = selectedBgThemeId;
    setSelectedBgThemeId(bgThemeId);
    applyBackgroundTheme(bgThemeId);

    try {
      console.log(`[AuthContext] Попытка сохранить фон ${bgThemeId} на сервере...`);
      await AppearanceService.saveBackgroundId(bgThemeId);
      console.log(`[AuthContext] Фон ${bgThemeId} успешно сохранен на сервере.`);
    } catch (error) {
      console.error(`[AuthContext] Ошибка сохранения фона ${bgThemeId}:`, error);
      setSelectedBgThemeId(previousBgId);
      applyBackgroundTheme(previousBgId);
      alert('Не удалось сохранить выбранный фон.');
    }
  }, [selectedBgThemeId]);


  // Слушатель storage
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'token' || event.key === 'username') {
        const currentAuthStatus = AuthService.isAuthenticated();
        if (currentAuthStatus !== isAuthenticated) {
          setIsAuthenticated(currentAuthStatus);
          if (!currentAuthStatus) {
            console.log('[AuthContext] Storage event: Logout detected, applying defaults...');
            setMainColor('teal');
            applyBackgroundTheme('default'); // <<< СБРОС ФОНА
            setSelectedBgThemeId('default');
            if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
              window.location.href = '/login';
            }
          } else {
            console.log('[AuthContext] Storage event: Login detected in another tab, reloading themes...');
            loadAndApplyColorTheme();
            loadAndApplyBackgroundTheme(); // <<< ПЕРЕЗАГРУЗКА ФОНА
          }
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isAuthenticated, loadAndApplyColorTheme, loadAndApplyBackgroundTheme]); // <<< ДОБАВЛЕНА ЗАВИСИМОСТЬ

  // Мемоизируем значение контекста
  const value = useMemo(() => ({
    isAuthenticated, isLoadingAuth, currentUser, avatarObjectUrl, selectedBgThemeId, login, logout, changeBgTheme
  }), [isAuthenticated, isLoadingAuth, currentUser, avatarObjectUrl, selectedBgThemeId, login, logout, changeBgTheme]); // <<< ДОБАВЛЕНЫ ЗАВИСИМОСТИ

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Экспорт типов для использования вне контекста, если нужно
export type { UserProfile, ThemeColorType, BackgroundOption };