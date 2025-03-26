import { useOutletContext } from 'react-router-dom';
import { DeskData } from '../../../components/sidebar/types/sidebar.types';

type ContextType = {
  desk: DeskData;
  refreshDesk: () => void;
};

export const DeskBoard = () => {
  const { desk, refreshDesk } = useOutletContext<ContextType>();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-medium">Задачи доски</h2>
          <p className="text-gray-500">Создавайте и управляйте задачами доски {desk.deskName}</p>
        </div>
        
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
          + Новая задача
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Пока нет задач</h3>
          <p className="text-gray-500 mb-6">Создайте первую задачу, чтобы начать работу</p>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
            + Добавить задачу
          </button>
        </div>
      </div>
    </div>
  );
};