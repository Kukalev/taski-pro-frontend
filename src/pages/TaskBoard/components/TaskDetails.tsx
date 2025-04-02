import React, {useEffect, useRef, useState} from 'react'
import {updateTask} from '../../../services/task/Task'
import {PiUserCircleThin} from 'react-icons/pi'
import {UserService} from '../../../services/users/Users'
import { StatusType } from '../types'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { FaCheck, FaRegCircle } from 'react-icons/fa'
import { IoArrowBack, IoCalendarNumberOutline } from 'react-icons/io5'
import TaskExecutorsComponent from './TaskExecutors'

// Кэш для пользователей, чтобы не загружать их много раз
const usersCache = new Map<number, any[]>();

interface TaskExecutorProps {
	task: any;
	deskUsers: any[];
	deskId: number;
	onTaskUpdate?: (updatedTask: any) => void;
}

const TaskExecutors: React.FC<TaskExecutorProps> = ({ task, deskUsers, deskId, onTaskUpdate }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [localDeskUsers, setLocalDeskUsers] = useState<any[]>(deskUsers || []);
	const loadingRef = useRef(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const requestMadeRef = useRef(false);

	// Получаем текущих исполнителей задачи
	const executors = task?.executors || [];

	// Загружаем пользователей только один раз при маунте компонента или изменении deskId
	useEffect(() => {
		// Если уже есть пользователи в кэше или пропсах - используем их
		if (usersCache.has(deskId)) {
			setLocalDeskUsers(usersCache.get(deskId) || []);
			return;
		}

		if (deskUsers && deskUsers.length > 0) {
			setLocalDeskUsers(deskUsers);
			usersCache.set(deskId, deskUsers);
			return;
		}

		// Предотвращаем повторную загрузку
		if (loadingRef.current || requestMadeRef.current) return;

		// Загружаем пользователей только если необходимо
		const loadUsers = async () => {
			try {
				loadingRef.current = true;

				const users = await UserService.getUsersOnDesk(deskId, true);

				// Сохраняем в кэш и обновляем состояние
				usersCache.set(deskId, users || []);
				setLocalDeskUsers(users || []);

				// Отмечаем, что запрос был выполнен
				requestMadeRef.current = true;
			} catch (err) {
				console.error('Ошибка при загрузке пользователей:', err);
			} finally {
				loadingRef.current = false;
			}
		};

		loadUsers();
	}, [deskId, deskUsers]); // Зависимости: только deskId и deskUsers

	// Закрываем dropdown при клике вне компонента
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	// Добавляем исполнителя
	const handleAddExecutor = async (username: string) => {
		try {
			if (!task.taskId || !deskId) {
				console.error('taskId или deskId не определены', { task, deskId });
				return;
			}

			const updatedTask = await updateTask(deskId, task.taskId, {
				executorUsernames: [username]
			});

			if (onTaskUpdate && updatedTask) {
				onTaskUpdate(updatedTask);
			}

			setIsOpen(false);
		} catch (error) {
			console.error('Ошибка при добавлении исполнителя:', error);
		}
	};

	// Удаляем исполнителя
	const handleRemoveExecutor = async (username: string, e: React.MouseEvent) => {
		e.stopPropagation();
		try {
			if (!task.taskId || !deskId) {
				console.error('taskId или deskId не определены', { task, deskId });
				return;
			}

			const updatedTask = await updateTask(deskId, task.taskId, {
				removeExecutorUsernames: [username]
			});

			if (onTaskUpdate && updatedTask) {
				onTaskUpdate(updatedTask);
			}
		} catch (error) {
			console.error('Ошибка при удалении исполнителя:', error);
		}
	};

	// Получить инициалы пользователя для аватарки
	const getUserInitials = (username: string) => {
		return username.substring(0, 1).toUpperCase();
	};

	// Определяем цвет обводки в зависимости от роли пользователя
	const getBorderColor = (username: string) => {
		// Найдем пользователя в списке
		const user = localDeskUsers.find(u => u.username === username);

		if (!user) return 'border-gray-300';

		// Определяем цвет по роли
		if (user.role === 'CREATOR' || username === 'shaly') {
			return 'border-red-500'; // Красный для CREATOR
		} else if (user.role === 'MEMBER') {
			return 'border-green-500'; // Зеленый для MEMBER
		} else {
			return 'border-yellow-400'; // Желтый для других ролей
		}
	};

	// Функция для открытия/закрытия выпадающего списка
	const toggleDropdown = (e: React.MouseEvent) => {
		e.stopPropagation();
		setIsOpen(!isOpen);
	};

	// Добавим CSS для анимации в стиль компонента
	const dropdownStyle = {
		transition: 'opacity 0.2s ease, transform 0.2s ease',
		opacity: isOpen ? 1 : 0,
		transform: isOpen ? 'translateY(0)' : 'translateY(-10px)',
		visibility: isOpen ? 'visible' : 'hidden',
		display: 'block',
		position: 'absolute' as 'absolute',
		zIndex: 10,
		marginTop: '4px',
		width: '44px',
		backgroundColor: 'white',
		borderRadius: '0.375rem',
		boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
		border: '1px solid #e5e7eb'
	};

	return (
		<div className="relative" ref={dropdownRef}>
			{/* Область выбора исполнителей */}
			<div
				className="flex items-center cursor-pointer"
				onClick={toggleDropdown}
			>
				{executors.length > 0 ? (
					// Отображаем аватарки исполнителей, если они есть
					<div className="flex flex-wrap gap-1">
						{executors.map((executor, index) => (
							<div
								key={executor}
								className="flex items-center group"
							>
								<div
									className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium text-gray-700 border border-solid ${getBorderColor(executor)} bg-white`}
									title={executor}
								>
									{getUserInitials(executor)}
								</div>
								<div
									className="w-4 h-4 flex items-center justify-center text-gray-400 hover:text-red-500 cursor-pointer"
									onClick={(e) => handleRemoveExecutor(executor, e)}
								>
									<span className="text-[8px]">×</span>
								</div>
							</div>
						))}
					</div>
				) : (
					// Если исполнителей нет, показываем круглую иконку
					<div className="flex items-center text-gray-400">
						<PiUserCircleThin size={20} />
					</div>
				)}
			</div>

			{/* Выпадающий список исполнителей - всегда отображается, но меняет стиль */}
			<div style={dropdownStyle} className="dropdown-menu">
				<div className="p-2 text-sm text-gray-700 border-b border-gray-200">
					Исполнители:
				</div>

				{/* Текущие исполнители */}
				{executors.length > 0 && (
					<div className="p-2 border-b border-gray-200">
						<div className="flex flex-wrap gap-1 mb-1">
							{executors.map((executor: string) => (
								<div key={executor} className="flex items-center bg-gray-50 rounded-md px-2 py-1">
									<div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium text-gray-700 border border-solid ${getBorderColor(executor)} bg-white mr-1`}>
										{getUserInitials(executor)}
									</div>
									<span className="text-xs">{executor}</span>
									<button
										className="ml-1 text-gray-400 hover:text-gray-600"
										onClick={(e) => handleRemoveExecutor(executor, e)}
									>
										<span className="text-[8px]">×</span>
									</button>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Доступные пользователи доски */}
				<div className="p-2 max-h-48 overflow-y-auto">
					{loadingRef.current ? (
						<div className="py-1 px-2 text-sm text-gray-500">
							Загрузка пользователей...
						</div>
					) : localDeskUsers.length === 0 ? (
						<div className="py-1 px-2 text-sm text-gray-500">
							Нет доступных пользователей
						</div>
					) : (
						localDeskUsers
						.filter(user => !executors.includes(user.username))
						.map(user => (
							<div
								key={user.username}
								className="flex items-center py-1 px-2 hover:bg-gray-100 rounded cursor-pointer"
								onClick={(e) => {
									e.stopPropagation();
									handleAddExecutor(user.username);
								}}
							>
								<div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium text-gray-700 border border-solid ${getBorderColor(user.username)} bg-white mr-2`}>
									{getUserInitials(user.username)}
								</div>
								<span className="text-sm">{user.username}</span>
							</div>
						))
					)}
				</div>
			</div>
		</div>
	);
};

interface TaskDetailsProps {
	task: any;
	deskId: number;
	deskUsers: any[];
	onClose: () => void;
	onTaskUpdate: (updatedTask: any) => void;
	isTransitioning: boolean;
	onTransitionEnd: () => void;
}

const TaskDetails: React.FC<TaskDetailsProps> = ({
	task,
	deskId,
	deskUsers,
	onClose,
	onTaskUpdate,
	isTransitioning,
	onTransitionEnd
}) => {
	const [taskName, setTaskName] = useState(task?.taskName || '');
	const [taskDescription, setTaskDescription] = useState(task?.taskDescription || '');
	const [isEditingName, setIsEditingName] = useState(false);
	const [isEditingDescription, setIsEditingDescription] = useState(false);
	const [hoveredCheckCircle, setHoveredCheckCircle] = useState(false);
	
	const nameInputRef = useRef<HTMLInputElement>(null);
	const descriptionTextareaRef = useRef<HTMLTextAreaElement>(null);
	
	// Обновляем состояние при изменении задачи
	useEffect(() => {
		setTaskName(task?.taskName || '');
		setTaskDescription(task?.taskDescription || '');
	}, [task]);
	
	// Фокус на инпуте при редактировании
	useEffect(() => {
		if (isEditingName && nameInputRef.current) {
			nameInputRef.current.focus();
		}
	}, [isEditingName]);
	
	// Фокус на текстовом поле при редактировании
	useEffect(() => {
		if (isEditingDescription && descriptionTextareaRef.current) {
			descriptionTextareaRef.current.focus();
		}
	}, [isEditingDescription]);
	
	// Сохранение изменений названия
	const handleSaveName = async () => {
		if (!task || !task.taskId) return;
		
		try {
			const updatedTask = await updateTask(deskId, task.taskId, {
				taskName
			});
			
			onTaskUpdate(updatedTask);
			setIsEditingName(false);
		} catch (error) {
			console.error('Ошибка при обновлении названия задачи:', error);
		}
	};
	
	// Сохранение изменений описания
	const handleSaveDescription = async () => {
		if (!task || !task.taskId) return;
		
		try {
			const updatedTask = await updateTask(deskId, task.taskId, {
				taskDescription
			});
			
			onTaskUpdate(updatedTask);
			setIsEditingDescription(false);
		} catch (error) {
			console.error('Ошибка при обновлении описания задачи:', error);
		}
	};
	
	// Изменение статуса завершения
	const handleCompleteTask = async () => {
		if (!task || !task.taskId) return;
		
		try {
			const newStatus = task.statusType === StatusType.COMPLETED 
				? StatusType.BACKLOG 
				: StatusType.COMPLETED;
				
			const updatedTask = await updateTask(deskId, task.taskId, {
				statusType: newStatus
			});
			
			onTaskUpdate(updatedTask);
		} catch (error) {
			console.error('Ошибка при изменении статуса задачи:', error);
		}
	};
	
	// Форматирование даты
	const formatDate = (date: string | Date | null | undefined) => {
		if (!date) return null;
		
		try {
			return format(new Date(date), 'd MMMM yyyy', { locale: ru });
		} catch (error) {
			console.error('Ошибка форматирования даты:', error);
			return null;
		}
	};
	
	const isCompleted = task?.statusType === StatusType.COMPLETED;
	
	return (
		<div 
			className="fixed top-0 right-0 h-full overflow-auto bg-white shadow-xl z-50"
			style={{
				width: '400px',
				transform: isTransitioning ? 'translateX(100%)' : 'translateX(0)',
				transition: 'transform 0.3s ease-in-out',
				borderLeft: '1px solid #e5e7eb'
			}}
			onTransitionEnd={onTransitionEnd}
		>
			{/* Шапка с кнопкой возврата */}
			<div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center z-10">
				<button 
					className="text-gray-500 hover:text-gray-700 cursor-pointer"
					onClick={onClose}
				>
					<IoArrowBack size={20} />
				</button>
				<h2 className="text-center font-medium text-gray-700">Детали задачи</h2>
				<div className="w-5"></div> {/* пустой блок для центрирования заголовка */}
			</div>
			
			{/* Содержимое с отступами */}
			<div className="p-4">
				{/* Название задачи */}
				<div className="mb-6">
					{isEditingName ? (
						<div>
							<input
								ref={nameInputRef}
								type="text"
								value={taskName}
								onChange={(e) => setTaskName(e.target.value)}
								onBlur={handleSaveName}
								onKeyDown={(e) => {
									if (e.key === 'Enter') handleSaveName();
									if (e.key === 'Escape') {
										setTaskName(task?.taskName || '');
										setIsEditingName(false);
									}
								}}
								className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-300"
								placeholder="Введите название задачи..."
								autoFocus
							/>
						</div>
					) : (
						<h1 
							className={`text-xl font-medium cursor-pointer hover:bg-gray-50 p-2 rounded -mx-2 ${
								isCompleted ? 'line-through text-gray-500' : 'text-gray-800'
							}`}
							onClick={() => setIsEditingName(true)}
						>
							{taskName || 'Без названия'}
						</h1>
					)}
				</div>
				
				{/* Статус завершения */}
				<div className="mb-6">
					<div 
						className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded -mx-2"
						onClick={handleCompleteTask}
						onMouseEnter={() => setHoveredCheckCircle(true)}
						onMouseLeave={() => setHoveredCheckCircle(false)}
					>
						<div className="relative mr-2">
							<FaRegCircle 
								className={isCompleted ? "text-green-200" : "text-gray-300"} 
								size={18} 
							/>
							
							<FaCheck 
								className={`absolute top-0 left-0 transition-all duration-300
									${isCompleted 
										? 'text-green-500 opacity-100' 
										: hoveredCheckCircle 
											? 'text-gray-400 opacity-100' 
											: 'text-gray-400 opacity-0'
									}`}
								size={12} 
								style={{ transform: 'translate(3px, 3px)' }}
							/>
						</div>
						<span className={`${isCompleted ? 'text-green-500' : 'text-gray-700'}`}>
							{isCompleted ? 'Завершено' : 'Отметить как завершенное'}
						</span>
					</div>
				</div>
				
				{/* Дата выполнения */}
				{task?.taskFinishDate && (
					<div className="mb-6">
						<div className="flex items-center text-gray-600">
							<IoCalendarNumberOutline className="mr-2" size={18} />
							<span>{formatDate(task.taskFinishDate)}</span>
						</div>
					</div>
				)}
				
				{/* Описание задачи */}
				<div className="mb-6">
					<h3 className="text-sm font-medium text-gray-500 mb-2">Описание</h3>
					
					{isEditingDescription ? (
						<div>
							<textarea
								ref={descriptionTextareaRef}
								value={taskDescription}
								onChange={(e) => setTaskDescription(e.target.value)}
								onBlur={handleSaveDescription}
								onKeyDown={(e) => {
									if (e.key === 'Escape') {
										setTaskDescription(task?.taskDescription || '');
										setIsEditingDescription(false);
									}
								}}
								className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-300 min-h-[100px]"
								placeholder="Добавьте описание задачи..."
								autoFocus
							/>
						</div>
					) : (
						<div 
							className="cursor-pointer hover:bg-gray-50 p-2 rounded -mx-2 min-h-[40px]"
							onClick={() => setIsEditingDescription(true)}
						>
							{taskDescription ? (
								<p className="text-gray-700 whitespace-pre-wrap">{taskDescription}</p>
							) : (
								<p className="text-gray-400">Добавьте описание задачи...</p>
							)}
						</div>
					)}
				</div>
				
				{/* Исполнители */}
				<div className="mb-6">
					<h3 className="text-sm font-medium text-gray-500 mb-2">Исполнители</h3>
					<TaskExecutorsComponent
						task={task}
						deskUsers={deskUsers}
						deskId={deskId}
						onTaskUpdate={onTaskUpdate}
					/>
				</div>
			</div>
		</div>
	);
};

export default TaskDetails;