import {useState, useEffect, useRef} from 'react'
import {UserAvatarProps} from '../types/header.types'
import {getUserInitials} from '../utils/userUtils'
import {useNavigate} from 'react-router-dom'

export const UserAvatar = ({
	username,
	email,
	avatarUrl,
	onLogout,
	onSettingsClick,
	size = 'md'
}: UserAvatarProps) => {
	const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
	const navigate = useNavigate()
	const menuRef = useRef<HTMLDivElement>(null);
	const [imgError, setImgError] = useState(false);

	const handleSettingsClick = () => {
		setIsUserMenuOpen(false)
		if (onSettingsClick) {
			onSettingsClick()
		} else {
			navigate('/settings')
		}
	}

	useEffect(() => {
		setImgError(false);
	}, [avatarUrl]);

	const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
		console.error('[Header UserAvatar] Ошибка загрузки изображения по URL:', avatarUrl, e);
		setImgError(true);
	};

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setIsUserMenuOpen(false);
			}
		};

		if (isUserMenuOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isUserMenuOpen]);

	const getSizeClasses = () => {
		switch (size) {
			case 'xs': return 'w-6 h-6 text-xs';
			case 'sm': return 'w-8 h-8 text-sm';
			case 'lg': return 'w-10 h-10 text-base';
			default: return 'w-9 h-9 text-base';
		}
	}

	const renderAvatarContent = () => {
		if (avatarUrl && !imgError) {
			return (
				<img
					src={avatarUrl}
					alt={`Аватар ${username}`}
					className='w-full h-full object-cover'
					onError={handleImageError}
				/>
			);
		} else {
			return getUserInitials(username);
		}
	};

	return (
		<div className='relative' ref={menuRef}>
			{onLogout || onSettingsClick ? (
				<button
					onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
					className={`cursor-pointer ${getSizeClasses()} rounded-full bg-gradient-to-r from-pink-500 to-red-500 text-white flex items-center justify-center overflow-hidden`}
				>
					{renderAvatarContent()}
				</button>
			) : (
				<div
					className={`${getSizeClasses()} rounded-full bg-gradient-to-r from-pink-500 to-red-500 text-white flex items-center justify-center overflow-hidden`}
					title={username}
				>
					{renderAvatarContent()}
				</div>
			)}

			{isUserMenuOpen && (onLogout || onSettingsClick) && (
				<div className='absolute right-0 mt-2 w-60 bg-white rounded-lg shadow-lg border border-gray-200 z-10'>
					<div className='p-3 border-b border-gray-100'>
						<div className='flex items-center'>
							<div className={`w-9 h-9 rounded-full bg-gradient-to-r from-pink-500 to-red-500 text-white flex items-center justify-center mr-3 overflow-hidden`}>
								{renderAvatarContent()}
							</div>
							<div>
								<div className='font-medium text-gray-800'>{username}</div>
								{email && <div className='text-xs text-gray-500'>{email}</div>}
							</div>
						</div>
					</div>
					<div className='p-2'>
						{onSettingsClick && (
							<button onClick={handleSettingsClick} className='w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm'>
								<div className='flex items-center'>
									<svg className='w-4 h-4 mr-2' fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
									</svg>
									Настройки аккаунта
								</div>
							</button>
						)}
						{onLogout && (
							<button onClick={onLogout} className='w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm'>
								<div className='flex items-center'>
									<svg className='w-4 h-4 mr-2' fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
									</svg>
									Выйти
								</div>
							</button>
						)}
					</div>
				</div>
			)}
		</div>
	)
}
