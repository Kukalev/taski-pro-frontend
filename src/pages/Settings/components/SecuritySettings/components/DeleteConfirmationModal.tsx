import React, {useEffect, useRef, useState} from 'react'

// Интерфейс для пропсов модального окна
export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => Promise<void>;
}

// Компонент модального окна подтверждения
export const DeleteConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHoveringDelete, setIsHoveringDelete] = useState(false); // Для ховера кнопки

  const modalRef = useRef<HTMLDivElement>(null); // Ref для контента модалки

  // Сброс состояния при открытии/закрытии
  useEffect(() => {
    if (!isOpen) {
      setPassword('');
      setError('');
      setIsLoading(false);
      setIsHoveringDelete(false);
    }
  }, [isOpen]);

  // Закрытие по клику вне модалки
  const handleClickOutside = (event: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      handleClose();
    }
  };

  const handleConfirmClick = async () => {
    setError('');
    if (!password) {
      setError('Введите текущий пароль для подтверждения.');
      return;
    }
    setIsLoading(true);
    try {
      await onConfirm(password);

    } catch (err: any) {
      console.error("Ошибка подтверждения удаления:", err);
      setError(err.message || 'Не удалось удалить аккаунт. Проверьте пароль.');
      setIsLoading(false);
    }
  };

  // Обертка для onClose, чтобы сбросить состояние
  const handleClose = () => {
    if (isLoading) return; // Не закрывать во время загрузки
    setPassword('');
    setError('');
    setIsLoading(false);
    setIsHoveringDelete(false);
    onClose();
  };

  if (!isOpen) return null;

  const inputStyle = "mt-1 p-1.5 bg-gray-50 rounded-lg w-full focus:outline-none placeholder-gray-400 hover:bg-gray-100 focus:bg-gray-100 disabled:opacity-50";

  // Стили для кнопки удаления с динамическим цветом
  const deleteButtonStyle: React.CSSProperties = {
    backgroundColor: isHoveringDelete
      ? 'var(--theme-color-dark, var(--theme-color))' // Используем --theme-color-dark при ховере, иначе --theme-color
      : 'var(--theme-color)',
  };

  return (
    // Overlay: добавляем backdrop-blur и/или backdrop-brightness
    <div
      className="fixed inset-0 z-50 flex justify-center items-center transition-opacity duration-150
                 bg-black/30 backdrop-blur-sm" // <--- ИЗМЕНЕНО: Черный с 30% прозрачностью + легкое размытие фона
      onClick={handleClickOutside}
    >
      {/* Контейнер модалки, клики внутри него не будут закрывать окно */}
      <div
        ref={modalRef}
        className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md relative" // Добавили relative для позиционирования крестика
        onClick={(e) => e.stopPropagation()} // Останавливаем всплытие клика
      >
        {/* Крестик для закрытия */}
        <button
            onClick={handleClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
            aria-label="Закрыть"
            disabled={isLoading}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h3 className="text-lg font-semibold mb-4 text-gray-800 mr-6">Подтверждение удаления</h3> {/* Добавил отступ справа от заголовка */}
        <p className="text-sm text-gray-600 mb-4">
          Вы уверены, что хотите удалить свой аккаунт? Это действие необратимо.
          Для подтверждения введите ваш текущий пароль.
        </p>
        <div className="mb-4">
          <label htmlFor="confirm-password-delete" className="block text-sm font-medium text-gray-700">
            Текущий пароль
          </label>
          <input
            id="confirm-password-delete"
            type="password"
            className={inputStyle}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Введите пароль"
            disabled={isLoading}
          />
        </div>
        {error && (
          <div className="mb-4 p-2 bg-red-50 text-red-600 rounded-md text-sm">
            {error}
          </div>
        )}
        {/* Убрали кнопку "Отмена", оставили только "Удалить" */}
        <div className="flex justify-end">
          <button
            onClick={handleConfirmClick}
            disabled={!password || isLoading}
            className="px-4 py-2 text-white rounded-lg focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors duration-150 ease-in-out" // Добавили cursor-pointer и transition
            style={deleteButtonStyle} // Применяем динамический стиль
            onMouseEnter={() => setIsHoveringDelete(true)}
            onMouseLeave={() => setIsHoveringDelete(false)}
          >
            {isLoading ? 'Удаление...' : 'Удалить аккаунт'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Можно добавить default export, если файл содержит только этот компонент
// export default DeleteConfirmationModal; 