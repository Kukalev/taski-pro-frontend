import React from 'react';
import { DeleteModalProps } from '../types';

const DeleteModal: React.FC<DeleteModalProps> = ({
  visible,
  taskName,
  onConfirm,
  onCancel
}) => {
  if (!visible) return null;
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center transition-all duration-300"
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.3)'
      }}
      onClick={onCancel}
    >
      <div 
        className="bg-white rounded-xl p-6 shadow-xl transition-all duration-300 transform"
        style={{ 
          width: '400px',
          animation: 'fadeIn 0.3s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base">Удаление задачи</h3>
          <button 
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-500 hover:cursor-pointer transition-all duration-300"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="mb-4 text-sm">
          Вы уверены, что хотите удалить задачу 
          {taskName ? ` "${taskName}"` : " \"Без названия\""}?
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-8 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 w-1/2 transition-all duration-200 cursor-pointer"
          >
            Нет
          </button>
          <button
            onClick={onConfirm}
            className="px-8 py-2 bg-orange-400 text-white rounded-lg hover:bg-orange-500 w-1/2 transition-all duration-200 cursor-pointer"
          >
            Да
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
