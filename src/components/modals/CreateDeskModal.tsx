import { useEffect, useRef, useState } from 'react'
import { DeskService } from '../../services/desk/Desk'

// Добавляем интерфейс для полных данных доски
interface DeskData {
	id: number
	deskName: string
	deskDescription: string
	deskCreateDate: Date
	deskFinishDate: Date | null
	userLimit?: number
}

interface CreateDeskModalProps {
	isOpen: boolean
	onClose: () => void
	onDeskCreated?: (newDesk: DeskData) => void // Меняем тип параметра
}

export const CreateDeskModal = ({ isOpen, onClose, onDeskCreated }: CreateDeskModalProps) => {
	const [deskName, setDeskName] = useState('')
	const [deskDescription, setDeskDescription] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const modalRef = useRef<HTMLDivElement>(null)

	// Обработчик клика вне модального окна
	const handleOutsideClick = (event: MouseEvent) => {
		if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
			onClose()
		}
	}

	// Добавляем и удаляем обработчик при монтировании/размонтировании
	useEffect(() => {
		if (isOpen) {
			document.addEventListener('mousedown', handleOutsideClick)
		}
		return () => {
			document.removeEventListener('mousedown', handleOutsideClick)
		}
	}, [isOpen])

	// Сбрасываем состояние при закрытии/открытии модального окна
	useEffect(() => {
		if (isOpen) {
			setDeskName('')
			setDeskDescription('')
			setError(null)
		}
	}, [isOpen])

	const handleSubmit = async () => {
		setIsLoading(true)
		setError(null)

		try {
			// Создаем доску и получаем ID
			const deskId = await DeskService.createDesk({
				deskName: deskName.trim(),
				deskDescription: deskDescription.trim()
			})

			// Получаем полные данные созданной доски
			const newDesk = await DeskService.getDeskById(Number(deskId))

			// Уведомляем родительский компонент о новой доске
			if (onDeskCreated) {
				onDeskCreated(newDesk)
			}

			// Закрываем модальное окно
			onClose()
		} catch (error: any) {
			console.error('Ошибка при создании доски:', error)
			setError(error.message || 'Произошла ошибка при создании доски')
		} finally {
			setIsLoading(false)
		}
	}

	if (!isOpen) return null

	return (
		<div className='fixed inset-0 flex items-center justify-center z-[9999]'>
			{/* Затемненный фон */}
			<div className='absolute inset-0 bg-black/20 backdrop-blur-[2px]' />

			{/* Модальное окно */}
			<div ref={modalRef} className='relative bg-gray-100 rounded-xl w-[480px] shadow-xl'>
				{/* Заголовок */}
				<div className='flex justify-between items-center px-6 py-4 border-b border-gray-200'>
					<h2 className='text-[18px] font-medium text-gray-800'>Создание доски</h2>
					<button onClick={onClose} className='text-gray-400 hover:text-gray-600 transition-colors duration-200 cursor-pointer'>
						<svg className='w-3 h-3' viewBox='0 0 14 14' fill='none'>
							<path d='M13 1L1 13M1 1L13 13' stroke='currentColor' strokeWidth='2' strokeLinecap='round' />
						</svg>
					</button>
				</div>

				{/* Контент */}
				<div className='px-6 py-3'>
					{error && <div className='mb-4 p-3 bg-red-100 text-red-700 rounded-lg'>{error}</div>}

					<div className='mb-4'>
						<label className='block text-[15px] text-gray-900 font-medium mb-2'>Название доски</label>
						<input
							type='text'
							value={deskName}
							onChange={e => setDeskName(e.target.value)}
							placeholder='Введите название'
							className='w-full px-3 py-2 bg-gray-50 rounded-[6px] text-[14px] placeholder-gray-400
									  focus:bg-gray-200 focus:outline-none focus:border-none transition-all duration-250 hover:bg-gray-200'
						/>
					</div>

					<div className='mb-4'>
						<label className='block text-[15px] text-gray-900 font-medium mb-2'>Описание</label>
						<input
							type='text'
							value={deskDescription}
							onChange={e => setDeskDescription(e.target.value)}
							placeholder='Введите описание'
							className='w-full px-3 py-2 bg-gray-50 rounded-[6px] text-[14px] placeholder-gray-400
									  focus:bg-gray-200 focus:outline-none focus:border-none transition-all duration-250 hover:bg-gray-200'
						/>
					</div>

					{/* Кнопки */}
					<div className='flex justify-end'>
						<button
							onClick={handleSubmit}
							disabled={!deskName.trim() || isLoading}
							className={`px-4 py-1.5 rounded-[6px] text-[14px] font-medium transition-all duration-200
                            ${!deskName.trim() || isLoading ? 'bg-gray-100 text-gray-400 cursor-default' : 'bg-blue-500 text-white hover:bg-blue-600'}`}>
							{isLoading ? 'Создание...' : 'Создать'}
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}
