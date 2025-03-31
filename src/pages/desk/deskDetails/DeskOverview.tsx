import React from 'react';
import { useOutletContext } from 'react-router-dom';
import DeskOverviewPage from '../../DeskOverview/DeskOverviewPage';
import { DeskData } from '../../../components/sidebar/types/sidebar.types';

type ContextType = {
  desk: DeskData;
  refreshDesk: () => void;
};

export const DeskOverview = () => {
  const { desk, refreshDesk } = useOutletContext<ContextType>();
  
  console.log('Текущая доска:', desk); // Для отладки
  
  return desk ? (
    <DeskOverviewPage 
      desk={desk} 
      onDeskUpdate={(updatedDesk) => {
        console.log('Обновление доски:', updatedDesk);
        refreshDesk();
      }} 
    />
  ) : (
    <div className="p-8 text-center">Загрузка доски...</div>
  );
};

export default DeskOverview;
