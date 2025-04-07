import React, {useEffect, useRef, useState} from 'react'
import {UserService} from '../../../../services/users/Users.ts'
import {UserResponseDto, AddUserModalProps} from './types'
import {UserOnDesk} from '../../components/DeskParticipants/types'
import {RightType} from '../../../../services/users/api/UpdateUserFromDesk'
import ReactDOM from 'react-dom'
import SearchBar from './components/SearchBar'
import UsersList from './components/UsersList'
import SelectedUserPreview from './components/SelectedUserPreview'
import ModalFooter from './components/ModalFooter'

interface ModifiedAddUserModalProps {
	isOpen: boolean;
	onClose: () => void;
	deskId: number;
	onAddSuccess: () => void;
}

const AddUserModal: React.FC<ModifiedAddUserModalProps> = ({
	isOpen,
	onClose,
	deskId,
	onAddSuccess
}) => {
	const [searchQuery, setSearchQuery] = useState('');
	const [availableUsers, setAvailableUsers] = useState<UserResponseDto[]>([]);
	const [filteredUsers, setFilteredUsers] = useState<UserResponseDto[]>([]);
	const [selectedUser, setSelectedUser] = useState<UserResponseDto | null>(null);
	const [accessType, setAccessType] = useState<RightType>(RightType.MEMBER);
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
			console.log('Все пользователи системы:', allUsersData);

			// 2. Получаем пользователей доски
			const deskUsersData = await UserService.getUsersOnDesk(deskId);
			console.log('Пользователи доски:', deskUsersData);

			// 3. Извлекаем имена пользователей (username или userName)
			const usernames = deskUsersData.map(user =>
				user.username || user.userName
			).filter(Boolean).map(name => name.toLowerCase());

			console.log('Имена пользователей на доске:', usernames);

			// 4. Фильтруем - убираем пользователей доски из общего списка
			const filteredAvailable = allUsersData.filter(user => {
				const username = user.username || '';
				return !usernames.includes(username.toLowerCase());
			});

			console.log('Доступные пользователи:', filteredAvailable);
			setAvailableUsers(filteredAvailable);

		} catch (error: unknown) {
			console.error('Ошибка при загрузке данных:', error);
			setAvailableUsers([]);
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
			const username = user.username || user.userName || '';
			const email = user.email || '';
			return username.toLowerCase().includes(lowerQuery) || email.toLowerCase().includes(lowerQuery);
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
		const username = user.username || user.userName || '';
		if (!username) return '?';
		return username.charAt(0).toUpperCase();
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
			const username = selectedUser.username || selectedUser.userName || '';
			console.log('Добавляем пользователя:', username, 'с правами:', accessType);

			// Добавляем пользователя через API
			await UserService.addUserForDesk(deskId, {
				username: username,
				rightType: accessType
			});

			console.log('Пользователь успешно добавлен на сервер');

			// Просто вызываем callback БЕЗ АРГУМЕНТОВ
			onAddSuccess();

			// Сбрасываем состояние модального окна
			setSelectedUser(null);
			setSearchQuery('');
			setAccessType(RightType.MEMBER);

		} catch (err: unknown) {
			console.error('Ошибка при добавлении пользователя:', err);
			setError('Не удалось добавить пользователя. Возможно, он уже добавлен.');
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
							className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 cursor-pointer"
						>
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
								<path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
							</svg>
						</button>
					</div>

					{!selectedUser ? (
						<>
							<SearchBar
								searchQuery={searchQuery}
								setSearchQuery={setSearchQuery}
								isLoading={isLoading}
								inputRef={inputRef}
							/>

							<UsersList
								filteredUsers={filteredUsers}
								handleSelectUser={handleSelectUser}
								getUserInitials={getUserInitials}
							/>

							{/* Сообщение, если ничего не найдено */}
							{searchQuery && filteredUsers.length === 0 && !isLoading && (
								<div className="mt-1 p-2 text-gray-500 text-sm">
									Пользователи не найдены или все соответствующие запросу уже добавлены к доске
								</div>
							)}
						</>
					) : (
						<SelectedUserPreview
							selectedUser={selectedUser}
							handleCancelUserSelection={handleCancelUserSelection}
							accessType={accessType}
							setAccessType={(value: string) => setAccessType(value as RightType)}
							getUserInitials={getUserInitials}
						/>
					)}

					<ModalFooter
						onClose={onClose}
						handleAddUser={handleAddUser}
						isLoading={isLoading}
						selectedUser={selectedUser}
						error={error}
					/>
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