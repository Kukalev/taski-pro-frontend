import {useCallback, useEffect, useRef, useState} from 'react'
import {Link, Navigate, Outlet, useLocation, useParams} from 'react-router-dom'
import {
	DeskUpdateEvents
} from '../../../components/modals/renameDeskModal/RenameDeskModal.tsx'
import {DeskData} from '../../../components/sidebar/types/sidebar.types.ts'
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
	const [updateCounter, setUpdateCounter] = useState(0)
	const loadingRef = useRef(false) // Для предотвращения двойных вызовов
	const [deskUsers, setDeskUsers] = useState<UserOnDesk[]>([])
	const [hasEditPermission, setHasEditPermission] = useState(false)
	
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

	// Загрузка доски при изменении updateCounter (полная перезагрузка)
	useEffect(() => {
		if (updateCounter > 0) {
			loadDesk()
		}
	}, [updateCounter, loadDesk])

	// Новая функция для обновления только пользователей
	const refreshDeskUsers = useCallback(() => {
		console.log('[refreshDeskUsers] Вызвано обновление только пользователей')
		loadDesk(true) // Вызываем loadDesk с флагом forceUserRefresh = true
	}, [loadDesk])

	// Подписка на обновления доски
	useEffect(() => {
		if (!id) return

		console.log(`Подписываемся на обновления доски ID: ${id}`)

		// Используем наш механизм подписки для обновления доски
		const unsubscribe = DeskUpdateEvents.subscribe(Number(id), () => {
			console.log(`Получено событие обновления доски ID: ${id}`)
			// Увеличиваем счетчик, чтобы вызвать перезагрузку
			setUpdateCounter(prev => prev + 1)
		})

		return () => {
			// Отписываемся при размонтировании компонента
			console.log(`Отписываемся от обновлений доски ID: ${id}`)
			unsubscribe()
		}
	}, [id])

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

	// Функция для полной перезагрузки (старый refreshDesk)
	const refreshDesk = useCallback(() => {
		console.log('Полное обновление доски вызвано (refreshDesk)')
		setUpdateCounter(prev => prev + 1)
	}, [])

	if (loading && !desk) {
		return <div className='p-6'>Загрузка доски...</div>
	}

	if (error && !desk) {
		return <div className='p-6 text-red-500'>Ошибка: {error}</div>
	}

	if (!desk) {
		return <Navigate to='/desk' replace />
	}

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
				<Outlet context={{ desk, refreshDesk, refreshDeskUsers, hasEditPermission, deskUsers }} />
			</div>
		</div>
	)
}
