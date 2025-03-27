import {useState} from 'react'
import {
	CreateDeskModal
} from '../../../components/modals/createDeskModal/CreateDeskModal'
import {
	RenameDeskModal
} from '../../../components/modals/renameDeskModal/RenameDeskModal'
import {
	DeleteDeskModal
} from '../../../components/modals/deleteDeskModal/DeleteDeskModal'
import {useDesks} from '../../../contexts/DeskContext'
import {AuthService} from '../../../services/auth/Auth'
import {DeskService} from '../../../services/desk/Desk'
import {DeskTable} from './components/DeskTable'
import {SearchPanel} from './components/SearchPanel'

export const AllDesks = () => {
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
	const [isRenameModalOpen, setIsRenameModalOpen] = useState(false)
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
	const [selectedDeskId, setSelectedDeskId] = useState<number | null>(null)
	const [selectedDeskName, setSelectedDeskName] = useState<string>('')
	const [isDeleting, setIsDeleting] = useState(false)
	const [searchQuery, setSearchQuery] = useState('')
	const username = AuthService.getUsername() || ''

	// Получаем данные и функции из контекста
	const { desks, loading, addDesk, loadDesks, removeDesk } = useDesks()

	// Используем функцию из контекста для добавления доски
	const handleDeskCreated = (newDesk: any) => {
		addDesk(newDesk)
		setIsCreateModalOpen(false)
	}

	// Найти имя доски по ID
	const findDeskName = (id: number) => {
		const desk = desks.find(d => d.id === id)
		return desk ? desk.deskName : ''
	}

	// Открытие модального окна для переименования
	const handleRenameClick = (id: number) => {
		setSelectedDeskId(id)
		setSelectedDeskName(findDeskName(id))
		setIsRenameModalOpen(true)
	}

	// Открытие модального окна для удаления
	const handleDeleteClick = (id: number) => {
		setSelectedDeskId(id)
		setSelectedDeskName(findDeskName(id))
		setIsDeleteModalOpen(true)
	}

	// Подтверждение удаления доски
	const handleConfirmDelete = async (id: number) => {
		setIsDeleting(true)
		try {
			// Оптимистичное удаление из UI
			removeDesk(id)
			
			// Отправляем запрос на сервер
			await DeskService.deleteDesk(id)
			setIsDeleteModalOpen(false)
		} catch (error) {
			console.error('Ошибка при удалении доски:', error)
			// Если произошла ошибка, перезагружаем список досок
			await loadDesks()
			alert('Не удалось удалить доску')
		} finally {
			setIsDeleting(false)
		}
	}

	const filteredDesks = desks.filter(desk => desk.deskName.toLowerCase().includes(searchQuery.toLowerCase()))

	return (
		<div className='w-full h-screen flex flex-col overflow-hidden '>
			<div className='w-full pb-4'>
				<div className='mb-4 ml-2'>
					<h1 className='text-2xl font-semibold text-gray-900'>Все доски</h1>
				</div>

				<SearchPanel searchQuery={searchQuery} onSearchChange={setSearchQuery} onAddDesk={() => setIsCreateModalOpen(true)} />
			</div>

			<DeskTable 
				desks={filteredDesks} 
				loading={loading} 
				username={username} 
				onRename={handleRenameClick}
				onDelete={handleDeleteClick}
			/>

			{/* Модальные окна */}
			<CreateDeskModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onDeskCreated={handleDeskCreated} />
			<RenameDeskModal isOpen={isRenameModalOpen} deskId={selectedDeskId} onClose={() => setIsRenameModalOpen(false)} onSuccess={loadDesks} />
			<DeleteDeskModal isOpen={isDeleteModalOpen} deskId={selectedDeskId} deskName={selectedDeskName} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleConfirmDelete} isLoading={isDeleting} />
		</div>
	)
}
