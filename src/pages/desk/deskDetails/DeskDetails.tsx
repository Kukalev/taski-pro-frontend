import {useCallback, useEffect, useRef, useState} from 'react'
import {Link, Navigate, Outlet, useLocation, useParams} from 'react-router-dom'
import {
	DeskUpdateEvents
} from '../../../components/modals/renameDeskModal/RenameDeskModal.tsx'
import {DeskData} from '../../../components/sidebar/types/sidebar.types.ts'
import {DeskService} from '../../../services/desk/Desk.ts'
import {UserService} from '../../../services/users/Users'
import {canEditDesk} from '../../../utils/permissionUtils'

export const DeskDetails = () => {
	const { id } = useParams<{ id: string }>()
	const location = useLocation()
	const [desk, setDesk] = useState<DeskData | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [updateCounter, setUpdateCounter] = useState(0)
	const loadingRef = useRef(false) // Для предотвращения двойных вызовов
	const [deskUsers, setDeskUsers] = useState<any[]>([])
	const [hasEditPermission, setHasEditPermission] = useState(false)
	
	const loadDesk = useCallback(async () => {
		if (!id) return

		// Предотвращаем повторную загрузку, если уже загружаем
		if (loadingRef.current) {
			console.log('Загрузка уже выполняется, пропускаем повторный вызов')
			return
		}

		try {
			loadingRef.current = true
			setLoading(true)
			console.log(`Загружаем доску ID: ${id}`)

			const deskData = await DeskService.getDeskById(Number(id))
			console.log('Доска загружена:', deskData)

			setDesk(deskData)
			setError(null)
			
			// Загружаем пользователей для проверки прав
			try {
				const users = await UserService.getUsersOnDesk(Number(id))
				setDeskUsers(users)
				
				// Проверяем права пользователя
				const canEdit = canEditDesk(users)
				setHasEditPermission(canEdit)
				console.log(`Права на редактирование доски: ${canEdit ? 'Есть' : 'Нет'}`)
			} catch (userError) {
				console.error('Ошибка при загрузке пользователей:', userError)
				setHasEditPermission(false)
			}
		} catch (err) {
			console.error('Ошибка при загрузке доски:', err)
			setError(err instanceof Error ? err.message : 'Не удалось загрузить информацию о доске')
		} finally {
			setLoading(false)
			loadingRef.current = false
		}
	}, [id]) // Удаляем updateCounter из зависимостей

	// Загрузка доски при первом рендере или изменении ID
	useEffect(() => {
		loadDesk()
	}, [loadDesk])

	// Загрузка доски при изменении updateCounter
	useEffect(() => {
		if (updateCounter > 0) {
			loadDesk()
		}
	}, [updateCounter, loadDesk])

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

	// Функция для обновления доски, которую можно вызвать из дочерних компонентов
	const refreshDesk = useCallback(() => {
		console.log('Ручное обновление доски вызвано')
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
	const isOverviewActive = location.pathname.includes('/overview')
	// Считаем активной, если путь содержит /board или заканчивается на /desk/ID
	const isBoardActive = location.pathname.includes('/board') || location.pathname === `/desk/${id}`

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
					</div>
				</div>
			</div>

			{/* Основной контент */}
			<div className='flex-1 overflow-auto'>
				<Outlet context={{ desk, refreshDesk, hasEditPermission, deskUsers }} />
			</div>
		</div>
	)
}
