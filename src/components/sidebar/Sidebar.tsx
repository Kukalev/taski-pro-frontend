import {useEffect, useState} from 'react'
import {useLocation, useNavigate} from 'react-router-dom'
import {useDesks} from '../../contexts/DeskContext'
import {DeskService} from '../../services/desk/Desk'
import {CreateDeskModal} from '../modals/createDeskModal/CreateDeskModal'
import {DeleteDeskModal} from '../modals/deleteDeskModal/DeleteDeskModal'
import {RenameDeskModal} from '../modals/renameDeskModal/RenameDeskModal'
import {SidebarDesks} from './components/SidebarDesks'
import {SidebarFooter} from './components/SidebarFooter'
import {SidebarMenu} from './components/SidebarMenu'
import {SidebarSearch} from './components/SidebarSearch'

export const Sidebar = () => {
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
	const [isRenameModalOpen, setIsRenameModalOpen] = useState(false)
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
	const [selectedDeskId, setSelectedDeskId] = useState<number | null>(null)
	const [selectedDeskName, setSelectedDeskName] = useState<string>('')
	const [isDeleting, setIsDeleting] = useState(false)

	const navigate = useNavigate()
	const location = useLocation()

	// Получаем данные и функции из контекста
	const { desks, loading, addDesk, loadDesks, removeDesk } = useDesks()

	// Найти имя доски по ID
	useEffect(() => {
		if (selectedDeskId && desks.length > 0) {
			const desk = desks.find(d => d.id === selectedDeskId)
			if (desk) {
				setSelectedDeskName(desk.deskName)
			}
		}
	}, [selectedDeskId, desks])

	// Переход на нужный маршрут
	const handleItemClick = (path: string) => {
		navigate(path)
	}

	// Переход к конкретной доске
	const handleDeskClick = (id: number) => {
		navigate(`/desk/${id}/board`)
	}

	// Открытие модального окна для переименования
	const handleRenameClick = (id: number) => {
		setSelectedDeskId(id)
		setIsRenameModalOpen(true)
	}

	// Открытие модального окна для удаления
	const handleDeleteClick = (id: number) => {
		setSelectedDeskId(id)
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

			// Если мы находимся на странице удаленной доски, перенаправляем
			if (location.pathname.includes(`/desk/${id}`)) {
				navigate('/desk')
			}

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

	// Используем функцию из контекста для добавления доски
	const handleDeskCreated = (newDesk: any) => {
		addDesk(newDesk)
	}

	const handleRenameSuccess = () => {
		// После успешного переименования обновляем список досок
		loadDesks()
	}

	return (
		<>
			<div className='w-70 min-w-[300px] bg-gray-50 h-[calc(100vh-3.5rem)] p-4 flex flex-col border-r border-gray-200'>
				{/* Поиск */}
				<SidebarSearch />

				{/* Основное меню */}
				<SidebarMenu location={location} onItemClick={handleItemClick} />

				{/* Компонент с досками */}
				<SidebarDesks desks={desks} loading={loading} onDeskClick={handleDeskClick} onAddClick={() => setIsCreateModalOpen(true)} onRename={handleRenameClick} onDelete={handleDeleteClick} />

				{/* Счетчик досок */}
				<SidebarFooter desksCount={desks.length} />
			</div>

			{/* Модальные окна */}
			<CreateDeskModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onDeskCreated={handleDeskCreated} />

			<RenameDeskModal isOpen={isRenameModalOpen} deskId={selectedDeskId} onClose={() => setIsRenameModalOpen(false)} onSuccess={handleRenameSuccess} />

			<DeleteDeskModal isOpen={isDeleteModalOpen} deskId={selectedDeskId} deskName={selectedDeskName} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleConfirmDelete} isLoading={isDeleting} />
		</>
	)
}
