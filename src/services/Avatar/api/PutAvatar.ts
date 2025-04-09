import api from '../../api'

const BASE_URL = '/api/v1/storage'; // <<< ИСПРАВЛЕНО: Добавлен /api

export const uploadCurrentUserAvatar = async (avatarFile: File): Promise<void> => {
  if (!(avatarFile instanceof File)) { /* ... */ }
  try {
    // ... formData ...
    // Теперь URL будет /api/v1/storage/avatars, Vite его перехватит
    console.log(`[uploadCurrentUserAvatar] Отправка PUT запроса на ${BASE_URL}/avatars`);
    const response = await api.put<void>(`${BASE_URL}/avatars`, formData);
    // ... остальная логика ...
  } catch (error: any) {
    // ... обработка ошибки ...
  }
};
