import React, {useEffect, useRef, useState} from 'react'
import {DeskHeaderProps, DeskStatus} from './types'
import DeskLogo from './components/DeskLogo'
import DeskTitleEditor from './components/DeskTitleEditor'
import DateRangeSelector from './components/DeskRangeSelector'
import StatusSelector from './components/StatusSelector'
import StatusMenu from './components/StatusMenu'
import {DeskService} from '../../../../services/desk/Desk'
// Исправленный путь импорта
import {DESK_UPDATE_EVENT} from '../../hooks/useDeskActions'

const DeskHeader: React.FC<DeskHeaderProps> = ({
	desk,
	onDeskUpdate,
	isLoading = false,

	selectedDate
}) => {
	// Локальное состояние
	const [isEditing, setIsEditing] = useState(false);
	const [localDeskName, setLocalDeskName] = useState(desk.deskName || '');
	const [statusMenuOpen, setStatusMenuOpen] = useState(false);
	const [isCalendarOpen, setIsCalendarOpen] = useState(false);
	const [currentStatus, setCurrentStatus] = useState<DeskStatus>(
		desk.status ? desk.status : DeskStatus.IN_PROGRESS
	);
	
	// Refs
	const inputRef = useRef<HTMLInputElement>(null);
	const statusButtonRef = useRef<HTMLDivElement>(null);
	const statusMenuRef = useRef<HTMLDivElement>(null);
	const calendarButtonRef = useRef<HTMLButtonElement>(null);

	// Синхронизируем локальное имя с props только при смене доски
	useEffect(() => {
		setLocalDeskName(desk.deskName || '');
	}, [desk.id]);

	useEffect(() => {
		if (desk.status) {
			setCurrentStatus(desk.status);
		}
	}, [desk.status]);

	useEffect(() => {
		if (isEditing && inputRef.current) {
			inputRef.current.focus();
			const length = inputRef.current.value.length;
			inputRef.current.setSelectionRange(length, length);
		}
	}, [isEditing]);

	// Закрытие меню статусов при клике вне
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				statusMenuRef.current &&
				!statusMenuRef.current.contains(event.target as Node) &&
				statusButtonRef.current &&
				!statusButtonRef.current.contains(event.target as Node)
			) {
				setStatusMenuOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	const handleEdit = () => {
		setIsEditing(true);
	};

	const handleNameChange = (name: string) => {
		setLocalDeskName(name);
	};

	// Функция для сохранения имени на сервере и обновления UI компонентов
	const saveNameToServer = async (name: string) => {
		if (!desk.id) return;
		
		try {
			// Сохраняем на сервер
			await DeskService.updateDesk(Number(desk.id), {
				deskName: name,
				deskDescription: desk.deskDescription || '',
				deskFinishDate: desk.deskFinishDate
			});
			
			// Обновляем заголовок страницы
			document.title = name || 'Taski';
			
			// Обновляем объект напрямую для сохранности данных
			desk.deskName = name;
			
			// Обновляем UI через callback
			if (typeof onDeskUpdate === 'function') {
				onDeskUpdate({
					id: desk.id,
					deskName: name
				});
			}
			
			// Дополнительно отправляем событие для обновления сайдбара и хедера
			window.dispatchEvent(new CustomEvent(DESK_UPDATE_EVENT, {
				detail: {
					deskId: desk.id,
					updates: {
						deskName: name
					}
				}
			}));
			
			console.log('Отправлено событие обновления доски:', desk.id, name);
		} catch (error) {
			console.error('Ошибка при сохранении имени доски:', error);
		}
	};

	const handleBlur = () => {
		if (localDeskName.trim() === '') {
			// Если поле пустое, возвращаем исходное имя
			setLocalDeskName(desk.deskName || '');
		} else if (localDeskName !== desk.deskName) {
			// Если имя изменилось, сохраняем на сервер и обновляем UI
			saveNameToServer(localDeskName);
		}
		
		setIsEditing(false);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			handleBlur();
		} else if (e.key === 'Escape') {
			setIsEditing(false);
			setLocalDeskName(desk.deskName || '');
		}
	};

	const toggleStatusMenu = () => {
		setStatusMenuOpen(!statusMenuOpen);
		if (!statusMenuOpen) {
			setIsCalendarOpen(false);
		}
	};

	const handleStatusChange = (status: DeskStatus) => {
		setCurrentStatus(status);
		setStatusMenuOpen(false);
		
		if (typeof onDeskUpdate === 'function') {
			onDeskUpdate({
				id: desk.id,
				status: status
			});
		}
	};

	return (
		<div className='bg-white py-8'>
			<div className='max-w-4xl mx-auto flex items-center px-4'>
				<div className='flex flex-col items-start mr-8'>
					{/* Логотип - используем локальное имя */}
					<DeskLogo deskName={localDeskName} />

					{/* Редактор имени */}
					<DeskTitleEditor
						deskName={localDeskName}
						isEditing={isEditing}
						isLoading={isLoading}
						editedName={localDeskName}
						setEditedName={handleNameChange}
						handleEdit={handleEdit}
						handleBlur={handleBlur}
						handleKeyDown={handleKeyDown}
						inputRef={inputRef}
					/>
				</div>

				{/* Дата и статус */}
				<div className='flex items-center space-x-5 ml-auto'>
					<DateRangeSelector
						deskId={desk.id}
						deskName={localDeskName}
						deskDescription={desk.deskDescription || ''}
						deskCreateDate={desk.deskCreateDate}
						deskFinishDate={desk.deskFinishDate}
						selectedDate={selectedDate}
						isCalendarOpen={isCalendarOpen}
						setIsCalendarOpen={setIsCalendarOpen}
						onDeskUpdate={onDeskUpdate}
						calendarButtonRef={calendarButtonRef}
					/>
					
					<StatusSelector
						currentStatus={currentStatus}
						statusMenuOpen={statusMenuOpen}
						toggleStatusMenu={toggleStatusMenu}
						statusButtonRef={statusButtonRef}
					/>
					
					{statusMenuOpen && (
						<StatusMenu
							isOpen={statusMenuOpen}
							handleStatusChange={handleStatusChange}
							statusMenuRef={statusMenuRef}
						/>
					)}
				</div>
			</div>
		</div>
	);
};

export default DeskHeader;