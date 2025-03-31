import {AllDesks} from '../tasks/allDesks/AllDesks'
import {DeskCreateDto} from '../../services/desk/types/desk.types.ts'


export const Desk = () => {
	// Обработчик создания новой доски
	const handleDeskCreated = (newDesk: DeskCreateDto) => {
		console.log('Desk: Получена новая доска:', newDesk)
		// Можно добавить toast уведомление здесь, если нужно
	}

	return (
		<div className='h-full'>
			{/* Используем компонент AllDesks для отображения досок в табличном виде */}
			<AllDesks onDeskCreated={handleDeskCreated} />
		</div>
	)
}
