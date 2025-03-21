import {useState} from 'react'
import {useLocation, useNavigate} from 'react-router-dom'
import {AuthService} from '../../services/auth/Auth'
import {CreateDeskModal} from '../modals/CreateDeskModal'

export const Sidebar = () => {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const navigate = useNavigate()
	const location = useLocation()

	const username = AuthService.getUsername()

	const handleItemClick = (path: string) => {
		navigate(path)
	}

	return (
		<>
			<div className='w-70 min-w-[300px] bg-gray-50 h-screen p-4 flex flex-col'>
				{/* Поиск */}
				<div className='mb-4'>
					<div className='relative'>
						<input
							type='text'
							placeholder='Доска'
							className='w-full px-4 py-2 pl-10 bg-gray-100 border border-white rounded-2xl hover:bg-gray-200 focus:outline-none focus:bg-gray-200 transition-all duration-200'
						/>
						<div className='absolute left-3 top-1/2 -translate-y-1/2'>
							<svg
								width='16'
								height='16'
								viewBox='0 0 24 24'
								fill='none'
								stroke='currentColor'
								strokeWidth='2'
								className='text-gray-400'>
								<path d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
							</svg>
						</div>
					</div>
				</div>

				{/* Основное меню */}
				<nav className='mb-4'>
					<ul className='space-y-1'>
						<li>
							<button
								className={`w-full h-[36px] text-left px-4 py-1 rounded-md flex items-center gap-3 cursor-pointer text-[14px] transition-all duration-200 
                                    ${location.pathname === '/desk/mytasks' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
								onClick={() => handleItemClick('/desk/mytasks')}>
								<svg width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
									<path d='M12 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V12M9 15L20 4' />
								</svg>
								<span
									className={`transition-all duration-200 leading-none
                                    ${
																			location.pathname === '/desk/mytasks'
																				? 'text-gray-900 text-[16px]'
																				: 'text-gray-700 text-[14px]'
																		}`}>
									Мои задачи
								</span>
							</button>
						</li>
						<li>
							<button
								className={`w-full h-[36px] text-left px-4 py-1 rounded-md flex items-center gap-3 cursor-pointer text-[14px] transition-all duration-200 
                                    ${location.pathname === '/desk/alltasks' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
								onClick={() => handleItemClick('/desk/alltasks')}>
								<svg width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
									<path d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' />
								</svg>
								<span
									className={`transition-all duration-200 leading-none
                                    ${
																			location.pathname === '/desk/alltasks'
																				? 'text-gray-900 text-[16px]'
																				: 'text-gray-700 text-[14px]'
																		}`}>
									Все задачи
								</span>
							</button>
						</li>
						<li>
							<button
								className={`w-full h-[36px] text-left px-4 py-1 rounded-md flex items-center gap-3 cursor-pointer text-[14px] transition-all duration-200 
                                    ${location.pathname === '/desk/alldesks' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
								onClick={() => handleItemClick('/desk/alldesks')}>
								<svg width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
									<path d='M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' />
								</svg>
								<span
									className={`transition-all duration-200 leading-none
                                    ${
																			location.pathname === '/desk/alldesks'
																				? 'text-gray-900 text-[16px]'
																				: 'text-gray-700 text-[14px]'
																		}`}>
									Все доски
								</span>
							</button>
						</li>
					</ul>
				</nav>

				{/* Секция создания доски */}
				<div className='mb-4'>
					<div className='bg-gray-100 rounded-lg p-4'>
						<h3 className='text-gray-900 font-medium mb-2'>Создайте свою доску</h3>
						<p className='text-gray-900 text-sm mb-4'>
							Создайте доску и пригласите в неё команду для совместной работы
						</p>
						<button
							onClick={() => setIsModalOpen(true)}
							className='w-full bg-[#FF9500] text-white py-2 px-4 rounded-lg hover:opacity-90 transition-opacity cursor-pointer'>
							Добавить доску
						</button>
					</div>
				</div>

				{/* Растягивающийся элемент */}
				<div className='flex-grow'></div>

				{/* Счетчик досок */}
				<div className='text-sm text-gray-500'>
					Создано 0 из 7 досок
					<div className='mt-2 h-1 bg-gray-200 rounded-full'>
						<div className='h-full bg-[#FF9500] rounded-full' style={{width: '0%'}}></div>
					</div>
				</div>
			</div>

			<CreateDeskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
		</>
	)
}
