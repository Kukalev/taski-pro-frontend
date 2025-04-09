import {useCallback, useEffect, useState} from 'react'
import {UserAvatar} from './components/UserAvatar'
import {ProfileForm} from './components/ProfileForm'
import {EmailChangeModal} from './components/EmailChangeModal'
import {
  UserSettingsService
} from '../../../../services/userSettings/UserSettings'
import {UserProfile} from '../../../../services/userSettings/types'

export const ProfileSettings = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const openEmailModal = () => {
    console.log('[ProfileSettings] openEmailModal called! Setting isEmailModalOpen to true.');
    setIsEmailModalOpen(true);
  };

  const closeEmailModal = () => setIsEmailModalOpen(false);

  const loadUserProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("[ProfileSettings] Загрузка профиля...");
      const profileData = await UserSettingsService.getCurrentUser();
      console.log("[ProfileSettings] Профиль загружен:", profileData);
      setUserProfile(profileData);
    } catch (err: any) {
      console.error("[ProfileSettings] Ошибка загрузки профиля:", err);
      setError(err.message || 'Не удалось загрузить данные профиля.');
      setUserProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  const handleUpdateSuccess = () => {
    console.log("[ProfileSettings] Данные успешно обновлены (профиль или email). Перезагрузка страницы...");
    setIsEmailModalOpen(false);
    window.location.reload();
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

      <div className="flex mb-4">
        <UserAvatar username={userProfile.username} size='lg'/>
      </div>

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