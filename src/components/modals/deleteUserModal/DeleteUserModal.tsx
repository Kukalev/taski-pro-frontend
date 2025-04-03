import { useState } from 'react';

interface DeleteUserModalProps {
  isOpen: boolean;
  userId: number | null;
  userName: string;
  deskId: number | null;
  onClose: () => void;
  onConfirm: (userId: number) => Promise<void>;
  isLoading: boolean;
}

export const DeleteUserModal = ({ 
  isOpen, 
  userId, 
  userName, 
  deskId,
  onClose, 
  onConfirm, 
  isLoading 
}: DeleteUserModalProps) => {
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (!userId || !deskId) return;

    setError('');
    try {
      // Вызываем колбэк для удаления
      await onConfirm(userId);
      onClose();
    } catch (error: any) {
      console.error('Ошибка при удалении пользователя:', error);
      setError(error.message || 'Не удалось удалить пользователя');
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      <div className='flex min-h-screen items-center justify-center px-4'>
        <div className='fixed inset-0 bg-black opacity-40 transition-opacity' onClick={onClose}></div>

        <div className='relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl'>
          <h2 className='mb-4 text-xl font-semibold'>Удаление участника</h2>

          <p className='mb-4'>
            Вы уверены, что хотите удалить участника <span className='font-medium'>{userName}</span> с доски? 
            Это действие нельзя отменить.
          </p>

          {error && <div className='mb-4 p-2 bg-red-50 text-red-700 rounded-md text-sm'>{error}</div>}

          <div className='flex justify-end space-x-3'>
            <button 
              type='button' 
              onClick={onClose} 
              disabled={isLoading} 
              className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md'
            >
              Отмена
            </button>
            <button
              type='button'
              onClick={handleDelete}
              disabled={isLoading}
              className='px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-70'
            >
              {isLoading ? 'Удаление...' : 'Удалить'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 