import {useState, useEffect} from 'react'
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
import {UserService} from '../../../services/users/Users'
import {DeskTable} from './components/DeskTable'
import {SearchPanel} from './components/SearchPanel'
import {canEditDesk} from '../../../utils/permissionUtils'

export const AllDesks = () => {
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
	const [isRenameModalOpen, setIsRenameModalOpen] = useState(false)
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
	const [selectedDeskId, setSelectedDeskId] = useState<number | null>(null)
	const [selectedDeskName, setSelectedDeskName] = useState<string>('')
	const [isDeleting, setIsDeleting] = useState(false)
	const [searchQuery, setSearchQuery] = useState('')
	const username = AuthService.getUsername() || ''
	const [fullDesksData, setFullDesksData] = useState<any[]>([])
	const [deskPermissions, setDeskPermissions] = useState<{[key: number]: boolean}>({})

	// Получаем данные и функции из контекста
	const { desks, loading, addDesk, loadDesks, removeDesk } = useDesks()

	// Загружаем полные данные о досках
	useEffect(() => {
		const fetchDesksWithUsers = async () => {
			if (desks.length === 0 || loading) return;
			
			try {
				// Сначала загружаем детали досок
				const desksWithDetails = await Promise.all(
					desks.map(async (desk) => {
						try {
							const deskDetails = await DeskService.getDeskById(desk.id);
							return deskDetails;
						} catch (error) {
							console.error(`Ошибка при загрузке деталей доски ${desk.id}:`, error);
							return desk;
						}
					})
				);
				
				// Затем загружаем пользователей для каждой доски
				const desksWithUsers = await Promise.all(
					desksWithDetails.map(async (desk) => {
						try {
							// Используем UserService.getUsersOnDesk для получения пользователей доски
							const deskUsers = await UserService.getUsersOnDesk(desk.id);
							console.log(`Пользователи доски ${desk.id}:`, deskUsers);
							
							// Проверяем права пользователя на редактирование
							const hasPermission = canEditDesk(deskUsers);
							setDeskPermissions(prev => ({
								...prev,
								[desk.id]: hasPermission
							}));
							
							// Ищем пользователя с правом CREATOR
							const creator = deskUsers.find(user => user.rightType === 'CREATOR');
							console.log(`Создатель доски ${desk.id}:`, creator);
							
							// Определяем владельца доски
							let ownerUsername = username;
							if (creator && creator.username) {
								ownerUsername = creator.username;
							}
							
							// Возвращаем обогащенные данные доски
							return {
								...desk,
								deskOwner: ownerUsername
							};
						} catch (error) {
							console.error(`Ошибка при загрузке пользователей доски ${desk.id}:`, error);
							return {
								...desk,
								deskOwner: username // В случае ошибки используем текущего пользователя
							};
						}
					})
				);
				
				console.log('Доски с информацией о пользователях:', desksWithUsers);
				setFullDesksData(desksWithUsers);
				
			} catch (error) {
				console.error('Ошибка при загрузке данных о досках и пользователях:', error);
			}
		};
		
		fetchDesksWithUsers();
	}, [desks, loading, username]);

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
		// Проверяем права пользователя перед открытием окна
		if (!deskPermissions[id]) {
			console.log('У вас нет прав для переименования этой доски');
			return;
		}
		
		setSelectedDeskId(id)
		setSelectedDeskName(findDeskName(id))
		setIsRenameModalOpen(true)
	}

	// Открытие модального окна для удаления
	const handleDeleteClick = (id: number) => {
		// Проверяем права пользователя перед открытием окна
		if (!deskPermissions[id]) {
			console.log('У вас нет прав для удаления этой доски');
			return;
		}
		
		setSelectedDeskId(id)
		setSelectedDeskName(findDeskName(id))
		setIsDeleteModalOpen(true)
	}

	// Подтверждение удаления доски
	const handleConfirmDelete = async (id: number) => {
		// Проверяем права пользователя перед удалением
		if (!deskPermissions[id]) {
			console.log('У вас нет прав для удаления этой доски');
			setIsDeleteModalOpen(false);
			return;
		}
		
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

	const filteredDesks = fullDesksData.length > 0 
		? fullDesksData.filter(desk => desk.deskName.toLowerCase().includes(searchQuery.toLowerCase())) 
		: desks.filter(desk => desk.deskName.toLowerCase().includes(searchQuery.toLowerCase()))

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
				deskPermissions={deskPermissions}
			/>

			{/* Модальные окна */}
			<CreateDeskModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onDeskCreated={handleDeskCreated} />
			<RenameDeskModal isOpen={isRenameModalOpen} deskId={selectedDeskId} onClose={() => setIsRenameModalOpen(false)} onSuccess={loadDesks} />
			<DeleteDeskModal isOpen={isDeleteModalOpen} deskId={selectedDeskId} deskName={selectedDeskName} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleConfirmDelete} isLoading={isDeleting} />
		</div>
	)
}
