import {useState} from 'react'
import {AuthService} from '../services/auth/Auth'

export const Header = () => {
	const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
	const username = AuthService.getUsername()

	// Получаем инициалы пользователя
	const getUserInitials = () => {
		if (!username) return 'U'
		return username.charAt(0).toUpperCase()
	}

	return (
		<header className='w-full h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4'>
			{/* Левая часть с логотипом и названием */}
			<div className='flex items-center'>
				<div className='flex items-center mr-4'>
					<div className='w-7 h-7 bg-gradient-to-r from-blue-400 to-purple-400 rounded flex items-center justify-center mr-2'>
						<div className='grid grid-cols-2 gap-0.5'>
							<div className='w-1.5 h-1.5 bg-white rounded-sm'></div>
							<div className='w-1.5 h-1.5 bg-white rounded-sm'></div>
							<div className='w-1.5 h-1.5 bg-white rounded-sm'></div>
							<div className='w-1.5 h-1.5 bg-white rounded-sm'></div>
						</div>
					</div>
				</div>

				<div className='flex items-center bg-gray-100 rounded-lg py-1 px-2'>
					<div className='w-5 h-5 bg-indigo-100 text-indigo-500 rounded flex items-center justify-center mr-2'>
						<svg className='w-3 h-3' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='3'>
							<path d='M5 13l4 4L19 7' />
						</svg>
					</div>
					<span className='font-medium text-gray-800'>Задачи</span>
				</div>
			</div>

			{/* Правая часть с кнопками и аватаром */}
			<div className='flex items-center'>
				{/* Кнопка Pro */}
				<button className='mr-2 bg-gradient-to-r from-orange-400 to-yellow-300 rounded-lg text-white px-4 py-1.5 text-sm font-medium hover:opacity-90 transition-opacity'>
					Получить «Pro»
				</button>

				{/* Кнопка Пригласить команду */}
				<button className='mr-4 bg-orange-100 text-orange-500 rounded-lg px-4 py-1.5 text-sm font-medium hover:bg-orange-200 transition-colors'>
					<div className='flex items-center'>
						<svg className='w-4 h-4 mr-1' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
							<path d='M12 4v16m8-8H4' />
						</svg>
						Пригласить команду
					</div>
				</button>

				{/* Иконки */}
				<div className='flex items-center space-x-2 mr-2'>
					<button className='w-9 h-9 rounded-full text-gray-500 hover:bg-gray-100 flex items-center justify-center'>
						<svg className='w-5 h-5' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
							<path d='M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13 21v-2h-2v2' />
						</svg>
					</button>

					<button className='w-9 h-9 rounded-full text-gray-500 hover:bg-gray-100 flex items-center justify-center'>
						<svg className='w-5 h-5' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
							<path d='M22 12h-4l-3 9L9 3l-3 9H2' />
						</svg>
					</button>

					<button className='w-9 h-9 rounded-full text-gray-500 hover:bg-gray-100 flex items-center justify-center'>
						<svg className='w-5 h-5' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
							<circle cx='12' cy='12' r='10' />
							<path d='M12 16v-4M12 8h.01' />
						</svg>
					</button>

					<button className='w-9 h-9 rounded-full text-gray-500 hover:bg-gray-100 flex items-center justify-center'>
						<svg className='w-5 h-5' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
							<circle cx='11' cy='11' r='8' />
							<path d='M21 21l-4.3-4.3' />
						</svg>
					</button>
				</div>

				{/* Аватар пользователя */}
				<div className='relative'>
					<button
						onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
						className='w-9 h-9 rounded-full bg-gradient-to-r from-pink-500 to-red-500 text-white flex items-center justify-center'>
						{getUserInitials()}
					</button>

					{isUserMenuOpen && (
						<div className='absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10'>
							<div className='p-3 border-b border-gray-100'>
								<div className='font-medium text-gray-800'>{username}</div>
							</div>
							<div className='p-2'>
								<button
									onClick={() => AuthService.logout()}
									className='w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm'>
									Выйти
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
		</header>
	)
}
