import { useEffect, useState } from 'react'
import { DeskService } from '../../../services/desk/Desk'
import { useDesks } from '../../../contexts/DeskContext'
import { useNavigate, useLocation } from 'react-router-dom'

// Создаем более надежный механизм для оповещения об обновлении доски
export const DeskUpdateEvents = {
	listeners: new Map<number, Set<() => void>>(),
	
	subscribe: (deskId: number, callback: () => void) => {
		const callbacks = DeskUpdateEvents.listeners.get(deskId) || new Set();
		callbacks.add(callback);
		DeskUpdateEvents.listeners.set(deskId, callbacks);
		
		// Возвращаем функцию для отписки
		return () => {
			const callbacks = DeskUpdateEvents.listeners.get(deskId);
			if (callbacks) {
				callbacks.delete(callback);
				if (callbacks.size === 0) {
					DeskUpdateEvents.listeners.delete(deskId);
				} else {
					DeskUpdateEvents.listeners.set(deskId, callbacks);
				}
			}
		};
	},
	
	notify: (deskId: number) => {
		console.log(`Оповещаем об обновлении доски ID: ${deskId}`);
		const callbacks = DeskUpdateEvents.listeners.get(deskId);
		if (callbacks) {
			callbacks.forEach(callback => {
				try {
					callback();
				} catch (error) {
					console.error('Ошибка при выполнении колбэка обновления:', error);
				}
			});
		}
	}
};

interface RenameDeskModalProps {
	isOpen: boolean
	deskId: number | null
	onClose: () => void
	onSuccess?: () => void
}

export const RenameDeskModal = ({ isOpen, deskId, onClose, onSuccess }: RenameDeskModalProps) => {
	const [deskName, setDeskName] = useState('')
	const [deskDescription, setDeskDescription] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState('')
	const navigate = useNavigate()
	const location = useLocation()
	const { loadDesks } = useDesks()

	useEffect(() => {
		if (isOpen && deskId) {
			setIsLoading(true)
			setError('')

			DeskService.getDeskById(deskId)
				.then(desk => {
					setDeskName(desk.deskName)
					setDeskDescription(desk.deskDescription)
				})
				.catch(err => {
					console.error('Ошибка при загрузке данных доски:', err)
					setError('Не удалось загрузить данные доски')
				})
				.finally(() => {
					setIsLoading(false)
				})
		}
	}, [isOpen, deskId])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!deskId || !deskName.trim()) {
			setError('Название доски не может быть пустым')
			return
		}

		setIsLoading(true)
		setError('')

		try {
			const updatedDesk = await DeskService.updateDesk(deskId, {
				deskName,
				deskDescription,
				deskFinishDate: new Date()
			})

			console.log('Доска успешно обновлена:', updatedDesk);

			// Обновляем список досок в контексте
			await loadDesks()

			// Оповещаем всех подписчиков об обновлении доски
			DeskUpdateEvents.notify(deskId);

			// Если мы находимся на странице этой доски и нужно обновить детали
			const isOnCurrentDeskPage = location.pathname.includes(`/desk/${deskId}`);
			if (isOnCurrentDeskPage) {
				// Принудительно перезагружаем компонент через навигацию
				const currentPath = location.pathname;
				console.log(`Перезагружаем страницу доски: ${currentPath}`);
				
				// Небольшая задержка для завершения обновления контекста
				setTimeout(() => {
					navigate(currentPath, { replace: true });
				}, 100);
			}

			if (onSuccess) {
				onSuccess()
			}
			
			onClose()
		} catch (error: any) {
			console.error('Ошибка при переименовании доски:', error)
			setError(error.message || 'Не удалось переименовать доску')
		} finally {
			setIsLoading(false)
		}
	}

	if (!isOpen) return null

	return (
		<div className='fixed inset-0 z-50 overflow-y-auto'>
			<div className='flex min-h-screen items-center justify-center px-4'>
				<div className='fixed inset-0 bg-black opacity-40 transition-opacity' onClick={onClose}></div>

				<div className='relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl'>
					<h2 className='mb-4 text-xl font-semibold'>Переименование доски</h2>

					<form onSubmit={handleSubmit}>
						{error && <div className='mb-4 p-2 bg-red-50 text-red-700 rounded-md text-sm'>{error}</div>}

						<div className='mb-4'>
							<label className='block text-sm font-medium text-gray-700 mb-1'>Название доски</label>
							<input
								type='text'
								value={deskName}
								onChange={e => setDeskName(e.target.value)}
								disabled={isLoading}
								className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100'
								placeholder='Введите название доски'
							/>
						</div>

						<div className='mb-6'>
							<label className='block text-sm font-medium text-gray-700 mb-1'>Описание</label>
							<textarea
								value={deskDescription}
								onChange={e => setDeskDescription(e.target.value)}
								disabled={isLoading}
								className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100'
								placeholder='Введите описание доски'
								rows={3}
							/>
						</div>

						<div className='flex justify-end space-x-3'>
							<button type='button' onClick={onClose} disabled={isLoading} className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md'>
								Отмена
							</button>
							<button type='submit' disabled={isLoading} className='px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-70'>
								{isLoading ? 'Сохранение...' : 'Сохранить'}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	)
}
