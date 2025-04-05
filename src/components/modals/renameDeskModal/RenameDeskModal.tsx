import React, { useEffect, useState, useRef } from 'react'
import { DeskService } from '../../../services/desk/Desk'
import { DeskData } from '../../../contexts/DeskContext'
import { ThemedButton } from '../../ui/ThemedButton'

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
	initialDeskName: string
	initialDeskDescription: string
	onClose: () => void
	onSuccess: (updatedDeskData: DeskData) => void
}

export const RenameDeskModal = ({ isOpen, deskId, initialDeskName, initialDeskDescription, onClose, onSuccess }: RenameDeskModalProps) => {
	const [deskName, setDeskName] = useState(initialDeskName)
	const [deskDescription, setDeskDescription] = useState(initialDeskDescription)
	const [error, setError] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const modalRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (isOpen) {
			setError(null)
			setDeskName(initialDeskName)
			setDeskDescription(initialDeskDescription)
		}
	}, [isOpen, initialDeskName, initialDeskDescription])

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
			const payload = { deskName, deskDescription }
			console.log(`[RenameDeskModal] Отправка данных для ID ${deskId}:`, payload)

			const updatedDesk = await DeskService.updateDesk(deskId, payload)

			console.log('[RenameDeskModal] Успешный ответ:', updatedDesk)

			if (typeof updatedDesk === 'object' && updatedDesk !== null && 'id' in updatedDesk && 'deskName' in updatedDesk) {
				onSuccess(updatedDesk as DeskData)
				onClose()
			} else {
				console.error('[RenameDeskModal] Сервис вернул неожиданный формат данных:', updatedDesk)
				setError('Не удалось обновить доску: получен неверный ответ от сервера.')
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

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300"
			aria-labelledby="modal-title"
			role="dialog"
			aria-modal="true"
		>
			<div
				ref={modalRef}
				className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-auto transform transition-all duration-300"
			>
				<div className="flex justify-between items-center mb-4">
					<h2 id="modal-title" className="text-lg font-semibold text-gray-900">
						Переименовать доску
					</h2>
					<button
						type="button"
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600"
						aria-label="Закрыть"
						disabled={isLoading}
					>
						<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				<form onSubmit={handleSubmit}>
					{error && <p className='text-red-500 text-sm mb-4'>{error}</p>}
					<div className='mb-4'>
						<label htmlFor='deskNameInput' className="block text-sm font-medium text-gray-700 mb-1">
							Название доски
						</label>
						<input
							type="text"
							id='deskNameInput'
							value={deskName}
							onChange={e => setDeskName(e.target.value)}
							required
							disabled={isLoading}
							autoComplete="off"
							className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-50"
						/>
					</div>
					<div className='mb-6'>
						<label htmlFor='deskDescriptionInput' className="block text-sm font-medium text-gray-700 mb-1">
							Описание (необязательно)
						</label>
						<textarea
							id='deskDescriptionInput'
							value={deskDescription}
							onChange={e => setDeskDescription(e.target.value)}
							rows={3}
							disabled={isLoading}
							className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-50"
						/>
					</div>
					<div className='flex justify-end space-x-3 border-t border-gray-200 pt-4 mt-6'>
						<ThemedButton type='button' variant='secondary' onClick={onClose} disabled={isLoading}>
							Отмена
						</ThemedButton>
						<ThemedButton type='submit' disabled={isLoading}>
							{isLoading ? 'Сохранение...' : 'Сохранить'}
						</ThemedButton>
					</div>
				</form>
			</div>
		</div>
	)
}
