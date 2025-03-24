import { useLocation } from 'react-router-dom'
import { getDeskColor } from '../../utils/deskColors'

// Интерфейс для доски
interface DeskData {
	id: number
	deskName: string
	deskDescription: string
	deskCreateDate: Date
}

interface SidebarDesksProps {
	desks: DeskData[]
	loading: boolean
	onDeskClick: (id: number) => void
	onAddClick: () => void
}

export const SidebarDesks = ({ desks, loading, onDeskClick, onAddClick }: SidebarDesksProps) => {
	const location = useLocation()

	return (
		<div className='flex-grow flex flex-col overflow-hidden'>
			{/* Фиксированный заголовок с кнопкой добавления */}
			<div className='flex justify-between items-center mb-2 px-4 flex-shrink-0'>
				<h3 className='text-[14px] font-medium text-gray-600'>Проекты</h3>
				<button onClick={onAddClick} className='w-5 h-5 rounded-sm bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 flex items-center justify-center transition-colors'>
					<svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
						<path d='M12 5v14M5 12h14' />
					</svg>
				</button>
			</div>

			{/* Скроллируемый список досок */}
			<div className='overflow-auto flex-grow mb-4'>
				{loading ? (
					<div className='text-center py-2 text-gray-500 text-sm'>Загрузка проектов...</div>
				) : desks.length > 0 ? (
					<ul className='space-y-1'>
						{desks.map(desk => (
							<li key={desk.id}>
								<button
									onClick={() => onDeskClick(desk.id)}
									className={`w-full h-[32px] text-left px-4 py-1 rounded-md flex items-center gap-2 cursor-pointer text-[13px] transition-all duration-200 hover:bg-gray-100
										${location.pathname === `/desk/${desk.id}` ? 'bg-gray-200 text-gray-900' : 'text-gray-700'}`}>
									<div className={`w-5 h-5 rounded flex items-center justify-center ${getDeskColor(desk.id)}`}>
										{desk.deskName.charAt(0).toUpperCase()}
									</div>
									<span className='truncate'>{desk.deskName}</span>
								</button>
							</li>
						))}
					</ul>
				) : (
					<div className='bg-gray-100 rounded-lg p-4 mx-2'>
						<h3 className='text-gray-900 font-medium mb-2'>Создайте свой проект</h3>
						<p className='text-gray-900 text-sm mb-4'>Создайте проект и пригласите в него команду для совместной работы</p>
						<button onClick={onAddClick} className='w-full bg-[#FF9500] text-white py-2 px-4 rounded-lg hover:opacity-90 transition-opacity cursor-pointer'>
							Добавить проект
						</button>
					</div>
				)}
			</div>
		</div>
	)
}
