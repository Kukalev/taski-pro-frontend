import React, {useCallback, useEffect, useState, useRef} from 'react'
import {UserAvatar} from './components/UserAvatar'
import {ProfileForm} from './components/ProfileForm'
import {EmailChangeModal} from './components/EmailChangeModal'
import {
  UserSettingsService
} from '../../../../services/userSettings/UserSettings'
import {UserProfile} from '../../../../services/userSettings/types'
import {AvatarService} from '../../../../services/Avatar/Avatar'

export const ProfileSettings = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  // --- Состояния для загрузки аватара ---
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarUploadError, setAvatarUploadError] = useState<string | null>(null);
  // --- Ссылка на скрытый инпут файла ---
  const fileInputRef = useRef<HTMLInputElement>(null);
  // --- URL аватара ---
  const [avatarObjectUrl, setAvatarObjectUrl] = useState<string | null>(null);

  // Ссылка для хранения *предыдущего* URL, который нужно отозвать
  const previousAvatarUrlRef = useRef<string | null>(null);

  const openEmailModal = () => {
    console.log('[ProfileSettings] openEmailModal called! Setting isEmailModalOpen to true.');
    setIsEmailModalOpen(true);
  };

  const closeEmailModal = () => setIsEmailModalOpen(false);

  const loadUserProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setAvatarUploadError(null);
    // Не отзываем URL здесь, отзыв будет перед созданием нового или при размонтировании

    try {
      console.log("[ProfileSettings] Загрузка профиля...");
      const profileData = await UserSettingsService.getCurrentUser();
      console.log("[ProfileSettings] Профиль загружен:", profileData);
      setUserProfile(profileData);

      if (profileData?.username) {
        console.log("[ProfileSettings] Запрос Blob аватара через AvatarService...");
        const avatarBlob = await AvatarService.fetchUserAvatarBlob(profileData.username);

        // Отзываем *предыдущий* URL *перед* созданием нового
        if (previousAvatarUrlRef.current) {
           console.log("[ProfileSettings] Отзыв предыдущего Object URL:", previousAvatarUrlRef.current);
           URL.revokeObjectURL(previousAvatarUrlRef.current);
           previousAvatarUrlRef.current = null; // Сбрасываем ссылку
        }

        if (avatarBlob) {
            const newObjectUrl = URL.createObjectURL(avatarBlob);
            setAvatarObjectUrl(newObjectUrl); // Устанавливаем новый
            previousAvatarUrlRef.current = newObjectUrl; // Сохраняем новый как "предыдущий" для следующего раза
            console.log("[ProfileSettings] Создан Object URL для аватара:", newObjectUrl);
        } else {
            console.log("[ProfileSettings] AvatarService не вернул Blob (возможно, 404).");
            setAvatarObjectUrl(null);
        }
      } else {
        // Если нет username, отзываем старый URL (если он был) и ставим null
         if (previousAvatarUrlRef.current) {
               URL.revokeObjectURL(previousAvatarUrlRef.current);
               previousAvatarUrlRef.current = null;
         }
        setAvatarObjectUrl(null);
      }
    } catch (err: any) {
       // При ошибке тоже отзываем старый URL и ставим null
       if (previousAvatarUrlRef.current) {
           URL.revokeObjectURL(previousAvatarUrlRef.current);
            previousAvatarUrlRef.current = null;
       }
      console.error("[ProfileSettings] Ошибка загрузки профиля:", err);
      setError(err.message || 'Не удалось загрузить данные профиля.');
      setUserProfile(null);
      setAvatarObjectUrl(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserProfile();

    // Функция очистки для размонтирования
    return () => {
      // Отзываем URL, который был *актуален на момент размонтирования*
      if (previousAvatarUrlRef.current) {
         console.log("[ProfileSettings] Размонтирование, очистка Object URL:", previousAvatarUrlRef.current);
         URL.revokeObjectURL(previousAvatarUrlRef.current);
         previousAvatarUrlRef.current = null;
      }
    };
  }, [loadUserProfile]);

  const handleUpdateSuccess = () => {
    console.log("[ProfileSettings] Данные успешно обновлены. Перезагрузка страницы...");
    setIsEmailModalOpen(false);
    window.location.reload();
  };

  // --- Обработчик клика по аватару ---
  const handleAvatarClick = () => {
    if (isUploadingAvatar) return; // Не открывать выбор файла, если уже идет загрузка
    setAvatarUploadError(null); // Сбросить прошлую ошибку при новой попытке
    fileInputRef.current?.click(); // Программно кликаем по скрытому инпуту
  };

  // --- Обработчик выбора файла ---
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.log('[ProfileSettings] Файл не выбран.');
      return;
    }

    // --- ЛОГ ДЛЯ ПРОВЕРКИ ФАЙЛА ---
    console.log('[ProfileSettings] Выбран файл:', {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        fileObject: file // Сам объект файла для детального изучения в консоли
    });
    // --- КОНЕЦ ЛОГА ---

    // Простая валидация типа (можно добавить и размер)
    if (!file.type.startsWith('image/')) {
        setAvatarUploadError('Пожалуйста, выберите файл изображения.');
        // Сбрасываем значение инпута, чтобы можно было выбрать тот же файл снова, даже если он невалидный
        event.target.value = '';
        return;
    }
     // Сбрасываем значение инпута, чтобы можно было выбрать тот же файл снова
    event.target.value = '';

    setIsUploadingAvatar(true);
    setAvatarUploadError(null);

    try {
      console.log('[ProfileSettings] Вызов AvatarService.uploadCurrentUserAvatar...');
      await AvatarService.uploadCurrentUserAvatar(file);
      console.log('[ProfileSettings] Аватар успешно загружен. Вызов handleUpdateSuccess...');
      handleUpdateSuccess();
    } catch (err: any) {
      console.error('[ProfileSettings] Ошибка при вызове uploadCurrentUserAvatar:', err);
      // Отображаем ошибку, которую пробросил сервис
      setAvatarUploadError(err.message || 'Не удалось загрузить аватар.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow px-5 py-4 max-w-[430px] -ml-2 -mt-2.5">
        <p className="text-gray-600">Загрузка данных профиля...</p>
      </div>
    );
  }

  if (error) {
      return (
        <div className="bg-white rounded-2xl shadow px-5 py-4 max-w-[430px] -ml-2 -mt-2.5">
          <p className="text-red-600">Ошибка: {error}</p>
          <button onClick={loadUserProfile} className="mt-2 text-blue-600 hover:underline">Попробовать снова</button>
        </div>
      );
  }

  if (!userProfile) {
       return (
        <div className="bg-white rounded-2xl shadow px-5 py-4 max-w-[430px] -ml-2 -mt-2.5">
          <p className="text-gray-600">Данные профиля не найдены.</p>
        </div>
      );
  }

  console.log('[ProfileSettings] Rendering. isEmailModalOpen:', isEmailModalOpen, 'userProfile.email:', userProfile?.email);

  return (
    <div className="bg-white rounded-2xl shadow px-5 py-4 max-w-[430px] -ml-2 -mt-2.5">
      <h1 className="text-[20px] font-medium mb-1 ">Профиль</h1>

      <p className="text-gray-600 mb-4 text-sm">
        Здесь настраивается учетная запись TASKI.PRO.
      </p>

      <div className="flex items-center mb-4 space-x-4">
        {userProfile && (
          <UserAvatar
            username={userProfile.username}
            avatarUrl={avatarObjectUrl}
            size='lg'
            isEditable={true}
            onClick={handleAvatarClick}
          />
        )}
        <div className="flex flex-col">
          {isUploadingAvatar && <p className="text-sm text-gray-500">Загрузка аватара...</p>}
          {avatarUploadError && <p className="text-sm text-red-600">{avatarUploadError}</p>}
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        style={{ display: 'none' }}
      />

      <div>
        <ProfileForm
            userProfile={userProfile}
            onUpdateSuccess={handleUpdateSuccess}
            onEmailChangeClick={openEmailModal}
        />
      </div>

      {userProfile?.email && (
          <EmailChangeModal
              isOpen={isEmailModalOpen}
              onClose={closeEmailModal}
              currentEmail={userProfile.email}
              onSuccess={handleUpdateSuccess}
          />
      )}
    </div>
  )
} 