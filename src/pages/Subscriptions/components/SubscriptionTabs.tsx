import React from 'react';

type ActiveView = 'current' | 'all';

interface SubscriptionTabsProps {
  activeView: ActiveView;
  onViewChange: (view: ActiveView) => void;
}

export const SubscriptionTabs: React.FC<SubscriptionTabsProps> = ({ activeView, onViewChange }) => {
  const getButtonClass = (view: ActiveView) => {
    const baseClass = "py-2 px-4 rounded-md text-sm font-medium transition-colors";
    const activeClass = "bg-blue-600 text-white";
    const inactiveClass = "bg-gray-200 text-gray-700 hover:bg-gray-300";
    return `${baseClass} ${activeView === view ? activeClass : inactiveClass}`;
  };

  return (
    <div className="flex justify-center space-x-4 mb-6">
      <button
        className={getButtonClass('current')}
        onClick={() => onViewChange('current')}
      >
        Текущий тариф
      </button>
      <button
        className={getButtonClass('all')}
        onClick={() => onViewChange('all')}
      >
        Все подписки
      </button>
    </div>
  );
}; 