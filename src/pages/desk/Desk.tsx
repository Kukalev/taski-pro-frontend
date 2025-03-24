import { useState } from 'react'
import { SuccessModal } from '../../components/modals/SuccessModal'
import { AllDesks } from '../tasks/allDesks/AllDesks'

// Типы данных
interface DeskData {
	id: number
	deskName: string
	deskDescription: string
	deskCreateDate: Date
	deskFinishDate: Date | null
	userLimit?: number
}

export const Desk = () => {
	const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false)
	const [successMessage, setSuccessMessage] = useState<string>('')

	// Обработчик создания новой доски
	const handleDeskCreated = (newDesk: any) => {
		console.log('Desk: Получена новая доска:', newDesk)

		// Показываем сообщение об успехе
		setSuccessMessage(`Доска "${newDesk.deskName}" успешно создана!`)
		setIsSuccessModalOpen(true)
	}

	return (
		<div className='h-full'>
			{/* Используем компонент AllDesks для отображения досок в табличном виде */}
			<AllDesks onDeskCreated={handleDeskCreated} />

			{/* Модальное окно успеха */}
			<SuccessModal isOpen={isSuccessModalOpen} onClose={() => setIsSuccessModalOpen(false)} message={successMessage} autoCloseTime={3000} />
		</div>
	)
}
