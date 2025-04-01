import React, { useState, useEffect, useRef } from 'react';
import { UserService } from '../../../services/users/Users';
import { UserResponseDto } from '../../../services/users/types/types';

interface AddUserModalProps {
	isOpen: boolean;
	onClose: () => void;
	deskId: number;
	onUserAdded?: () => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, deskId, onUserAdded }) => {
	const [searchQuery, setSearchQuery] = useState('');
	const [searchResults, setSearchResults] = useState<UserResponseDto[]>([]);
	const [selectedUser, setSelectedUser] = useState<UserResponseDto | null>(null);
	const [accessType, setAccessType] = useState<string>('CONTRIBUTOR');
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');
	const modalRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	// Фокус на поле ввода при открытии модального окна
	useEffect(() => {
		if (isOpen && inputRef.current) {
			setTimeout(() => {
				inputRef.current?.focus();
			}, 100);
		}
	}, [isOpen]);

	// Закрытие модального окна при клике вне его
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

	// Поиск пользователей
	const searchUsers = async () => {
		if (!searchQuery.trim()) {
			setSearchResults([]);
			return;
		}

		setIsLoading(true);
		setError('');
		try {
			const users = await UserService.getAllUsers();
			const filteredUsers = users.filter(user => 
				user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
				(user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()))
			);
			setSearchResults(filteredUsers);
		} catch (err) {
			console.error('Ошибка при поиске пользователей:', err);
			setError('Не удалось найти пользователей');
		} finally {
			setIsLoading(false);
		}
	};

	// Обработчик изменения текста поиска с дебаунсингом
	useEffect(() => {
		const timer = setTimeout(() => {
			searchUsers();
		}, 300);
		
		return () => clearTimeout(timer);
	}, [searchQuery]);

	// Добавление пользователя
	const handleAddUser = async () => {
		if (!selectedUser) {
			setError('Выберите пользователя');
			return;
		}

		setIsLoading(true);
		setError('');
		
		try {
			await UserService.addUserForDesk(deskId, {
				username: selectedUser.username,
				rightType: accessType
			});
			
			if (onUserAdded) {
				onUserAdded();
			}
			
			onClose();
		} catch (err: any) {
			setError(err.message || 'Ошибка при добавлении пользователя');
			console.error('Ошибка при добавлении пользователя:', err);
		} finally {
			setIsLoading(false);
		}
	};

	// Выбор пользователя из результатов поиска
	const handleSelectUser = (user: UserResponseDto) => {
		setSelectedUser(user);
		setSearchResults([]);
		setSearchQuery(user.username || '');
	};

	// Получение инициалов пользователя
	const getUserInitials = (user: UserResponseDto) => {
		if (!user.username) return '?';
		return user.username.charAt(0).toUpperCase();
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
			<div ref={modalRef} className="bg-white rounded-lg w-full max-w-md shadow-lg p-6">
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-xl font-medium">Добавить участника</h2>
					<button 
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600"
					>
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
							<path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
						</svg>
					</button>
				</div>
				
				<div className="mb-6">
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Имя пользователя
					</label>
					<div className="relative">
						<input
							ref={inputRef}
							type="text"
							className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
							placeholder="Введите имя пользователя"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
						{isLoading && (
							<div className="absolute right-3 top-2.5">
								<div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
							</div>
						)}
					</div>
					
					{/* Результаты поиска в виде выпадающего списка */}
					{searchResults.length > 0 && !selectedUser && (
						<div className="mt-1 border border-gray-200 rounded-md max-h-60 overflow-y-auto shadow-lg bg-white z-10">
							{searchResults.map((user) => (
								<div
									key={user.username}
									className="p-2 hover:bg-gray-100 cursor-pointer flex items-center border-b border-gray-100 last:border-0"
									onClick={() => handleSelectUser(user)}
								>
									<div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center text-purple-600 mr-2">
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
				</div>

				{selectedUser && (
					<div className="mb-6">
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Уровень доступа
						</label>
						<div className="space-y-2">
							<div 
								className={`p-3 rounded border ${accessType === 'CONTRIBUTOR' ? 'border-blue-300 bg-blue-50' : 'border-gray-200'} cursor-pointer`}
								onClick={() => setAccessType('CONTRIBUTOR')}
							>
								<div className="flex items-center">
									<div className="text-red-500 mr-2">
										<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
											<path d="M3 7V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
											<path d="M13 12L7 12M7 12L10 9M7 12L10 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
										</svg>
									</div>
									<div>
										<div className="font-medium">Редактирование</div>
										<p className="text-xs text-gray-500">Может все</p>
									</div>
								</div>
							</div>
							
							<div 
								className={`p-3 rounded border ${accessType === 'MEMBER' ? 'border-blue-300 bg-blue-50' : 'border-gray-200'} cursor-pointer`}
								onClick={() => setAccessType('MEMBER')}
							>
								<div className="flex items-center">
									<div className="text-gray-500 mr-2">
										<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
											<path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
											<path d="M2 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
											<path d="M15 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
										</svg>
									</div>
									<div>
										<div className="font-medium">Чтение</div>
										<p className="text-xs text-gray-500">Может смотреть, но не трогать</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}

				{error && <div className="text-red-500 mb-4">{error}</div>}
				
				<div className="flex justify-end space-x-2">
					<button
						type="button"
						onClick={onClose}
						className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
					>
						Отмена
					</button>
					<button
						type="button"
						onClick={handleAddUser}
						disabled={!selectedUser || isLoading}
						className={`px-4 py-2 bg-blue-500 text-white rounded transition-colors ${!selectedUser || isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
					>
						{isLoading ? 'Добавление...' : 'Добавить'}
					</button>
				</div>
			</div>
		</div>
	);
};

export default AddUserModal;