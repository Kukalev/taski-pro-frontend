import React, {useCallback, useEffect, useState} from 'react'
import {
	SubscriptionService
} from '../../../../services/subscriptions/Subscriptions'
import {
	SubscriptionInfoDto,
	SubscriptionType,
	UserSubscriptionResponseDto
} from '../../../../services/subscriptions/types'
import {CurrentSubscriptionView} from './components/CurrentSubscriptionView'
import {AllSubscriptionsView} from './components/AllSubscriptionsView'

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

export const Subscriptions: React.FC = () => {
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
				} else {
					setCurrentUserSubscription(null);
				}
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
		if (error && !loadingAll && !loadingCurrent) {
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

	const getTabClassName = (isActive: boolean) => {
		const base = 'py-1 px-3 font-medium cursor-pointer block';
		const inactive = 'text-gray-600 hover:text-gray-900';
		return `${base} ${!isActive ? inactive : ''}`;
	};

	return (
		<div className="w-full overflow-hidden flex flex-col -ml-2 -mt-2.5">
			<div className="absolute ">
				<div className='inline-block bg-white rounded-t-md overflow-hidden'>
					<div className='flex'>
						<span
							onClick={() => setActiveView('current')}
							className={getTabClassName(activeView === 'current')}
							style={activeView === 'current' ? { color: 'var(--theme-color)' } : {}}
						>
							Текущий тариф
						</span>
						<span
							onClick={() => setActiveView('all')}
							className={getTabClassName(activeView === 'all')}
							style={activeView === 'all' ? { color: 'var(--theme-color)' } : {}}
						>
							Все подписки
						</span>
					</div>
				</div>
			</div>

			<div
				className={`
					px-4 md:px-6 pb-4 md:pb-6 bg-white  w-full rounded-b-md mb-4 mt-8
					${activeView === 'current' ? 'max-w-[370px]' : 'max-w-5xl'}
				`}
			>
				{renderPageContent()}
			</div>
		</div>
	);
};