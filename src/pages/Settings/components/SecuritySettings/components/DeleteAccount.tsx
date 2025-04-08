import React, { useState } from 'react';
import { DeleteAccountProps } from '../types';
import { UserSettingsService } from '../../../../../services/userSettings/UserSettings';
import { DeleteConfirmationModal } from './DeleteConfirmationModal'; // Импортируем модальное окно

export const DeleteAccount: React.FC<DeleteAccountProps> = ({ onLogout }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleConfirmDelete = async (password: string) => {
    console.log('Отправка запроса на удаление аккаунта с паролем...');
    try {
      await UserSettingsService.deleteCurrentUser({ oldPassword: password });
      console.log('Аккаунт успешно удален на сервере.');
      onLogout();
      // Можно добавить setIsModalOpen(false); если нужно закрыть явно
    } catch (err) {
      console.error('Ошибка при вызове сервиса удаления:', err);
      throw err; // Перебрасываем ошибку для отображения в модалке
    }
  };

  return (
    <div>
      <ul className="mb-4 list-disc list-inside text-gray-600 text-sm space-y-1">
        <li>аккаунт нельзя будет восстановить</li>
        <li>все сохранённые на аккаунте данные будут потеряны</li>
        <li>аккаунт будет скрыт у других пользователей</li>
      </ul>

      <div className="flex justify-end">
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none cursor-pointer transition-colors"
        >
          Удалить
        </button>
      </div>

      {/* Рендерим импортированное модальное окно */}
      <DeleteConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}; 