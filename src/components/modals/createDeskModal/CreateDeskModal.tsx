import { useEffect, useRef, useState } from 'react'
import { DeskService } from '../../../services/desk/Desk'
import { ModalButtons } from './components/ModalButtons'
import { ModalContent } from './components/ModalContent'
import { ModalHeader } from './components/ModalHeader'
import { CreateDeskModalProps } from './types/createDeskModal.types'
import { validateDeskData } from './utils/modalHelpers'

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

	// Проверка валидности данных
	const isFormValid = validateDeskData(deskName)

	if (!isOpen) return null

	return (
		<div className='fixed inset-0 flex items-center justify-center z-[9999]'>
			{/* Затемненный фон */}
			<div className='absolute inset-0 bg-black/20 backdrop-blur-[2px]' />

			{/* Модальное окно */}
			<div ref={modalRef} className='relative bg-gray-100 rounded-xl w-[480px] shadow-xl'>
				{/* Заголовок */}
				<ModalHeader title='Создание доски' onClose={onClose} />

				{/* Контент */}
				<ModalContent deskName={deskName} deskDescription={deskDescription} setDeskName={setDeskName} setDeskDescription={setDeskDescription} error={error} />

				{/* Кнопки */}
				<ModalButtons onSubmit={handleSubmit} isValid={isFormValid} isLoading={isLoading} />
			</div>
		</div>
	)
}
