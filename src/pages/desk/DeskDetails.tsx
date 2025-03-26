import { useEffect, useState, useCallback, useRef } from 'react'
import { Link, Navigate, Outlet, useLocation, useParams } from 'react-router-dom'
import { DeskData } from '../../components/sidebar/types/sidebar.types'
import { DeskService } from '../../services/desk/Desk'
import { DeskUpdateEvents } from '../../components/modals/renameDeskModal/RenameDeskModal'

export const DeskDetails = () => {
	const { id } = useParams<{ id: string }>()
	const location = useLocation()
	const [desk, setDesk] = useState<DeskData | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [updateCounter, setUpdateCounter] = useState(0)
	const loadingRef = useRef(false) // Для предотвращения двойных вызовов

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
		} catch (err: any) {
			console.error('Ошибка при загрузке доски:', err)
			setError(err.message || 'Не удалось загрузить информацию о доске')
		} finally {
			setLoading(false)
			loadingRef.current = false
		}
	}, [id, updateCounter])

	// Загрузка доски при первом рендере или изменении ID
	useEffect(() => {
		loadDesk()
	}, [loadDesk])

	// Подписка на обновления доски
	useEffect(() => {
		if (!id) return;
		
		console.log(`Подписываемся на обновления доски ID: ${id}`)
		
		// Используем наш механизм подписки для обновления доски
		const unsubscribe = DeskUpdateEvents.subscribe(Number(id), () => {
			console.log(`Получено событие обновления доски ID: ${id}`)
			// Увеличиваем счетчик, чтобы вызвать перезагрузку
			setUpdateCounter(prev => prev + 1);
		});
		
		return () => {
			// Отписываемся при размонтировании компонента
			console.log(`Отписываемся от обновлений доски ID: ${id}`)
			unsubscribe();
		};
	}, [id]);

	// Обновление заголовка страницы при загрузке доски
	useEffect(() => {
		if (desk) {
			document.title = `${desk.deskName} | Taski Pro`;
		} else {
			document.title = 'Загрузка... | Taski Pro';
		}
		
		return () => {
			document.title = 'Taski Pro';
		};
	}, [desk]);

	// Функция для обновления доски, которую можно вызвать из дочерних компонентов
	const refreshDesk = useCallback(() => {
		console.log('Ручное обновление доски вызвано')
		setUpdateCounter(prev => prev + 1);
	}, []);

	if (loading && !desk) {
		return <div className='p-6'>Загрузка доски...</div>
	}

	if (error && !desk) {
		return <div className='p-6 text-red-500'>Ошибка: {error}</div>
	}

	if (!desk) {
		return <Navigate to='/desk' replace />
	}

	const isOverviewActive = location.pathname.includes('/overview')
	const isBoardActive = location.pathname.includes('/board') || location.pathname === `/desk/${id}`

	return (
		<div className='w-full h-full overflow-hidden flex flex-col'>
			{/* Заголовок и вкладки */}
			<div className='bg-white border-b border-gray-200'>
				<div className='px-6 py-4'>
					<h1 className='text-2xl font-semibold text-gray-900'>{desk.deskName}</h1>
					<p className='text-gray-600'>{desk.deskDescription}</p>
				</div>

				{/* Вкладки */}
				<div className='flex px-6 border-b border-gray-200'>
					<Link to={`/desk/${id}/overview`} className={`py-3 px-4 font-medium border-b-2 transition-colors ${isOverviewActive ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'}`}>
						Обзор
					</Link>
					<Link to={`/desk/${id}/board`} className={`py-3 px-4 font-medium border-b-2 transition-colors ${isBoardActive ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'}`}>
						Задачи
					</Link>
				</div>
			</div>

			{/* Основной контент */}
			<div className='flex-1 overflow-auto bg-gray-50'>
				<Outlet context={{ desk, refreshDesk }} />
			</div>
		</div>
	)
}
