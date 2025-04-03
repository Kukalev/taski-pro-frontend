import React from 'react';
import { DeleteZoneProps } from '../types';
import { canDeleteItems } from '../../../utils/permissionUtils';

interface ExtendedDeleteZoneProps extends DeleteZoneProps {
  deskUsers: any[];
}

const DeleteZone: React.FC<ExtendedDeleteZoneProps> = ({
  visible,
  hovered,
  onDragOver,
  onDragLeave,
  onDrop,
  deskUsers
}) => {
  // Проверяем, имеет ли пользователь право удалять задачи
  const hasDeletePermission = canDeleteItems(deskUsers);
  
  // Если у пользователя нет прав на удаление или компонент не видим, не отображаем его
  if (!visible || !hasDeletePermission) return null;
  
  return (
    <div 
      className="fixed bottom-8 left-1/2 transform -translate-x-1/2 h-12 bg-white border-2 border-dashed border-gray-300 
                flex items-center justify-center z-[9999] rounded-lg px-6"
      style={{
        maxWidth: '300px',
        width: '80%',
        transition: 'border-color 0.2s',
        borderColor: hovered ? '#FB923C' : '#D1D5DB'
      }}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver(e);
      }}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="flex items-center text-sm">
        <svg 
          className={`w-5 h-5 mr-2 transition-colors duration-200 ${
            hovered ? 'text-orange-500' : 'text-gray-400'
          }`}
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
