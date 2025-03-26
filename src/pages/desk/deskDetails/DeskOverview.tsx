import { useOutletContext } from 'react-router-dom';
import { DeskData } from '../../../components/sidebar/types/sidebar.types';

type ContextType = {
  desk: DeskData;
  refreshDesk: () => void;
};

export const DeskOverview = () => {
  const { desk, refreshDesk } = useOutletContext<ContextType>();

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-medium mb-4">Информация о доске</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Название</h3>
            <p className="mt-1">{desk.deskName}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Описание</h3>
            <p className="mt-1">{desk.deskDescription || 'Нет описания'}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Дата создания</h3>
            <p className="mt-1">{new Date(desk.deskCreateDate).toLocaleDateString()}</p>
          </div>
          
          {desk.deskFinishDate && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Дедлайн</h3>
              <p className="mt-1">{new Date(desk.deskFinishDate).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      </div>

      {/* Блок участников */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium">Участники</h2>
          <button className="text-sm text-gray-600 hover:text-blue-500">
            Добавить участников
          </button>
        </div>
        
        <div className="flex items-center space-x-4 mb-2">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700">
            ЛЛ
          </div>
          <div>
            <div className="font-medium">Вы (Владелец)</div>
            <div className="text-sm text-gray-500">Полный доступ</div>
          </div>
        </div>
      </div>
    </div>
  );
};