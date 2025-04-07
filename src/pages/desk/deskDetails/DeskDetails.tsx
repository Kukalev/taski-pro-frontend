import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {Link, Navigate, Outlet, useLocation, useParams} from 'react-router-dom'
import {
	DeskUpdateEvents
} from '../../../components/modals/renameDeskModal/RenameDeskModal.tsx'
import {DeskData, useDesks} from '../../../contexts/DeskContext.tsx'
import {DeskService} from '../../../services/desk/Desk.ts'
import {UserService} from '../../../services/users/Users'
import {canEditDesk} from '../../../utils/permissionUtils'
import { UserOnDesk } from '../../DeskOverview/components/DeskParticipants/types'

export const DeskDetails = () => {
	const { id } = useParams<{ id: string }>()
	const location = useLocation()
	const [desk, setDesk] = useState<DeskData | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const loadingRef = useRef(false) // Для предотвращения двойных вызовов
	const [deskUsers, setDeskUsers] = useState<UserOnDesk[]>([])
	const [hasEditPermission, setHasEditPermission] = useState(false)
	
	// Получаем updateDesk из контекста для обновления сайдбара
	const { updateDesk: updateDeskInContext } = useDesks()

	const loadDesk = useCallback(async (forceUserRefresh = false) => {
		if (!id) return

		// Предотвращаем повторную загрузку, если уже загружаем
		if (loadingRef.current && !forceUserRefresh) {
			console.log('Загрузка уже выполняется, пропускаем повторный вызов')
			return
		}

		try {
			if (!forceUserRefresh) {
				loadingRef.current = true
				setLoading(true)
				console.log(`Загружаем доску ID: ${id}`)
				const deskData = await DeskService.getDeskById(Number(id))
				console.log('Доска загружена:', deskData)
				setDesk(deskData)
				setError(null)
			}

			// Загружаем или перезагружаем пользователей
			console.log(`[loadDesk] Загружаем пользователей для доски ${id} (force=${forceUserRefresh})`)
			const users: UserOnDesk[] = await UserService.getUsersOnDesk(Number(id), forceUserRefresh)
			console.log(`[loadDesk] Пользователи загружены:`, users)
			setDeskUsers(users)

			// Проверяем права только если есть пользователи
			if (users && users.length > 0) {
				const canEdit = canEditDesk(users)
				setHasEditPermission(canEdit)
				console.log(`Права на редактирование доски: ${canEdit ? 'Есть' : 'Нет'}`)
			} else {
				setHasEditPermission(false) // Нет прав, если нет пользователей
			}
		} catch (err) {
			console.error('Ошибка при загрузке доски или пользователей:', err)
			setError(err instanceof Error ? err.message : 'Не удалось загрузить информацию о доске/пользователях')
			// Сбрасываем пользователей и права при ошибке
			setDeskUsers([])
			setHasEditPermission(false)
		} finally {
			// Снимаем общий лоадер только при полной перезагрузке
			if (!forceUserRefresh) {
				setLoading(false)
				loadingRef.current = false
			}
		}
	}, [id])

	// Загрузка доски при первом рендере или изменении ID
	useEffect(() => {
		loadDesk()
	}, [loadDesk])

	// Новая функция для обновления только пользователей
	const refreshDeskUsers = useCallback(() => {
		console.log('[DeskDetails] ==> refreshDeskUsers ВЫЗВАН');
		loadDesk(true)
		console.log('[DeskDetails] ==> refreshDeskUsers: loadDesk(true) ЗАВЕРШЕН');
	}, [loadDesk])

	// Добавим useEffect для отслеживания deskUsers
	useEffect(() => {
		console.log('[DeskDetails] ==> useEffect[deskUsers]: Состояние deskUsers ОБНОВЛЕНО:', deskUsers);
	}, [deskUsers]);

	// Подписка на внешние обновления (ВРЕМЕННО ОТКЛЮЧАЕМ ДЛЯ ТЕСТА)
	// useEffect(() => {
	// 	if (!id) return;
	// 	console.log(`Подписываемся на обновления доски ID: ${id} (DeskUpdateEvents)`);
	// 	const callback = () => { // Define callback separately
	// 		console.log(`Получено событие обновления доски ID: ${id} (DeskUpdateEvents) - вызываем refreshDesk`);
	// 		refreshDesk(); // Полная перезагрузка по событию
	// 	};
	// 	const unsubscribe = DeskUpdateEvents.subscribe(Number(id), callback);
	// 	return () => {
	// 		console.log(`Отписываемся от обновлений доски ID: ${id} (DeskUpdateEvents)`);
	// 		unsubscribe();
	// 	};
	// }, [id, refreshDesk]); // Зависимости тоже комментируем

	// Обновление заголовка страницы при загрузке доски
	useEffect(() => {
		if (desk) {
			document.title = `${desk.deskName} | Taski Pro`
		} else {
			document.title = 'Загрузка... | Taski Pro'
		}

		return () => {
			document.title = 'Taski Pro'
		}
	}, [desk])

	// Старый refreshDesk для полной перезагрузки
	const refreshDesk = useCallback(() => {
		console.log('Полное обновление доски вызвано (refreshDesk)');
		loadDesk(); // Просто вызываем loadDesk
	}, [loadDesk]);

	// --- Обновляем updateLocalDesk ---
	const updateLocalDesk = useCallback((updatedData: Partial<DeskData>, isOptimistic: boolean = false) => {
		// Важно: Partial<DeskData> позволяет передавать только измененные поля
		console.log(`[DeskDetails] updateLocalDesk вызван. isOptimistic: ${isOptimistic}, Данные:`, updatedData);

		// Обновляем локальное состояние В ЛЮБОМ СЛУЧАЕ (сливаем новые данные с текущими)
		setDesk(prevDesk => {
			if (!prevDesk) return updatedData as DeskData; // Если prevDesk null, просто берем новые данные
			return { ...prevDesk, ...updatedData }; // Сливаем старые и новые
		});

		// Обновляем заголовок вкладки, если имя изменилось
		if (updatedData.deskName) {
			document.title = `${updatedData.deskName} | Taski Pro`;
			console.log(`[DeskDetails] Заголовок вкладки обновлен на: ${updatedData.deskName}`);
		}

		// Обновляем контекст ТОЛЬКО если это не оптимистичное обновление
		// или если мы получили полный объект DeskData (обычно после ответа API)
		if (!isOptimistic && updatedData && typeof updatedData.id === 'number') {
			console.log('[DeskDetails] Обновляем DeskContext данными:', updatedData);
			updateDeskInContext(updatedData as DeskData); // Приводим к DeskData, т.к. проверили id
		} else {
			console.log('[DeskDetails] Пропускаем обновление DeskContext (isOptimistic или нет ID).');
		}
	}, [updateDeskInContext]); // Зависимость от updateDeskInContext

	// --- НОВАЯ Функция для обновления ТОЛЬКО списка пользователей локально ---
	const updateLocalUsers = useCallback((updater: (prevUsers: UserOnDesk[]) => UserOnDesk[]) => {
			console.log('[DeskDetails] updateLocalUsers вызван.');
			setDeskUsers(updater); // Используем функцию-апдейтер
	}, []); // Пустой массив зависимостей, т.к. она использует только setDeskUsers

	// --- Мемоизируем значение контекста для Outlet ---
	const outletContextValue = useMemo(() => ({
		desk,
		updateLocalDesk,
		refreshDeskUsers,
		hasEditPermission,
		deskUsers,
		updateLocalUsers // Добавляем новую функцию в контекст
	}), [desk, updateLocalDesk, refreshDeskUsers, hasEditPermission, deskUsers, updateLocalUsers]); // Добавляем updateLocalUsers в зависимости

	// --- Проверки перед рендерингом ---

	// 1. Если идет загрузка, показываем лоадер
	if (loading) {
		console.log('[DeskDetails Render] State: Loading...');
		return <div className='p-6'>Загрузка доски...</div>;
	}

	// 2. Если есть ошибка (и загрузка завершена), показываем ошибку
	if (error) {
		console.log('[DeskDetails Render] State: Error:', error);
		// Можно показать сообщение об ошибке или перенаправить
		return <div className='p-6 text-red-500'>Ошибка: {error}</div>;
	}

	// 3. Если НЕ идет загрузка и НЕТ ошибки, но `desk` все еще null/undefined
	//    Это нештатная ситуация, но обработаем ее.
	if (!desk) {
		console.error('[DeskDetails Render] !!! КРИТИЧЕСКАЯ ОШИБКА: Загрузка завершена, ошибок нет, но данные доски отсутствуют!', desk);
		// Показываем сообщение или редирект
		return <div className='p-6 text-red-500'>Критическая ошибка: не удалось получить данные доски.</div>;
		// Или можно вернуть Navigate, если это предпочтительнее
		// return <Navigate to='/desk' replace />;
	}

	// --- Если мы дошли сюда, значит: loading = false, error = null, desk = объект ---
	// Теперь можно безопасно рендерить основной контент

	// Определяем активные вкладки
	const isOverviewActive = location.pathname.endsWith('/overview')
	// Считаем активной доску, если путь НЕ обзор и НЕ гитхаб (по умолчанию доска)
	const isBoardActive = !isOverviewActive && !location.pathname.endsWith('/github')
	// Новая проверка для GitHub
	const isGitHubActive = location.pathname.endsWith('/github')

	// Получаем первую букву названия доски
	const getFirstLetter = () => {
		if (!desk || !desk.deskName) return 'Д'
		return desk.deskName.charAt(0).toUpperCase()
	}

	console.log('[DeskDetails Render] Готов к рендеру с desk:', JSON.stringify(desk, null, 2));

	return (
		<div className='w-full h-full overflow-hidden flex flex-col'>
			{/* Верхняя навигационная панель */}
			<div className='bg-white border-b border-gray-200 py-1 px-4'>
				<div className='flex items-center'>
					{/* Логотип */}
					<div className='flex items-center'>
						<div 
							className='w-7 h-7 rounded-md flex items-center justify-center text-white mr-3'
							// Применяем цвет темы к фону логотипа
							style={{ backgroundColor: 'var(--theme-color)' }}
						>
							{getFirstLetter()}
						</div>
						<span className='font-medium text-gray-900'>{desk.deskName}</span>
					</div>
					
					{/* Статус (можно оставить зеленым или тоже привязать к теме) */}
					<div className='flex items-center text-sm ml-4'>
						<span className='w-2 h-2 bg-green-500 rounded-full mr-1'></span>
						<span>В работе</span>
					</div>
					
					{/* Навигационные вкладки */}
					<div className='flex ml-4'>
						<Link 
							to={`/desk/${id}/overview`} 
							// Убираем text-indigo-300 из активного класса
							className={`py-1 px-3 font-medium ${!isOverviewActive ? 'text-gray-600 hover:text-gray-900' : ''}`}
							// Устанавливаем цвет текста через стиль, если активно
							style={isOverviewActive ? { color: 'var(--theme-color)' } : {}}
						>
							Обзор
						</Link>
						<Link 
							to={`/desk/${id}/board`} 
							// Убираем text-indigo-300 из активного класса
							className={`py-1 px-3 font-medium ${!isBoardActive ? 'text-gray-600 hover:text-gray-900' : ''}`}
							// Устанавливаем цвет текста через стиль, если активно
							style={isBoardActive ? { color: 'var(--theme-color)' } : {}}
						>
							Задачи
						</Link>
						{/* Новая ссылка на GitHub */}
						<Link
							to={`/desk/${id}/github`}
							className={`py-1 px-3 font-medium ${!isGitHubActive ? 'text-gray-600 hover:text-gray-900' : ''}`}
							style={isGitHubActive ? { color: 'var(--theme-color)' } : {}}
						>
							GitHub
						</Link>
					</div>
				</div>
			</div>

			{/* Основной контент */}
			<div className='flex-1 overflow-auto'>
				{/* Передаем мемоизированное значение контекста */}
				<Outlet context={outletContextValue} />
			</div>
		</div>
	)
}
