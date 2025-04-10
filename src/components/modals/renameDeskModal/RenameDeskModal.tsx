import React, {useEffect, useRef, useState} from 'react'
import {DeskService} from '../../../services/desk/Desk'
import {DeskData} from '../../../contexts/DeskContext'
import {ThemedButton} from '../../ui/ThemedButton'

export const DeskUpdateEvents = {
	listeners: new Map<number, Set<() => void>>(),
	
	subscribe: (deskId: number, callback: () => void) => {
		const callbacks = DeskUpdateEvents.listeners.get(deskId) || new Set();
		callbacks.add(callback);
		DeskUpdateEvents.listeners.set(deskId, callbacks);
		
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
	initialDeskName: string
	// initialDeskDescription: string 
	onClose: () => void
	onSuccess: (updatedDeskData: Partial<DeskData>) => void
}

export const RenameDeskModal = ({ isOpen, deskId, initialDeskName, onClose, onSuccess }: RenameDeskModalProps) => {
	const [deskName, setDeskName] = useState(initialDeskName || '')
	const [error, setError] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const modalRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (isOpen) {
			setError(null)
			setDeskName(initialDeskName || '')
		}
	}, [isOpen, initialDeskName])

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
				onClose()
			}
		}

		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside)
		} else {
			document.removeEventListener('mousedown', handleClickOutside)
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [isOpen, onClose])

	useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				onClose()
			}
		}
		if (isOpen) {
			document.addEventListener('keydown', handleEscape)
		} else {
			document.removeEventListener('keydown', handleEscape)
		}
		return () => {
			document.removeEventListener('keydown', handleEscape)
		}
	}, [isOpen, onClose])

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		if (!deskId) return

		setError(null)
		setIsLoading(true)

		try {
			const payload = { deskName };
			console.log(`[RenameDeskModal] Отправка данных для ID ${deskId}:`, payload)

			const response = await DeskService.updateDesk(deskId, payload)
			console.log('[RenameDeskModal] Ответ сервера (статус):', response.status)

			if (response.status === 200) {
				console.log('[RenameDeskModal] Успешное обновление (статус 200)')
				onSuccess({
					id: deskId, 
					deskName: deskName 
				} as Partial<DeskData>); 
				onClose()
			} else {
				console.error(`[RenameDeskModal] Сервер вернул статус ${response.status}, но ожидался 200.`)
				setError(`Не удалось обновить доску: неожиданный статус ${response.status}`)
			}
		} catch (err: any) {
			console.error('[RenameDeskModal] Ошибка при обновлении:', err)
			if (err.response) {
				console.error('[RenameDeskModal] Статус ошибки:', err.response.status)
				console.error('[RenameDeskModal] Данные ошибки:', err.response.data)
				if (err.response.status === 401) {
					setError('Ошибка авторизации. Возможно, ваша сессия истекла.')
				} else if (err.response.status === 403) {
					setError('У вас нет прав для переименования этой доски.')
				} else {
					const message = err.response.data?.message || err.response.data?.error || 'Не удалось обновить доску'
					setError(`Ошибка ${err.response.status}: ${message}`)
				}
			} else if (err.request) {
				console.error('[RenameDeskModal] Ошибка запроса (нет ответа от сервера):', err.request)
				setError('Не удалось связаться с сервером. Проверьте ваше интернет-соединение.')
			} else {
				console.error('[RenameDeskModal] Неизвестная ошибка:', err.message)
				setError('Произошла неизвестная ошибка.')
			}
		} finally {
			setIsLoading(false)
		}
	}

	if (!isOpen) return null

	const isChanged = typeof initialDeskName === 'string' &&
					  deskName.trim() !== initialDeskName.trim() && 
					  deskName.trim() !== '';

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300"
			style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)' }} 
			aria-labelledby="modal-title"
			role="dialog"
			aria-modal="true"
			onClick={onClose}
		>
			<div
				ref={modalRef}
				className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md transform transition-all duration-300"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex justify-between items-center mb-4">
					<h2 id="modal-title" className="text-lg font-semibold text-gray-900">
						Редактирование проекта
					</h2>
					<button
						type="button"
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600 cursor-pointer"
						aria-label="Закрыть"
						disabled={isLoading}
					>
						<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				<form onSubmit={handleSubmit}>
					{error && <p className='text-red-500 text-sm mb-4'>{error}</p>}
					<div className='mb-4'>
						<label htmlFor='deskNameInput' className="block text-sm font-medium text-gray-700 mb-2">
							Название проекта
						</label>
						<input
							type="text"
							id='deskNameInput'
							value={deskName}
							onChange={e => setDeskName(e.target.value)}
							required
							disabled={isLoading}
							autoComplete="off"
							className="w-full px-3 py-2 bg-gray-100 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:border-[var(--theme-color)] focus:ring-[var(--theme-color)] sm:text-sm disabled:bg-gray-50"
						/>
					</div>

					<div className='flex justify-end space-x-3 mt-6'> 
						<ThemedButton 
							type='submit' 
							disabled={isLoading || !isChanged} 
							className="px-5 py-2 rounded-lg transition-colors duration-200"> 
							{isLoading ? 'Сохранение...' : 'Сохранить'}
						</ThemedButton>
					</div>
				</form>
			</div>
		</div>
	)
}
