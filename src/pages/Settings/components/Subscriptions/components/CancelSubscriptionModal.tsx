import React, {useState} from 'react'
import {SubscriptionType} from '../../../../../services/subscriptions/types.ts' // Импортируем тип

// Интерфейс пропсов для новой модалки
interface CancelSubscriptionModalProps {
	isOpen: boolean;
	subscriptionType: SubscriptionType | null | undefined; // Тип подписки для отображения
	onClose: () => void; // Функция закрытия
	onConfirm: () => Promise<void>; // Асинхронная функция подтверждения
	isLoading: boolean; // Флаг загрузки от родителя
}

export const CancelSubscriptionModal: React.FC<CancelSubscriptionModalProps> = ({
	isOpen,
	subscriptionType,
	onClose,
	onConfirm,
	isLoading
}) => {
	// Локальное состояние для ошибки внутри модалки
	const [error, setError] = useState('');

	const handleConfirmClick = async () => {
		setError(''); // Сбрасываем ошибку
		try {
			// Вызываем асинхронный колбэк подтверждения, переданный извне
			await onConfirm();
			// Закрытие модалки происходит в родительском компоненте после успешного onConfirm
            // или можно закрыть здесь onClose();
		} catch (error: any) {
			console.error('Ошибка при отмене подписки (в модалке):', error);
			// Устанавливаем локальную ошибку для отображения в модалке
			setError(error.message || 'Не удалось отменить подписку');
		}
	};

	// Не рендерим ничего, если модалка закрыта
	if (!isOpen) return null;

	// Не рендерим, если нет типа подписки (хотя такого быть не должно, если isOpen=true)
    if (!subscriptionType) return null;

	return (
		// Оверлей и центрирование
		<div className='fixed inset-0 z-50 overflow-y-auto'>
			<div className='flex min-h-screen items-center justify-center px-4'>
				{/* Фон */}
				<div className='fixed inset-0 bg-black opacity-40 transition-opacity' onClick={onClose}></div>

				{/* Контент модалки */}
				<div className='relative w-full max-w-md rounded-lg bg-white p-6 pt-10 shadow-xl'>
					{/* --- Кнопка закрытия (крестик) --- */}
					<button
						type="button"
						onClick={onClose}
						disabled={isLoading} // Блокируем крестик во время загрузки
						className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 cursor-pointer"
						aria-label="Закрыть"
					>
						<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
							<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>

					<h2 className='mb-4 text-xl font-semibold text-gray-800'>Отмена подписки</h2>

					<p className='mb-4 text-gray-600'>
						Вы уверены, что хотите отменить подписку{' '}
						<span className='font-medium text-gray-900'>{subscriptionType}</span>?
						Это действие приведет к немедленной деактивации подписки.
					</p>

					{/* Отображение ошибки */}
					{error && <div className='mb-4 p-2 bg-red-50 text-red-700 rounded-md text-sm'>{error}</div>}

					{/* Кнопки */}
					<div className='flex justify-end space-x-3'>
						<button
							type='button'
							onClick={onClose}
							disabled={isLoading} // Блокируем во время загрузки
							className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50 cursor-pointer'
						>
							Отмена
						</button>
						<button
							type='button'
							onClick={handleConfirmClick}
							disabled={isLoading} // Блокируем во время загрузки
							className='px-4 py-2 text-sm font-medium text-white rounded-md transition-colors disabled:opacity-70 disabled:cursor-wait flex items-center justify-center cursor-pointer'
							style={{
								backgroundColor: isLoading ? 'var(--theme-color-light)' : 'var(--theme-color)',
							}}
						>
							{isLoading ? (
								<>
									<svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
										<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								  	</svg>
								</>
							) : 'Отменить подписку'}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}; 