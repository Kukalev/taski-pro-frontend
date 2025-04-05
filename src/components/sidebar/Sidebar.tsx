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
import { DESK_UPDATE_EVENT } from '../../pages/DeskOverview/hooks/useDeskActions'
import { UserService } from '../../services/users/Users'
import { canEditDesk } from '../../utils/permissionUtils'

export const Sidebar = () => {
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
	const [isRenameModalOpen, setIsRenameModalOpen] = useState(false)
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
	const [selectedDeskId, setSelectedDeskId] = useState<number | null>(null)
	const [isDeleting, setIsDeleting] = useState(false)
	const [hasEditPermission, setHasEditPermission] = useState(false)

	const navigate = useNavigate()
	const location = useLocation()

	// Получаем данные и функции из контекста
	const { desks, loading, addDesk, loadDesks, removeDesk, updateDesk } = useDesks()

	// Переход на нужный маршрут
	const handleItemClick = (path: string) => {
		navigate(path)
	}

	// Переход к конкретной доске
	const handleDeskClick = (id: number) => {
		navigate(`/desk/${id}/board`)
	}

	// Открытие модального окна для переименования
	const handleRenameClick = async (id: number) => {
		// Находим доску в актуальном списке desks
		const deskToRename = desks.find(d => d.id === id);
		if (!deskToRename) {
			console.error(`Доска с ID ${id} не найдена.`);
			return;
		}

		setSelectedDeskId(id)
		
		// Проверяем права пользователя перед открытием модального окна
		try {
			const users = await UserService.getUsersOnDesk(id)
			const canEdit = canEditDesk(users)
			setHasEditPermission(canEdit) // Сохраняем права для handleDelete
			
			if (!canEdit) {
				console.log('У вас нет прав для переименования этой доски')
				return
			}
			
			// Открываем модальное окно
			setIsRenameModalOpen(true)
		} catch (error) {
			console.error('Ошибка при проверке прав пользователя:', error)
		}
	}

	// Открытие модального окна для удаления
	const handleDeleteClick = async (id: number) => {
		// Находим доску в актуальном списке desks
		const deskToDelete = desks.find(d => d.id === id);
		if (!deskToDelete) {
			console.error(`Доска с ID ${id} не найдена.`);
			return;
		}
		
		setSelectedDeskId(id)
		
		// Проверяем права пользователя перед открытием модального окна
		try {
			const users = await UserService.getUsersOnDesk(id)
			const canEdit = canEditDesk(users)
			setHasEditPermission(canEdit) // Сохраняем права для handleConfirmDelete
			
			if (!canEdit) {
				console.log('У вас нет прав для удаления этой доски')
				return
			}
			
			setIsDeleteModalOpen(true)
		} catch (error) {
			console.error('Ошибка при проверке прав пользователя:', error)
		}
	}

	// Подтверждение удаления доски
	const handleConfirmDelete = async (id: number) => {
		// Проверяем права еще раз перед удалением
		if (!hasEditPermission) {
			console.log('У вас нет прав для удаления этой доски')
			setIsDeleteModalOpen(false)
			return
		}
		
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

	useEffect(() => {
		// Слушатель для обновления данных в sidebar
		const handleDeskUpdated = (event: CustomEvent) => {
			const { deskId, updates } = event.detail;
			console.log('Получено событие обновления доски:', deskId, updates);
			
			// Обновляем название доски в контексте
			if (updates && deskId) {
				updateDesk(deskId, updates);
			}
		};

		// Добавляем слушатель с типизацией для CustomEvent
		window.addEventListener(DESK_UPDATE_EVENT, handleDeskUpdated as EventListener);
		
		return () => {
			// Удаляем слушатель при размонтировании
			window.removeEventListener(DESK_UPDATE_EVENT, handleDeskUpdated as EventListener);
		};
	}, [updateDesk]); // Зависит от функции updateDesk

	// Находим имя доски для DeleteDeskModal прямо перед рендером
	const deskForDeleteModal = desks.find(d => d.id === selectedDeskId);
	const deskNameForDeleteModal = deskForDeleteModal?.deskName || '';

	// Находим имя доски для RenameDeskModal прямо перед рендером
	const deskForRenameModal = desks.find(d => d.id === selectedDeskId);
	const initialDeskNameForRename = deskForRenameModal?.deskName || '';

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

			<RenameDeskModal 
				isOpen={isRenameModalOpen} 
				deskId={selectedDeskId} 
				initialDeskName={initialDeskNameForRename}
				onClose={() => setIsRenameModalOpen(false)} 
				onSuccess={handleRenameSuccess} 
			/>

			<DeleteDeskModal 
				isOpen={isDeleteModalOpen} 
				deskId={selectedDeskId} 
				deskName={deskNameForDeleteModal}
				onClose={() => setIsDeleteModalOpen(false)} 
				onConfirm={handleConfirmDelete} 
				isLoading={isDeleting} 
			/>
		</>
	)
}
