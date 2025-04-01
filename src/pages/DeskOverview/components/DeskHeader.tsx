import React, {useEffect, useRef, useState} from 'react'
import {format} from 'date-fns'
import {ru} from 'date-fns/locale'
import {DeskData} from '../../../components/sidebar/types/sidebar.types'

interface DeskHeaderProps {
  desk: DeskData;
  onDeskUpdate: (updatedDesk: Partial<DeskData>) => void;
  isLoading?: boolean;
  error?: string | null;
  updateDeskName: (name: string) => Promise<void>;
  onDateClick?: () => void;
  selectedDate?: Date | null;
}

// Enum для статусов
enum DeskStatus {
  INACTIVE = 'Не активный',
  IN_PROGRESS = 'В работе',
  AT_RISK = 'Под угрозой',
  PAUSED = 'Приостановлен'
}

const DeskHeader: React.FC<DeskHeaderProps> = ({
  desk,
  onDeskUpdate,
  isLoading = false,
  error = null,
  updateDeskName,
  onDateClick,
  selectedDate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(desk.deskName || '');
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<DeskStatus>(DeskStatus.IN_PROGRESS);
  const inputRef = useRef<HTMLInputElement>(null);
  const statusButtonRef = useRef<HTMLDivElement>(null);
  const statusMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Установка курсора в конец текста
      const length = inputRef.current.value.length;
      inputRef.current.setSelectionRange(length, length);
    }
  }, [isEditing]);
  
  useEffect(() => {
    setEditedName(desk.deskName || '');
  }, [desk.deskName]);
  
  // Закрытие меню статусов при клике вне
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        statusMenuRef.current && 
        !statusMenuRef.current.contains(event.target as Node) &&
        statusButtonRef.current && 
        !statusButtonRef.current.contains(event.target as Node)
      ) {
        setStatusMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleBlur = async () => {
    if (editedName.trim() !== '' && editedName !== desk.deskName) {
      await updateDeskName(editedName);
    } else {
      setEditedName(desk.deskName || '');
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditedName(desk.deskName || '');
    }
  };

  const getFirstLetter = () => {
    if (!desk.deskName) return 'A';
    return desk.deskName.charAt(0).toUpperCase();
  };

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return 'Дата не выбрана';
    
    try {
      // Если date - строка, преобразуем в объект Date
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return format(dateObj, 'd MMMM yyyy', { locale: ru });
    } catch (error) {
      console.error('Ошибка форматирования даты:', error);
      return 'Дата не выбрана';
    }
  };
  
  const toggleStatusMenu = () => {
    setStatusMenuOpen(!statusMenuOpen);
  };
  
  const handleStatusChange = (status: DeskStatus) => {
    setCurrentStatus(status);
    setStatusMenuOpen(false);
    // Здесь можно добавить обновление статуса на сервере
    // например: onDeskUpdate({ status: status });
  };
  
  // Получение цвета маркера в зависимости от статуса
  const getStatusColor = (status: DeskStatus) => {
    switch (status) {
      case DeskStatus.INACTIVE:
        return 'bg-gray-400';
      case DeskStatus.IN_PROGRESS:
        return 'bg-green-500';
      case DeskStatus.AT_RISK:
        return 'bg-yellow-400';
      case DeskStatus.PAUSED:
        return 'bg-red-500';
      default:
        return 'bg-green-500';
    }
  };

  return (
    <div className='bg-white py-8'>
      <div className='max-w-4xl mx-auto flex items-center px-4'>
        <div className='flex flex-col items-start mr-8'>
          {/* Логотип */}
          <div className='w-28 h-28 bg-pink-200 rounded-2xl flex items-center justify-center text-pink-600 text-5xl mb-3'>
            {getFirstLetter()}
          </div>

          {/* Название доски (под логотипом) с фиксированной шириной */}
          <div className="w-[550px]">
            {isEditing ? (
              <div className="w-full">
                <input
                  ref={inputRef}
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleBlur}
                  className="text-2xl font-bold w-full outline-none whitespace-nowrap overflow-hidden text-ellipsis"
                  placeholder="Введите название доски"
                  disabled={isLoading}
                  style={{ 
                    background: 'transparent', 
                    padding: '0',
                    margin: '0',
                    border: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                {isLoading && (
                  <div className="ml-2 animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                )}
              </div>
            ) : (
              <h1 
                className="text-2xl font-bold whitespace-nowrap overflow-hidden text-ellipsis cursor-text w-full"
                onClick={handleEdit}
              >
                {desk.deskName || 'Без названия'}
              </h1>
            )}
          </div>
        </div>

        {/* Дата и статус в горизонтальном положении */}
        <div className='flex items-center space-x-5 -ml-66'>
          {/* Кнопка даты */}
          <button 
            className='flex items-center min-w-[150px] px-6 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-base cursor-pointer transition-colors'
            data-date-button="true"
            onClick={onDateClick}
          >
            <svg className="w-6 h-6 mr-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
            <span className="whitespace-nowrap overflow-hidden text-ellipsis">
              {formatDate(selectedDate || desk.deskFinishDate)}
            </span>
          </button>
          
          {/* Статус "В работе" с выпадающим меню */}
          <div className="relative" ref={statusButtonRef}>
            <button 
              className='flex items-center justify-between min-w-[150px] px-6 py-2 bg-gray-50 hover:bg-gray-100 rounded-md text-base cursor-pointer transition-colors'
              onClick={toggleStatusMenu}
            >
              <div className="flex items-center">
                <span className={`w-3 h-3 ${getStatusColor(currentStatus)} rounded-full mr-3 flex-shrink-0`}></span>
                <span className='mr-2 whitespace-nowrap'>{currentStatus}</span>
              </div>
              <svg 
                className={`w-5 h-5 transition-colors ${statusMenuOpen ? 'text-orange-500' : 'text-gray-400'} flex-shrink-0`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Выпадающее меню статусов */}
            {statusMenuOpen && (
              <div 
                ref={statusMenuRef}
                className="absolute right-0 mt-1 rounded-md shadow-lg bg-white z-10"
                style={{ 
                  width: '150px',
                  border: '1px solid #f3f4f6'
                }}
              >
                <div className="py-1">
                  <button
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center"
                    onClick={() => handleStatusChange(DeskStatus.INACTIVE)}
                  >
                    <span className="w-2 h-2 bg-gray-400 rounded-full mr-3 flex-shrink-0"></span>
                    <span className="text-sm">Не активный</span>
                  </button>
                  <button
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center"
                    onClick={() => handleStatusChange(DeskStatus.IN_PROGRESS)}
                  >
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></span>
                    <span className="text-sm">В работе</span>
                  </button>
                  <button
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center"
                    onClick={() => handleStatusChange(DeskStatus.AT_RISK)}
                  >
                    <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3 flex-shrink-0"></span>
                    <span className="text-sm">Под угрозой</span>
                  </button>
                  <button
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center"
                    onClick={() => handleStatusChange(DeskStatus.PAUSED)}
                  >
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-3 flex-shrink-0"></span>
                    <span className="text-sm">Приостановлен</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeskHeader;
