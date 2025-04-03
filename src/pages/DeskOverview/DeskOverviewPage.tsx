import React, {useEffect, useState} from 'react'

import DeskHeader from './components/DeskHeader/DeskHeader'
import DeskDescription from './components/DeskDescription/DeskDescription'
import DeskParticipants from './components/DeskParticipants/DeskParticipants'

import {DeskData} from '../../components/sidebar/types/sidebar.types'

import {useDeskActions} from './hooks/useDeskActions'

import DatePicker from '../../components/DatePicker/DatePicker.tsx'

interface DeskOverviewPageProps {
  desk: DeskData;
  onDeskUpdate?: (updatedDesk: Partial<DeskData>) => void;
}

const DeskOverviewPage: React.FC<DeskOverviewPageProps> = ({ desk, onDeskUpdate }) => {
  // Инициализируем состояние без ссылки на desk
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  
  // Используем desk только если он доступен
  const { isLoading, error, updateDeskName, updateDeskDescription } = 
    desk ? useDeskActions(desk, onDeskUpdate) : { isLoading: false, error: null, updateDeskName: async () => {}, updateDeskDescription: async () => {} };

  // Обновляем selectedDate при изменении desk
  useEffect(() => {
    if (desk && desk.deskFinishDate) {
      setSelectedDate(desk.deskFinishDate);
    }
  }, [desk]);

  // Добавляем уникальный ID для календаря
  const calendarId = `desk-date-${desk?.id || 'main'}`;

  // Если доска не передана, отображаем сообщение
  if (!desk) {
    return <div className="p-6 text-center text-gray-500">Выберите доску для просмотра</div>;
  }

  // Обработчик нажатия на кнопку даты
  const handleDateButtonClick = () => {
    setIsDatePickerVisible(!isDatePickerVisible);
  };

  // Обработчик изменения даты
  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    setIsDatePickerVisible(false);
    
    // Обновление даты доски через API
    if (onDeskUpdate) {
      onDeskUpdate({ deskFinishDate: date });
    }
  };

  // Закрытие выбора даты
  const handleCloseDatePicker = () => {
    setIsDatePickerVisible(false);
  };

  return (
    <div>
      <DeskHeader 
        desk={desk} 
        onDeskUpdate={onDeskUpdate || (() => {})}
        isLoading={isLoading}
        error={error}
        updateDeskName={updateDeskName}
        onDateClick={handleDateButtonClick}
        selectedDate={selectedDate}
      />
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        <DeskDescription 
          desk={desk} 
          onDeskUpdate={onDeskUpdate || (() => {})}
          isLoading={isLoading}
          updateDeskDescription={updateDeskDescription}
        />
        
        <DeskParticipants desk={desk} />
      </div>
      
      {isDatePickerVisible && (
        <DatePicker
          taskId={calendarId}
          selectedDate={selectedDate}
          onDateChange={(taskId, date) => handleDateChange(date)}
          onClose={handleCloseDatePicker}
        />
      )}
    </div>
  );
};

export default DeskOverviewPage;
