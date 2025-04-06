import axios, {AxiosError} from 'axios'

// Функция для обработки ошибок GitHub API
export const handleGitHubError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    
    // Если есть данные ответа от сервера
    if (axiosError.response) {
      const status = axiosError.response.status;
      
      switch (status) {
        case 400:
          return 'Неверный запрос. Проверьте URL репозитория и ветку.';
        case 401:
          return 'Пользователь не авторизован.';
        case 403:
          return 'Нет доступа к репозиторию.';
        case 404:
          return 'Репозиторий или доска не найдены.';
        case 409:
          return 'Репозиторий уже добавлен к этой доске.';
        case 503:
          return 'Невозможно синхронизировать репозиторий. Сервис недоступен.';
        default:
          return `Ошибка сервера: ${axiosError.message}`;
      }
    }
    
    // Если нет ответа от сервера (проблемы с сетью)
    return `Проблема с сетью: ${axiosError.message}`;
  }
  
  // Неизвестная ошибка
  return `Неизвестная ошибка: ${String(error)}`;
}; 