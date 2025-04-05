import React, { useState, useEffect, useCallback } from 'react'
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
import { DeskData } from '../../../contexts/DeskContext'

export const AllDesks = () => {
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
	const [isRenameModalOpen, setIsRenameModalOpen] = useState(false)
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
	const [selectedDeskId, setSelectedDeskId] = useState<number | null>(null)
	const [selectedDeskName, setSelectedDeskName] = useState<string>('')
	const [selectedDeskDescription, setSelectedDeskDescription] = useState<string>('')
	const [isDeleting, setIsDeleting] = useState(false)
	const [searchQuery, setSearchQuery] = useState('')

	// Получаем данные и функции из контекста
	const { desks, loading, addDesk, loadDesks, removeDesk, updateDesk: updateDeskInContext } = useDesks()

	// ---> Удаляем useEffect, который проверял sessionStorage <-----
	// useEffect(() => {
	// 	// Проверяем флаг 'setupComplete'
	// 	const setupComplete = sessionStorage.getItem('setupComplete');
	// 	if (setupComplete === 'true') {
	// 		console.log('[AllDesks] Обнаружен флаг setupComplete, вызываем loadDesks()');
	// 		loadDesks(); // Вызываем загрузку досок из контекста
	// 		sessionStorage.removeItem('setupComplete'); // Удаляем флаг, чтобы не вызывать повторно
	// 	}
	// }, [loadDesks]);

	const handleDeskCreated = useCallback(async (newDesk: DeskData) => {
		console.log('[AllDesks] Новая доска создана, обновляем список...')
		addDesk(newDesk) // Используем addDesk из контекста
		// Не нужно вызывать loadDesks(), так как addDesk уже обновил состояние
	}, [addDesk])

	// Обновленный обработчик для открытия модалки переименования
	const handleRenameRequest = useCallback((id: number, initialName: string, initialDescription: string) => {
		console.log(`[AllDesks] Запрос на переименование ID: ${id}, Имя: "${initialName}", Описание: "${initialDescription}"`);
		setSelectedDeskId(id);
		setSelectedDeskName(initialName);
		setSelectedDeskDescription(initialDescription);
		setIsRenameModalOpen(true);
	}, []);

	// Обработчик успешного переименования из модального окна
	const handleRenameSuccess = useCallback((updatedDesk: Partial<DeskData>) => {
		loadDesks();
		setIsRenameModalOpen(false)
	}, [loadDesks])

	// Обновленный обработчик для открытия модалки удаления
	const handleDeleteRequest = useCallback((id: number, deskName: string) => {
		setSelectedDeskId(id);
		setSelectedDeskName(deskName);
		setIsDeleteModalOpen(true);
	}, []);

	// Подтверждение удаления доски
	const handleConfirmDelete = useCallback(async (id: number) => {
		setIsDeleting(true)
		try {
			removeDesk(id)
			await DeskService.deleteDesk(id)
			console.log(`Доска ${id} успешно удалена.`)
			setIsDeleteModalOpen(false)
		} catch (error) {
			console.error('Ошибка при удалении доски:', error)
			loadDesks()
			alert('Не удалось удалить доску')
		} finally {
			setIsDeleting(false)
		}
	}, [removeDesk, loadDesks])

	const filteredDesks = desks.filter(desk => 
		desk.deskName.toLowerCase().includes(searchQuery.toLowerCase())
	)

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
				onRename={handleRenameRequest}
				onDelete={handleDeleteRequest}
			/>

			{/* Модальные окна */}
			<CreateDeskModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onDeskCreated={handleDeskCreated} />
			<RenameDeskModal 
				key={isRenameModalOpen ? `rename-${selectedDeskId}` : 'rename-closed'}
				isOpen={isRenameModalOpen} 
				deskId={selectedDeskId} 
				initialDeskName={selectedDeskName}
				onClose={() => setIsRenameModalOpen(false)} 
				onSuccess={handleRenameSuccess}
			/>
			<DeleteDeskModal isOpen={isDeleteModalOpen} deskId={selectedDeskId} deskName={selectedDeskName} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleConfirmDelete} isLoading={isDeleting} />
		</div>
	)
}
