import { useState } from 'react'
import { CreateDeskModal } from '../../../components/modals/createDeskModal/CreateDeskModal'
import { useDesks } from '../../../contexts/DeskContext'
import { AuthService } from '../../../services/auth/Auth'
import { DeskTable } from './components/DeskTable'
import { SearchPanel } from './components/SearchPanel'

export const AllDesks = () => {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [searchQuery, setSearchQuery] = useState('')
	const username = AuthService.getUsername() || ''

	// Получаем данные и функции из контекста
	const { desks, loading, addDesk } = useDesks()

	// Используем функцию из контекста для добавления доски
	const handleDeskCreated = (newDesk: any) => {
		addDesk(newDesk)
		setIsModalOpen(false)
	}

	const filteredDesks = desks.filter(desk => desk.deskName.toLowerCase().includes(searchQuery.toLowerCase()))

	return (
		<div className='w-full h-screen flex flex-col overflow-hidden'>
			<div className='w-full pb-4'>
				<div className='mb-4'>
					<h1 className='text-2xl font-semibold text-gray-900'>Все доски</h1>
				</div>

				<SearchPanel searchQuery={searchQuery} onSearchChange={setSearchQuery} onAddDesk={() => setIsModalOpen(true)} />
			</div>

			<DeskTable desks={filteredDesks} loading={loading} username={username} />

			<CreateDeskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onDeskCreated={handleDeskCreated} />
		</div>
	)
}
