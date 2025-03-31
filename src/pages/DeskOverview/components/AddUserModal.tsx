import React, {useEffect, useRef, useState} from 'react'
import {UserService} from '../../../services/users/Users'
import {UserResponseDto} from '../../../services/users/types/types'

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
	const [accessType, setAccessType] = useState<string>('CONTRIBUTOR'); // По умолчанию - Редактирование
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
			// Фильтрация пользователей по запросу (имитация поиска)
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
		setSearchQuery(getUserDisplayName(user) + (user.email ? ` (${user.email})` : ''));
	};

	// Функция для получения инициалов пользователя безопасным способом
	const getUserInitials = (user: UserResponseDto) => {
		const firstInitial = user.firstName ? user.firstName.charAt(0) : '';
		const lastInitial = user.lastName ? user.lastName.charAt(0) : '';

		if (!firstInitial && !lastInitial) {
			return user.username ? user.username.charAt(0).toUpperCase() :
				user.email ? user.email.charAt(0).toUpperCase() : '?';
		}

		return `${firstInitial}${lastInitial}`;
	};

	// Функция для отображения имени пользователя
	const getUserDisplayName = (user: UserResponseDto) => {
		if (user.firstName && user.lastName) {
			return `${user.firstName} ${user.lastName}`;
		}
		return user.username || user.email || 'Неизвестный пользователь';
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div ref={modalRef} className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl">
				<h2 className="text-xl font-semibold mb-4">Добавить участника</h2>

				<div className="mb-6">
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Email или имя пользователя
					</label>
					<div className="relative">
						<input
							ref={inputRef}
							type="text"
							className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="Введите email или имя пользователя"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
						{isLoading && (
							<div className="absolute right-3 top-2.5">
								<div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
							</div>
						)}
					</div>

					{/* Результаты поиска */}
					{searchResults.length > 0 && !selectedUser && (
						<div className="mt-1 border border-gray-200 rounded-md max-h-60 overflow-y-auto shadow-lg bg-white z-10">
							{searchResults.map((user) => (
								<div
									key={user.username}
									className="p-2 hover:bg-gray-100 cursor-pointer flex items-center"
									onClick={() => handleSelectUser(user)}
								>
									<div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-2">
										{getUserInitials(user)}
									</div>
									<div>
										<div className="font-medium">{getUserDisplayName(user)}</div>
										<div className="text-sm text-gray-500">{user.email}</div>
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
						<select
							className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							value={accessType}
							onChange={(e) => setAccessType(e.target.value)}
						>
							<option value="CREATOR">Редактирование (Может всё)</option>
							<option value="CONTRIBUTOR">Комментирование (Может смотреть и комментировать)</option>
							<option value="MEMBER">Чтение (Может смотреть, но не трогать)</option>
						</select>
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