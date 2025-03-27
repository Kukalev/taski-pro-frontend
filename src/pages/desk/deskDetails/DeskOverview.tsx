import {useState} from 'react'
import {useOutletContext} from 'react-router-dom'
import {DeskData} from '../../../components/sidebar/types/sidebar.types'
import {DeskService} from '../../../services/desk/Desk'


type ContextType = {
	desk: DeskData
	refreshDesk: () => void
}

export const DeskOverview = () => {
	const { desk, refreshDesk } = useOutletContext<ContextType>()
	const [isEditingDescription, setIsEditingDescription] = useState(false)
	const [description, setDescription] = useState(desk.deskDescription || '')


	const handleSaveDescription = async () => {
		try {
			await DeskService.updateDesk(desk.id, {
				deskName: desk.deskName,
				deskDescription: description,
				deskFinishDate: desk.deskFinishDate || new Date()
			})
			setIsEditingDescription(false)
			refreshDesk()
		} catch (error) {
			console.error('Ошибка при обновлении описания:', error)
		}
	}

	

	// Получаем первую букву названия доски для логотипа
	const getFirstLetter = () => {
		if (!desk.deskName) return 'Ф'
		return desk.deskName.charAt(0).toUpperCase()
	}

	return (
		<div className='w-full'>
			{/* Верхняя часть с иконкой и информацией о доске */}
			<div className='bg-white py-6 px-6'>
				<div className='flex max-w-5xl mx-auto'>
					<div className='flex flex-col items-center mr-8'>
						{/* Логотип */}
						<div className='w-20 h-20 bg-red-400 rounded-md flex items-center justify-center text-white text-4xl mb-2'>
							{getFirstLetter()}
						</div>
						{/* Название доски под аватаркой */}
						<h1 className='text-xl font-bold text-gray-900 text-center'>{desk.deskName}</h1>
					</div>

					{/* Кнопки управления по центру между началом фотки и концом названия */}
					<div className='flex items-center h-20 space-x-3'>
						<button className='flex items-center px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-sm transition-colors'>
							<svg className='w-4 h-4 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
								<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
							</svg>
							Не выбрано
						</button>
						<div className='flex items-center px-3 py-1.5 text-sm'>
							<span className='w-2 h-2 bg-green-500 rounded-full mr-2'></span>
							<span>В работе</span>
							<svg className='w-4 h-4 ml-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
								<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
							</svg>
						</div>
						<button className='flex items-center px-3 py-1.5 border border-gray-300 hover:bg-gray-100 rounded text-sm transition-colors'>
							<svg className='w-4 h-4 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'
								/>
							</svg>
							Подписаться
						</button>
					</div>
				</div>
			</div>

			{/* Блок описания */}
			<div className='max-w-5xl mx-auto px-4 py-6'>
				<div className='bg-gray-50 rounded-lg mb-6'>
					{!isEditingDescription ? (
						<div className='min-h-[60px] text-gray-600 cursor-pointer hover:bg-gray-100 p-4 rounded-lg' onClick={() => setIsEditingDescription(true)}>
							{desk.deskDescription ? <p>{desk.deskDescription}</p> : <p className='text-gray-400 text-center'>Добавить описание</p>}
						</div>
					) : (
						<div className='p-4'>
							<textarea className='w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3' placeholder='Добавить описание' rows={4} value={description} onChange={e => setDescription(e.target.value)} autoFocus />
							<div className='flex justify-end space-x-2'>
								<button className='px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200' onClick={() => setIsEditingDescription(false)}>
									Отмена
								</button>
								<button className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600' onClick={handleSaveDescription}>
									Сохранить
								</button>
							</div>
						</div>
					)}
				</div>

				{/* Блок участников */}
				<div className='bg-white rounded-lg shadow mb-6'>
					<div className='flex justify-between items-center p-4 border-b'>
						<h2 className='text-lg font-medium'>Участники</h2>
						<button className='text-blue-500 hover:text-blue-700 text-sm'>Добавить участников</button>
					</div>
					<div className='p-4'>
						<div className='flex items-center'>
							<div className='w-10 h-10 rounded-full bg-pink-200 flex items-center justify-center text-pink-600 font-medium mr-4'>АА</div>
							<div>
								<div className='font-medium'>Вы (Супер-админ)</div>
								<div className='text-sm text-gray-500'>Участник</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
