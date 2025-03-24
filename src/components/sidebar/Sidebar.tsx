import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDesks } from '../../contexts/DeskContext'
import { CreateDeskModal } from '../modals/createDeskModal/CreateDeskModal'
import { SidebarDesks } from './components/SidebarDesks'
import { SidebarFooter } from './components/SidebarFooter'
import { SidebarMenu } from './components/SidebarMenu'
import { SidebarSearch } from './components/SidebarSearch'

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

	// Используем функцию из контекста для добавления доски
	const handleDeskCreated = (newDesk: any) => {
		addDesk(newDesk)
	}

	return (
		<>
			<div className='w-70 min-w-[300px] bg-gray-50 h-[calc(100vh-3.5rem)] p-4 flex flex-col'>
				{/* Поиск */}
				<SidebarSearch />

				{/* Основное меню */}
				<SidebarMenu location={location} onItemClick={handleItemClick} />

				{/* Компонент с досками */}
				<SidebarDesks desks={desks} loading={loading} onDeskClick={handleDeskClick} onAddClick={() => setIsModalOpen(true)} />

				{/* Счетчик досок */}
				<SidebarFooter desksCount={desks.length} />
			</div>

			<CreateDeskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onDeskCreated={handleDeskCreated} />
		</>
	)
}
