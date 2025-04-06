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

	// Внутренняя функция закрытия: сбрасывает состояние и вызывает родительскую onClose
	const handleInternalClose = () => {
		console.log("Internal close: Resetting state and closing.");
		setDeskName(''); // Сброс имени
		setDeskDescription(''); // Сброс описания
		setError(null); // Сброс ошибки
		onClose(); // Вызов функции закрытия из родителя
	};

	// Обработчик клика вне модального окна использует internal close
	const handleOutsideClick = (event: MouseEvent) => {
		if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
			handleInternalClose();
		}
	}

	// Добавляем и удаляем обработчик при монтировании/размонтировании
	useEffect(() => {
		if (isOpen) {
			document.addEventListener('mousedown', handleOutsideClick)
		} else {
            // Если модалка закрывается извне (isOpen стал false), тоже сбросим на всякий случай,
            // хотя handleInternalClose должен был сработать раньше в большинстве случаев.
            setDeskName('');
            setDeskDescription('');
            setError(null);
        }
		return () => {
			document.removeEventListener('mousedown', handleOutsideClick)
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen]) // Оставляем зависимость только от isOpen, handleInternalClose стабильна

	// Убираем useEffect, который сбрасывал состояние при открытии
	/*
	useEffect(() => {
		if (isOpen) {
			setDeskName('')
			setDeskDescription('')
			setError(null)
		}
	}, [isOpen])
	*/

	const handleSubmit = async () => {
		setIsLoading(true)
		setError(null)

		try {
			const deskId = await DeskService.createDesk({
				deskName: deskName.trim(),
				deskDescription: deskDescription.trim()
			})
			const newDesk = await DeskService.getDeskById(Number(deskId))
			if (onDeskCreated) {
				onDeskCreated(newDesk)
			}
			// Используем internal close после успешного создания
			handleInternalClose();
		} catch (error: any) {
			console.error('Ошибка при создании доски:', error)
			setError(error.message || 'Произошла ошибка при создании доски')
            // Не закрываем окно при ошибке, чтобы пользователь видел сообщение
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
				{/* Заголовок - передаем handleInternalClose */}
				<ModalHeader title='Создание доски' onClose={handleInternalClose} />

				{/* Контент */}
				<ModalContent deskName={deskName} deskDescription={deskDescription} setDeskName={setDeskName} setDeskDescription={setDeskDescription} error={error} />

				{/* Кнопки */}
				<ModalButtons onSubmit={handleSubmit} isValid={isFormValid} isLoading={isLoading} />
			</div>
		</div>
	)
}
