import React, { useState, useRef, useEffect } from 'react';
import { DeskData } from '../../../components/sidebar/types/sidebar.types';

interface DeskHeaderProps {
  desk: DeskData;
  onDeskUpdate: (updatedDesk: Partial<DeskData>) => void;
  isLoading?: boolean;
  error?: string | null;
  updateDeskName: (name: string) => Promise<void>;
  onDateClick?: () => void;
}

const DeskHeader: React.FC<DeskHeaderProps> = ({
  desk,
  onDeskUpdate,
  isLoading = false,
  error = null,
  updateDeskName,
  onDateClick
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(desk.deskName || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);
  
  useEffect(() => {
    setEditedName(desk.deskName || '');
  }, [desk.deskName]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (editedName.trim() !== '') {
      await updateDeskName(editedName);
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditedName(desk.deskName || '');
    }
  };

  const getFirstLetter = () => {
    if (!desk.deskName) return 'A';
    return desk.deskName.charAt(0).toUpperCase();
  };

  return (
    <div className='bg-white py-8'>
      <div className='max-w-4xl mx-auto flex items-center px-4'>
        <div className='flex flex-col items-start mr-8'>
          {/* Логотип */}
          <div className='w-28 h-28 bg-pink-200 rounded-2xl flex items-center justify-center text-pink-600 text-5xl mb-3'>
            {getFirstLetter()}
          </div>

          {/* Название доски (под логотипом, выровнено по левому краю) */}
          {isEditing ? (
            <div className="flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSave}
                className="text-2xl font-bold w-full outline-none border-b-2 border-blue-500 pb-1"
                placeholder="Введите название доски"
                disabled={isLoading}
              />
              {isLoading && (
                <div className="ml-2 animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
              )}
            </div>
          ) : (
            <h1 
              className="text-2xl font-bold cursor-pointer hover:text-blue-600 transition-colors"
              onClick={handleEdit}
            >
              {desk.deskName || 'Без названия'}
            </h1>
          )}
        </div>

        {/* Дата и статус в горизонтальном положении, с меньшим отступом */}
        <div className='flex items-center space-x-5'>
          {/* Кнопка даты - значительно увеличенная */}
          <button 
            className='flex items-center min-w-[180px] px-8 py-3.5 bg-gray-50 hover:bg-gray-100 rounded-md text-base cursor-pointer transition-colors'
            data-date-button="true"
            onClick={onDateClick}
          >
            <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 2V5" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 2V5" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3.5 9.09H20.5" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M15.6947 13.7H15.7037" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M15.6947 16.7H15.7037" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M11.9955 13.7H12.0045" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M11.9955 16.7H12.0045" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8.29431 13.7H8.30329" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8.29431 16.7H8.30329" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          {/* Статус "В работе" - значительно увеличенный */}
          <div 
            className='relative'
          >
            <button 
              className='flex items-center min-w-[180px] px-8 py-3.5 bg-gray-50 hover:bg-gray-100 rounded-md text-base cursor-pointer transition-colors'
            >
              <span className='w-3 h-3 bg-green-500 rounded-full mr-3'></span>
              <span className='mr-2'>В работе</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeskHeader;
