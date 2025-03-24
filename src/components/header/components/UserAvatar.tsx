import { useState } from 'react'
import { UserAvatarProps } from '../types/header.types'
import { getUserInitials } from '../utils/userUtils'

export const UserAvatar = ({ username, onLogout }: UserAvatarProps) => {
	const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

	return (
		<div className='relative'>
			<button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className='w-9 h-9 rounded-full bg-gradient-to-r from-pink-500 to-red-500 text-white flex items-center justify-center'>
				{getUserInitials(username)}
			</button>

			{isUserMenuOpen && (
				<div className='absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10'>
					<div className='p-3 border-b border-gray-100'>
						<div className='font-medium text-gray-800'>{username}</div>
					</div>
					<div className='p-2'>
						<button onClick={onLogout} className='w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm'>
							Выйти
						</button>
					</div>
				</div>
			)}
		</div>
	)
}
