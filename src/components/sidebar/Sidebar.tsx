import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDesks } from '../../contexts/DeskContext'
import { CreateDeskModal } from '../modals/CreateDeskModal'
import { SidebarDesks } from './SidebarDesks'

// Интерфейс для доски
interface DeskData {
	id: number
	deskName: string
	deskDescription: string
	deskCreateDate: Date
}

export const Sidebar = () => {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const navigate = useNavigate()
	const location = useLocation()
	
	// Получаем данные и функции из контекста
	const { desks, loading, addDesk } = useDesks()

	// Переход на нужный маршрут
	const handleItemClick = (path: string) => {
		navigate(path)
	}

	// Переход к конкретной доске
	const handleDeskClick = (id: number) => {
		navigate(`/desk/${id}`)
	}

	// Проверяем, активен ли пункт "Все доски"
	const isAllDesksActive = () => {
		return location.pathname === '/desk' || location.pathname === '/desk/'
	}

	// Используем функцию из контекста для добавления доски
	const handleDeskCreated = (newDesk: any) => {
		addDesk(newDesk)
	}

	return (
		<>
			<div className='w-70 min-w-[300px] bg-gray-50 h-[calc(100vh-3.5rem)] p-4 flex flex-col'>
				{/* Поиск */}
				<div className='mb-4'>
					<div className='relative'>
						<input type='text' placeholder='Поиск' className='w-full px-4 py-2 pl-10 bg-gray-100 border border-white rounded-2xl hover:bg-gray-200 focus:outline-none focus:bg-gray-200 transition-all duration-200' />
						<div className='absolute left-3 top-1/2 -translate-y-1/2'>
							<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' className='text-gray-400'>
								<path d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
							</svg>
						</div>
					</div>
				</div>

				{/* Основное меню */}
				<nav className='mb-4'>
					<ul className='space-y-1'>
						<li>
							<button
								className={`w-full h-[36px] text-left px-4 py-1 rounded-md flex items-center gap-3 cursor-pointer text-[14px] transition-all duration-200 
                    ${location.pathname === '/desk/myTasks' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
								onClick={() => handleItemClick('/desk/myTasks')}>
								<svg width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
									<path d='M12 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V12M9 15L20 4' />
								</svg>
								<span
									className={`transition-all duration-200 leading-none
                    ${location.pathname === '/desk/myTasks' ? 'text-gray-900 text-[16px]' : 'text-gray-700 text-[14px]'}`}>
									Мои задачи
								</span>
							</button>
						</li>
						<li>
							<button
								className={`w-full h-[36px] text-left px-4 py-1 rounded-md flex items-center gap-3 cursor-pointer text-[14px] transition-all duration-200 
                    ${location.pathname === '/desk/allTasks' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
								onClick={() => handleItemClick('/desk/allTasks')}>
								<svg width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
									<path d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' />
								</svg>
								<span
									className={`transition-all duration-200 leading-none
                    ${location.pathname === '/desk/allTasks' ? 'text-gray-900 text-[16px]' : 'text-gray-700 text-[14px]'}`}>
									Все задачи
								</span>
							</button>
						</li>
						<li>
							<button
								className={`w-full h-[36px] text-left px-4 py-1 rounded-md flex items-center gap-3 cursor-pointer text-[14px] transition-all duration-200 
                    ${isAllDesksActive() ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
								onClick={() => handleItemClick('/desk')}>
								<svg width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
									<path d='M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' />
								</svg>
								<span
									className={`transition-all duration-200 leading-none
                    ${isAllDesksActive() ? 'text-gray-900 text-[16px]' : 'text-gray-700 text-[14px]'}`}>
									Все доски
								</span>
							</button>
						</li>
					</ul>
				</nav>

				{/* Компонент с досками */}
				<SidebarDesks 
					desks={desks} 
					loading={loading} 
					onDeskClick={handleDeskClick} 
					onAddClick={() => setIsModalOpen(true)} 
				/>

				{/* Счетчик досок */}
				<div className='text-sm text-gray-500'>
					Создано {desks.length} из 7 досок
					<div className='mt-2 h-1 bg-gray-200 rounded-full'>
						<div className='h-full bg-[#FF9500] rounded-full' style={{ width: `${Math.min((desks.length / 7) * 100, 100)}%` }}></div>
					</div>
				</div>
			</div>

			<CreateDeskModal 
				isOpen={isModalOpen} 
				onClose={() => setIsModalOpen(false)} 
				onDeskCreated={handleDeskCreated} 
			/>
		</>
	)
}
