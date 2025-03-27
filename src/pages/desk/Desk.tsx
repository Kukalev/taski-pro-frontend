import {AllDesks} from '../tasks/allDesks/AllDesks'


export const Desk = () => {
	// Обработчик создания новой доски
	const handleDeskCreated = (newDesk: any) => {
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
