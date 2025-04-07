import React, { useState, useEffect, useCallback } from 'react';
import { SubscriptionService } from '../../services/subscriptions/Subscriptions';
import { SubscriptionInfoDto, UserSubscriptionResponseDto } from '../../services/subscriptions/types';
import { ThemedButton } from '../../components/ui/ThemedButton';
import { CurrentSubscriptionView } from './components/CurrentSubscriptionView';
import { AllSubscriptionsView } from './components/AllSubscriptionsView';

const getSubscriptionCardStyles = (type: SubscriptionType) => {
  switch (type) {
    case SubscriptionType.PRO:
      return {
        borderColor: 'border-blue-500',
        bgColor: 'bg-blue-50',
        buttonClass: 'bg-blue-600 hover:bg-blue-700',
        titleColor: 'text-blue-700'
      };
    case SubscriptionType.ULTRA:
      return {
        borderColor: 'border-purple-500',
        bgColor: 'bg-purple-50',
        buttonClass: 'bg-purple-600 hover:bg-purple-700',
        titleColor: 'text-purple-700'
      };
    case SubscriptionType.COMMON:
    default:
      return {
        borderColor: 'border-gray-300',
        bgColor: 'bg-gray-50',
        buttonClass: 'bg-gray-600 hover:bg-gray-700',
        titleColor: 'text-gray-700'
      };
  }
};

export const SubscriptionsPage: React.FC = () => {
  const [allPlans, setAllPlans] = useState<SubscriptionInfoDto[]>([]);
  const [currentUserSubscription, setCurrentUserSubscription] = useState<UserSubscriptionResponseDto | null>(null);
  const [loadingAll, setLoadingAll] = useState<boolean>(true);
  const [loadingCurrent, setLoadingCurrent] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'current' | 'all'>('all');

  const fetchData = useCallback(async () => {
    setLoadingAll(true);
    setLoadingCurrent(true);
    setError(null);
    try {
      const [allPlansData, currentUserSubData] = await Promise.allSettled([
        SubscriptionService.getAllSubscriptionTypes(),
        SubscriptionService.getUserSubscription()
      ]);

      if (allPlansData.status === 'fulfilled') {
        const sortedPlans = allPlansData.value.sort((a, b) => a.price - b.price);
        setAllPlans(sortedPlans);
      } else {
        console.error("Ошибка загрузки всех планов:", allPlansData.reason);
        setError(allPlansData.reason?.message || 'Не удалось загрузить список планов.');
        setLoadingAll(false);
        setLoadingCurrent(false);
        return;
      }

      if (currentUserSubData.status === 'fulfilled') {
        setCurrentUserSubscription(currentUserSubData.value);
      } else {
        if (currentUserSubData.reason?.message !== 'Пользователь не имеет подписок') {
          console.error("Ошибка загрузки текущей подписки:", currentUserSubData.reason);
          setError(prev => prev ? `${prev}\nНе удалось загрузить текущую подписку.` : 'Не удалось загрузить текущую подписку.');
        }
        setCurrentUserSubscription(null);
      }

    } catch (err: any) {
      console.error("Общая ошибка загрузки данных подписок:", err);
      setError(err.message || 'Произошла неизвестная ошибка.');
    } finally {
      setLoadingAll(false);
      setLoadingCurrent(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubscriptionChange = () => {
    fetchData();
    setActiveView('current');
  };

  const renderPageContent = () => {
    if (error && (loadingAll || loadingCurrent)) {
      return <div className="text-red-600 bg-red-100 p-4 rounded border border-red-300 m-4">{error}</div>;
    }

    if (loadingAll) {
      return <div className="p-6 text-center">Загрузка...</div>;
    }

    if (activeView === 'current') {
      return <CurrentSubscriptionView
        subscription={currentUserSubscription}
        loading={loadingCurrent}
        onSubscriptionChange={handleSubscriptionChange}
      />;
    } else {
      return <AllSubscriptionsView
        allPlans={allPlans}
        currentPlanType={currentUserSubscription?.subscriptionType || null}
        onSubscriptionChange={handleSubscriptionChange}
      />;
    }
  };

  const getTabClassName = (view: 'current' | 'all') => {
    const base = 'py-1 px-3 font-medium cursor-pointer';
    const active = 'text-[--theme-color]';
    const inactive = 'text-gray-600 hover:text-gray-900';
    return `${base} ${activeView === view ? active : inactive}`;
  };

  return (
    <div className="w-full h-full overflow-hidden flex flex-col">
      <div className='bg-white border-b border-gray-200 py-1 px-4 flex-shrink-0'>
        <div className='flex items-center'>
          <div className='flex items-center'>
            <div className='w-7 h-7 rounded-md flex items-center justify-center bg-[--theme-color] text-white mr-3'>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <span className='font-medium text-gray-900'>Подписки</span>
          </div>

          <div className='flex ml-4'>
            <span
              onClick={() => setActiveView('current')}
              className={getTabClassName('current')}
            >
              Текущий тариф
            </span>
            <span
              onClick={() => setActiveView('all')}
              className={getTabClassName('all')}
            >
              Все подписки
            </span>
          </div>
        </div>
      </div>

      <div className='flex-1 overflow-auto p-4 md:p-6'>
        {renderPageContent()}
      </div>
    </div>
  );
}; 