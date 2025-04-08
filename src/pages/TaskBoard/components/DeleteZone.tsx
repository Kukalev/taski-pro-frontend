import React from 'react';
// Убираем DeleteZoneProps из types, т.к. интерфейс меняется
// import { DeleteZoneProps } from '../types';
import { canDeleteItems } from '../../../utils/permissionUtils';

interface ExtendedDeleteZoneProps {
  visible: boolean;
  hovered: boolean;
  setHovered: (isHovered: boolean) => void; // Принимаем сеттер
  onDrop: () => void; // Принимаем обработчик drop из TaskBoardPage
  deskUsers: any[];
}

const DeleteZone: React.FC<ExtendedDeleteZoneProps> = ({
  visible,
  hovered,
  setHovered, // Используем сеттер
  onDrop,     // Используем обработчик
  deskUsers = []
}) => {
  // Проверяем, что массив deskUsers существует и не пуст перед проверкой прав
  const hasDeletePermission = Array.isArray(deskUsers) && deskUsers.length > 0 
    ? canDeleteItems(deskUsers) 
    : false; // По умолчанию запрещаем удаление, если пользователи не загружены
  
  // Если у пользователя нет прав на удаление или компонент не видим, не отображаем его
  if (!visible || !hasDeletePermission) return null;
  
  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move"; // Показываем правильный курсор
      setHovered(true); // Устанавливаем ховер
  };

  const handleDragLeave = () => {
      setHovered(false); // Сбрасываем ховер
  };

  const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setHovered(false); // Сбрасываем ховер
      onDrop(); // Вызываем обработчик из TaskBoardPage
  };

  // Определяем цвет динамически
  const hoverBorderColor = hovered ? 'var(--theme-color)' : '#D1D5DB'; // Используем CSS переменную
  const iconColorClass = hovered ? 'text-[var(--theme-color)]' : 'text-gray-400'; // Используем переменную для иконки

  return (
    <div 
      className="fixed bottom-8 left-1/2 transform -translate-x-1/2 h-12 bg-white border-2 border-dashed
                flex items-center justify-center z-[9999] rounded-lg px-6 transition-colors duration-200" // Убрали transition из style, добавили Tailwind
      style={{
        maxWidth: '300px',
        width: '80%',
        // Применяем динамический цвет рамки
        borderColor: hoverBorderColor
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex items-center text-sm">
        <svg 
          className={`w-5 h-5 mr-2 transition-colors duration-200 ${iconColorClass}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        <span className="text-gray-500">Переместите сюда для удаления</span>
      </div>
    </div>
  );
};

export default DeleteZone;
