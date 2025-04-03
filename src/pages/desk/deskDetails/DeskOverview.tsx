import {useOutletContext} from 'react-router-dom'
import DeskOverviewPage from '../../DeskOverview/DeskOverviewPage'
import {DeskData} from '../../../components/sidebar/types/sidebar.types'

type ContextType = {
  desk: DeskData;
  refreshDesk: () => void;
  hasEditPermission: boolean;
  deskUsers: any[];
};

export const DeskOverview = () => {
  const { desk, refreshDesk, hasEditPermission, deskUsers } = useOutletContext<ContextType>();
  
  console.log('Текущая доска:', desk); // Для отладки
  console.log('Права на редактирование:', hasEditPermission);
  
  return desk ? (
    <DeskOverviewPage 
      desk={desk} 
      onDeskUpdate={(updatedDesk) => {
        console.log('Обновление доски:', updatedDesk);
        refreshDesk();
      }}
      hasEditPermission={hasEditPermission}
      deskUsers={deskUsers}
    />
  ) : (
    <div className="p-8 text-center">Загрузка доски...</div>
  );
};

