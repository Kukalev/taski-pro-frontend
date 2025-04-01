import React, {useEffect, useRef, useState} from 'react'
import {UserService} from '../../../services/users/Users'
import {UserResponseDto, UsersOnDeskResponseDto} from '../../../services/users/types/types'
import ReactDOM from 'react-dom'

interface AddUserModalProps {
	isOpen: boolean;
	onClose: () => void;
	deskId: number;
	onUserAdded?: () => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ 
	isOpen, 
	onClose, 
	deskId, 
	onUserAdded
}) => {
	const [searchQuery, setSearchQuery] = useState('');
	const [allUsers, setAllUsers] = useState<UserResponseDto[]>([]);
	const [deskUsers, setDeskUsers] = useState<string[]>([]);
	const [availableUsers, setAvailableUsers] = useState<UserResponseDto[]>([]);
	const [filteredUsers, setFilteredUsers] = useState<UserResponseDto[]>([]);
	const [selectedUser, setSelectedUser] = useState<UserResponseDto | null>(null);
	const [accessType, setAccessType] = useState<string>('CONTRIBUTOR');
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');
	const modalRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	// Загружаем данные при открытии модального окна
	useEffect(() => {
		if (isOpen && deskId) {
			loadData();
		}
	}, [isOpen, deskId]);

	// ФУНКЦИЯ ЗАГРУЗКИ ДАННЫХ
	const loadData = async () => {
		setIsLoading(true);
		try {
			// 1. Получаем ВСЕХ пользователей системы
			const allUsersData = await UserService.getAllUsers();
			setAllUsers(allUsersData);
			
			// 2. Получаем пользователей доски
			const deskUsersData = await UserService.getUsersOnDesk(deskId);
			
			// 3. Извлекаем имена пользователей (userName вместо username)
			const usernames = deskUsersData.map(user => 
                // Проверяем поле userName (используем именно это поле согласно вашему API)
                (user.userName || '').toLowerCase()
            ).filter(Boolean);
			
			setDeskUsers(usernames);
			
			// 4. Фильтруем - убираем пользователей доски из общего списка
			const filteredAvailable = allUsersData.filter(user => 
				!usernames.includes(user.username.toLowerCase())
			);
			
			setAvailableUsers(filteredAvailable);
			
		} catch (error) {
			setDeskUsers([]);
			setAvailableUsers(allUsersData);
		} finally {
			setIsLoading(false);
		}
	};

	// Фильтруем пользователей при изменении поискового запроса
	useEffect(() => {
		if (!searchQuery.trim()) {
			setFilteredUsers([]);
			return;
		}
		
		const lowerQuery = searchQuery.toLowerCase();
		const filtered = availableUsers.filter(user => {
			return user.username.toLowerCase().includes(lowerQuery) || 
				   (user.email && user.email.toLowerCase().includes(lowerQuery));
		});
		
		setFilteredUsers(filtered);
	}, [searchQuery, availableUsers]);

	// Фокус на поле ввода при открытии
	useEffect(() => {
		if (isOpen && inputRef.current) {
			setTimeout(() => {
				inputRef.current?.focus();
			}, 100);
		}
	}, [isOpen]);

	// Закрытие при клике вне
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		}
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isOpen, onClose]);

	// Получение инициалов для аватара
	const getUserInitials = (user: UserResponseDto) => {
		if (!user.username) return '?';
		return user.username.charAt(0).toUpperCase();
	};

	// Выбор пользователя
	const handleSelectUser = (user: UserResponseDto) => {
		setSelectedUser(user);
		setSearchQuery('');
		setFilteredUsers([]);
	};

	// Отмена выбора
	const handleCancelUserSelection = () => {
		setSelectedUser(null);
		setSearchQuery('');
		if (inputRef.current) {
			inputRef.current.focus();
		}
	};

	// Добавление пользователя
	const handleAddUser = async () => {
		if (!selectedUser) return;

		setIsLoading(true);
		setError('');
		try {
			// Добавляем пользователя через API
			await UserService.addUserForDesk(deskId, {
				username: selectedUser.username,
				rightType: accessType
			});
			
			// После успешного добавления обновляем списки
			const userLower = selectedUser.username.toLowerCase();
			
			// Добавляем в список на доске
			setDeskUsers(prev => [...prev, userLower]);
			
			// Удаляем из доступных
			setAvailableUsers(prev => 
				prev.filter(u => u.username.toLowerCase() !== userLower)
			);
			
			// Сбрасываем выбор
			setSelectedUser(null);
			
			// Уведомляем родителя
			if (onUserAdded) {
				onUserAdded();
			}
			
		} catch (err) {
			setError('Не удалось добавить пользователя');
		} finally {
			setIsLoading(false);
		}
	};

	if (!isOpen) return null;

	const modalContent = (
		<>
			<div className="fixed inset-0 bg-black opacity-20 z-40"></div>
			<div className="fixed inset-0 z-50" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
				<div 
					ref={modalRef} 
					className="bg-white rounded-lg w-full max-w-md mx-auto shadow-xl p-6"
					style={{
						animation: 'fadeIn 0.2s ease-out',
						position: 'relative',
						left: '0',
						transform: 'translateX(0)'
					}}
				>
					<div className="flex justify-between items-center mb-4">
						<h2 className="text-xl font-medium text-gray-800">Добавить участника</h2>
						<button 
							onClick={onClose}
							className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
						>
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
								<path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
							</svg>
						</button>
					</div>
					
					{!selectedUser ? (
						<div className="mb-6">
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Имя пользователя
							</label>
							<div className="relative">
								<input
									ref={inputRef}
									type="text"
									className="w-full p-2 border border-orange-300 rounded-md bg-gray-50 focus:outline-none focus:ring-1 focus:ring-orange-500"
									placeholder="Введите имя пользователя"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
								/>
								{isLoading && (
									<div className="absolute right-3 top-2.5">
										<div className="animate-spin h-5 w-5 border-2 border-orange-500 rounded-full border-t-transparent"></div>
									</div>
								)}
							</div>
							
							{/* Результаты поиска */}
							{filteredUsers.length > 0 && (
								<div className="mt-1 border border-gray-200 rounded-md max-h-60 overflow-y-auto shadow-lg bg-white z-10">
									{filteredUsers.map((user) => (
										<div
											key={user.username}
											className="p-2 hover:bg-orange-50 cursor-pointer flex items-center border-b border-gray-100 last:border-0"
											onClick={() => handleSelectUser(user)}
										>
											<div className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center text-orange-600 mr-2">
												{getUserInitials(user)}
											</div>
											<div className="flex-grow">
												<div className="font-medium">{user.username}</div>
												{user.email && <div className="text-xs text-gray-500">{user.email}</div>}
											</div>
										</div>
									))}
								</div>
							)}
							
							{/* Сообщение, если ничего не найдено */}
							{searchQuery && filteredUsers.length === 0 && !isLoading && (
								<div className="mt-1 p-2 text-gray-500 text-sm">
									Пользователи не найдены или все соответствующие запросу уже добавлены к доске
								</div>
							)}
						</div>
					) : (
						<div className="mb-6">
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Выбранный пользователь
							</label>
							<div className="p-3 bg-orange-50 rounded-md flex items-center mb-4">
								<div className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center text-orange-600 mr-3">
									{getUserInitials(selectedUser)}
								</div>
								<div className="flex-grow">
									<div className="font-medium">{selectedUser.username}</div>
									{selectedUser.email && <div className="text-sm text-gray-500">{selectedUser.email}</div>}
								</div>
								<button 
									onClick={handleCancelUserSelection}
									className="text-gray-400 hover:text-gray-600 p-1"
								>
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
										<path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
										<path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
									</svg>
								</button>
							</div>
							
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Тип доступа
							</label>
							<select
								className="w-full p-2 border border-orange-300 rounded-md bg-gray-50 focus:outline-none focus:ring-1 focus:ring-orange-500"
								value={accessType}
								onChange={(e) => setAccessType(e.target.value)}
							>
								<option value="CONTRIBUTOR">Участник</option>
								<option value="EDITOR">Редактор</option>
								<option value="VIEWER">Наблюдатель</option>
							</select>
						</div>
					)}
					
					{error && (
						<div className="mb-4 p-2 bg-red-50 text-red-600 rounded-md text-sm">
							{error}
						</div>
					)}
					
					<div className="flex justify-end gap-2">
						<button 
							onClick={onClose}
							className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
						>
							Отмена
						</button>
						
						{selectedUser && (
							<button 
								onClick={handleAddUser}
								disabled={isLoading}
								className={`px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
									isLoading ? 'opacity-70 cursor-not-allowed' : ''
								}`}
							>
								{isLoading ? (
									<>
										<span className="inline-block animate-spin mr-2">⟳</span>
										Добавление...
									</>
								) : (
									'Добавить'
								)}
							</button>
						)}
					</div>
				</div>
			</div>
		</>
	);

	return ReactDOM.createPortal(
		modalContent,
		document.body
	);
};

export default AddUserModal;