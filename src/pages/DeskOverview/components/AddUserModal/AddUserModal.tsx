import React, {useEffect, useRef, useState, useCallback} from 'react'
import {UserService} from '../../../../services/users/Users.ts'
import {UserResponseDto, AddUserModalProps, SelectedUserPreviewProps, UsersListProps} from './types'
import {RightType} from '../../../../services/users/api/UpdateUserFromDesk'
import ReactDOM from 'react-dom'
import SearchBar from './components/SearchBar'
import UsersList from './components/UsersList'
import SelectedUserPreview from './components/SelectedUserPreview'
import ModalFooter from './components/ModalFooter'
import { AvatarService } from '../../../../services/Avatar/Avatar.ts'

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
	const [selectedUserAvatarUrl, setSelectedUserAvatarUrl] = useState<string | null>(null);
	const [searchAvatarsUrls, setSearchAvatarsUrls] = useState<Record<string, string | null>>({});
	const [accessType, setAccessType] = useState<RightType>(RightType.MEMBER);
	const [isLoading, setIsLoading] = useState(false);
	const [searchLoading, setSearchLoading] = useState(false);
	const [error, setError] = useState('');
	const modalRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const previousSearchAvatarsRef = useRef<Record<string, string | null>>({});

	const clearSearchAvatarsUrls = useCallback(() => {
		console.log("[AddUserModal] Очистка URL аватарок поиска...");
		Object.values(previousSearchAvatarsRef.current).forEach(url => {
			if (url) {
				URL.revokeObjectURL(url);
			}
		});
		previousSearchAvatarsRef.current = {};
		setSearchAvatarsUrls({});
	}, []);

	useEffect(() => {
		previousSearchAvatarsRef.current = searchAvatarsUrls;
	}, [searchAvatarsUrls]);

	const createObjectUrlsFromBatchResponse = (batchResponse: Record<string, string | null>): Record<string, string | null> => {
		const newAvatarsMap: Record<string, string | null> = {};
		for (const username in batchResponse) {
			const base64Data = batchResponse[username];
			let newUrl: string | null = null;
			if (base64Data) {
				try {
					if (typeof base64Data === 'string' && base64Data.startsWith('data:image')) {
						const byteCharacters = atob(base64Data.split(',')[1]);
						const byteNumbers = new Array(byteCharacters.length);
						for (let i = 0; i < byteCharacters.length; i++) {
							byteNumbers[i] = byteCharacters.charCodeAt(i);
						}
						const byteArray = new Uint8Array(byteNumbers);
						const mimeType = base64Data.match(/data:(.*);/)?.[1] || 'image/png';
						const blob = new Blob([byteArray], { type: mimeType });
						newUrl = URL.createObjectURL(blob);
					} else {
						console.warn(`[AddUserModal] Некорректный формат Base64 для ${username}`);
					}
				} catch (e) {
					console.error(`[AddUserModal] Ошибка создания Object URL для ${username}:`, e);
				}
			}
			newAvatarsMap[username] = newUrl;
		}
		return newAvatarsMap;
	};

	const clearSelectedAvatarUrl = useCallback(() => {
		if (previousSearchAvatarsRef.current) {
			console.log("[AddUserModal] Отзыв URL выбранного аватара:", previousSearchAvatarsRef.current);
			URL.revokeObjectURL(previousSearchAvatarsRef.current);
		}
		setSelectedUserAvatarUrl(null);
	}, []);

	useEffect(() => {
		if (isOpen && deskId) {
			setSearchQuery('');
			setAvailableUsers([]);
			setFilteredUsers([]);
			setSelectedUser(null);
			clearSelectedAvatarUrl();
			clearSearchAvatarsUrls();
			setAccessType(RightType.MEMBER);
			setError('');
			setIsLoading(true);
			setSearchLoading(false);
			loadData();

			setTimeout(() => {
				inputRef.current?.focus();
			}, 100);
		}
		if (!isOpen) {
			setSearchQuery('');
			setAvailableUsers([]);
			setFilteredUsers([]);
			setSelectedUser(null);
			clearSelectedAvatarUrl();
			clearSearchAvatarsUrls();
			setAccessType(RightType.MEMBER);
			setError('');
			setIsLoading(false);
			setSearchLoading(false);
		}
	}, [isOpen, deskId, clearSelectedAvatarUrl, clearSearchAvatarsUrls]);

	const loadData = useCallback(async () => {
		setIsLoading(true);
		clearSearchAvatarsUrls();
		try {
			const allUsersData = await UserService.getAllUsers();
			const deskUsersData = await UserService.getUsersOnDesk(deskId);

			const deskUsernames = new Set(deskUsersData.map(user =>
				(user.username || user.userName || '').toLowerCase()
			).filter(Boolean));

			const filteredAvailable = allUsersData.filter(user => {
				const username = (user.username || user.userName || '').toLowerCase();
				return username && !deskUsernames.has(username);
			});

			console.log('[AddUserModal] Доступные пользователи для добавления:', filteredAvailable);
			setAvailableUsers(filteredAvailable);

			if (filteredAvailable.length > 0) {
				const usernamesToFetch = [...new Set(filteredAvailable
					.map(u => u.username || u.userName)
					.filter((name): name is string => !!name))];

				if (usernamesToFetch.length > 0) {
					console.log('[AddUserModal] Запрос аватарок для ВСЕХ доступных:', usernamesToFetch);
					try {
						setSearchLoading(true);
						const batchResponse = await AvatarService.getAllAvatars(usernamesToFetch);
						const objectUrlsMap = createObjectUrlsFromBatchResponse(batchResponse);
						setSearchAvatarsUrls(objectUrlsMap);
						console.log('[AddUserModal] Загружены и сохранены аватарки (Object URLs) для всех доступных.');
					} catch (avatarError) {
						console.error('[AddUserModal] Ошибка загрузки аватарок для всех доступных:', avatarError);
						clearSearchAvatarsUrls();
					} finally {
						setSearchLoading(false);
					}
				} else {
					clearSearchAvatarsUrls();
				}
			} else {
				clearSearchAvatarsUrls();
			}

		} catch (error: unknown) {
			console.error('[AddUserModal] Ошибка при загрузке данных:', error);
			setError('Не удалось загрузить список пользователей.');
			setAvailableUsers([]);
			clearSearchAvatarsUrls();
		} finally {
			setIsLoading(false);
		}
	}, [deskId, setIsLoading, setAvailableUsers, setError, clearSearchAvatarsUrls, setSearchAvatarsUrls]);

	useEffect(() => {
		if (!searchQuery.trim() || availableUsers.length === 0) {
			setFilteredUsers([]);
			clearSearchAvatarsUrls();
			return;
		}

		setSearchLoading(true);
		setError(null);
		clearSearchAvatarsUrls();

		console.log(`[AddUserModal] Фильтрация доступных пользователей по: "${searchQuery}"`);
		const lowerQuery = searchQuery.toLowerCase();

		const filtered = availableUsers.filter(user => {
			const username = user.username || user.userName || '';
			const email = user.email || '';
			return username.toLowerCase().includes(lowerQuery) || email.toLowerCase().includes(lowerQuery);
		});

		setFilteredUsers(filtered);
		console.log('[AddUserModal] Результаты фильтрации:', filtered);

		const loadFilteredAvatars = async () => {
			if (filtered.length > 0) {
				const usernamesToFetch = [...new Set(filtered
					.map(u => u.username || u.userName)
					.filter((name): name is string => !!name))];

				if (usernamesToFetch.length > 0) {
					console.log('[AddUserModal] Запрос аватарок для РЕЗУЛЬТАТОВ ПОИСКА:', usernamesToFetch);
					try {
						const batchResponse = await AvatarService.getAllAvatars(usernamesToFetch);
						const objectUrlsMap = createObjectUrlsFromBatchResponse(batchResponse);
						setSearchAvatarsUrls(objectUrlsMap);
						console.log('[AddUserModal] Загружены и сохранены аватарки (Object URLs) для результатов поиска.');
					} catch (avatarError) {
						console.error('[AddUserModal] Ошибка загрузки аватарок для результатов поиска:', avatarError);
						setError('Не удалось загрузить аватарки для поиска.');
						clearSearchAvatarsUrls();
					}
				} else {
					clearSearchAvatarsUrls();
				}
			} else {
				clearSearchAvatarsUrls();
			}
		};

		loadFilteredAvatars().finally(() => {
			setSearchLoading(false);
		});
	}, [searchQuery, availableUsers, setSearchAvatarsUrls, clearSearchAvatarsUrls]);

	useEffect(() => {
		if (isOpen && inputRef.current) {
			setTimeout(() => {
				inputRef.current?.focus();
			}, 100);
		}
	}, [isOpen]);

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

	useEffect(() => {
		const fetchAvatar = async () => {
			clearSelectedAvatarUrl();
			if (!selectedUser) return;
			const username = selectedUser.username || selectedUser.userName;
			if (!username) return;

			console.log('[AddUserModal] Запрос аватара для ВЫБРАННОГО:', username);
			try {
				const batchResponse = await AvatarService.getAllAvatars([username]);
				const base64Data = batchResponse[username];
				let newUrl: string | null = null;
				if (base64Data) {
					 try {
						 const byteString = atob(base64Data.split(',')[1]);
						 const mimeString = base64Data.split(',')[0].split(':')[1].split(';')[0];
						 const ab = new ArrayBuffer(byteString.length);
						 const ia = new Uint8Array(ab);
						 for (let i = 0; i < byteString.length; i++) { ia[i] = byteString.charCodeAt(i); }
						 const blob = new Blob([ab], { type: mimeString });
						 newUrl = URL.createObjectURL(blob);
						 console.log('[AddUserModal] Создан Blob URL:', newUrl);
					 } catch (e) { console.error(`[AddUserModal] Ошибка Blob URL ${username}:`, e); }
				}
				setSelectedUserAvatarUrl(newUrl);
			} catch (error) {
				console.error('[AddUserModal] Ошибка загрузки выбранного аватара:', error);
				clearSelectedAvatarUrl();
			}
		};
		fetchAvatar();
	}, [selectedUser, clearSelectedAvatarUrl]);

	const getUserInitials = (user: UserResponseDto) => {
		const username = user.username || user.userName || '';
		if (!username) return '?';
		return username.charAt(0).toUpperCase();
	};

	const handleSelectUser = (user: UserResponseDto) => {
		setSelectedUser(user);
		setSearchQuery('');
		setFilteredUsers([]);
		clearSearchAvatarsUrls();
	};

	const handleCancelUserSelection = () => {
		setSelectedUser(null);
		setSearchQuery('');
		if (inputRef.current) {
			inputRef.current.focus();
		}
	};

	const handleAddUser = async () => {
		if (!selectedUser) return;

		setIsLoading(true);
		setError('');
		try {
			const username = selectedUser.username || selectedUser.userName || '';
			console.log('Добавляем пользователя:', username, 'с правами:', accessType);

			await UserService.addUserForDesk(deskId, {
				username: username,
				rightType: accessType
			});

			console.log('Пользователь успешно добавлен на сервер');
			onAddSuccess();

		} catch (err: unknown) {
			console.error('Ошибка при добавлении пользователя:', err);
			setError(err instanceof Error ? err.message : 'Не удалось добавить пользователя. Возможно, он уже добавлен.');
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

							{!searchLoading && filteredUsers.length > 0 && (
								<UsersList
									filteredUsers={filteredUsers}
									handleSelectUser={handleSelectUser}
									avatarsMap={searchAvatarsUrls}
								/>
							)}

							{!searchLoading && filteredUsers.length === 0 && searchQuery.trim() && (
								<div className="mt-1 p-2 text-gray-500 text-sm">
									Пользователи не найдены
								</div>
							)}

							{searchLoading && (
								<div className="mt-1 p-2 text-gray-500 text-sm text-center">
									Поиск...
								</div>
							)}

							{isLoading && !searchLoading && availableUsers.length === 0 && (
								<div className="mt-1 p-2 text-gray-500 text-sm text-center">
									Загрузка пользователей...
								</div>
							)}
						</>
					) : (
						<SelectedUserPreview
							selectedUser={selectedUser}
							handleCancelUserSelection={handleCancelUserSelection}
							accessType={accessType}
							setAccessType={(value: string) => setAccessType(value as RightType)}
							avatarUrl={selectedUserAvatarUrl}
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