import api from '../../api' // Предполагаем, что api настроен

interface UpdatePasswordWithoutAuthData {
  email: string;
  newPassword: string;
}

const BASE_URL = '//v1/profile'; // <<< ИЗМЕНЕНИЕ: Правильный базовый путь контроллера


export const updatePasswordWithoutAuth = async (data: UpdatePasswordWithoutAuthData): Promise<void> => {
  try {
    // Формируем тело запроса согласно UserFieldsDto, передавая только нужные поля
    const requestBody = {
      email: data.email,
      newPassword: data.newPassword,
    };

    console.log(`[updatePasswordWithoutAuth] Вызов PUT на update-password-without-auth с телом:`, requestBody);

    // Используем PUT и правильный ENDPOINT
    const response = await api.put<void>(`${BASE_URL}/update-password-without-auth`, requestBody);

    console.log(`[updatePasswordWithoutAuth] Ответ API: Статус ${response.status}. Пароль успешно обновлен для email: ${data.email}`);

    if (response.status !== 200) {
       throw new Error(`Unexpected status code: ${response.status}`);
    }

  } catch (error: any) {
    // Логируем ошибку для отладки
    console.error(
        '[updatePasswordWithoutAuth] Ошибка при обновлении пароля:',
        error.response?.data || error.response || error.message || error
    );
    // Пробрасываем ошибку дальше для обработки в UI
    throw error;
  }
};
