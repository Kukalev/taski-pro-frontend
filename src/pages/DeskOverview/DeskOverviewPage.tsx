import React, {useEffect, useState} from 'react'
import { useOutletContext } from 'react-router-dom'

import DeskHeader from './components/DeskHeader/DeskHeader'
import DeskDescription from './components/DeskDescription/DeskDescription'
import DeskParticipants from './components/DeskParticipants/DeskParticipants'

import {DeskData} from '../../components/sidebar/types/sidebar.types'
import { UserOnDesk } from './components/DeskParticipants/types'

import {useDeskActions} from './hooks/useDeskActions'

import DatePicker from '../../components/DatePicker/DatePicker.tsx'

interface DeskDetailsContext {
  desk: DeskData;
  refreshDesk: () => void;
  hasEditPermission: boolean;
  deskUsers: UserOnDesk[];
}

interface DeskOverviewPageProps {
  desk: DeskData;
  onDeskUpdate?: (updatedDesk: Partial<DeskData>) => void;
}

const DeskOverviewPage: React.FC<DeskOverviewPageProps> = ({ 
  desk, 
  onDeskUpdate, 
}) => {
  const { 
    refreshDesk,
    hasEditPermission, 
    deskUsers 
  } = useOutletContext<DeskDetailsContext>();

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  
  const { isLoading, error, updateDeskName, updateDeskDescription } = 
    desk ? useDeskActions(desk, onDeskUpdate) : { isLoading: false, error: null, updateDeskName: async () => {}, updateDeskDescription: async () => {} };

  useEffect(() => {
    if (desk && desk.deskFinishDate) {
      setSelectedDate(desk.deskFinishDate);
    }
  }, [desk]);

  const calendarId = `desk-date-${desk?.id || 'main'}`;

  if (!desk) {
    return <div className="p-6 text-center text-gray-500">Выберите доску для просмотра</div>;
  }

  const handleDateButtonClick = () => {
    if (!hasEditPermission) return;
    setIsDatePickerVisible(!isDatePickerVisible);
  };

  const handleDateChange = (date: Date | null) => {
    if (!hasEditPermission) return;
    setSelectedDate(date);
    setIsDatePickerVisible(false);
    if (onDeskUpdate) {
      onDeskUpdate({ deskFinishDate: date });
    }
  };

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
        hasEditPermission={hasEditPermission}
      />
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        <DeskDescription 
          desk={desk} 
          onDeskUpdate={onDeskUpdate || (() => {})}
          isLoading={isLoading}
          updateDeskDescription={updateDeskDescription}
          hasEditPermission={hasEditPermission}
        />
        
        <DeskParticipants 
          desk={desk} 
          initialParticipants={deskUsers}
          hasEditPermission={hasEditPermission}
        />
      </div>
      
      {isDatePickerVisible && hasEditPermission && (
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
