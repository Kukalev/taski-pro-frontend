import { useLocation } from 'react-router-dom'
import { getDeskColor } from '../../../utils/deskColors'
import { DeskData, SidebarDesksProps } from '../types/sidebar.types'
import { useState, useRef, useEffect } from 'react'

export const SidebarDesks = ({ desks, loading, onDeskClick, onAddClick, onRename, onDelete }: SidebarDesksProps) => {
	const location = useLocation()
	const [activeMenu, setActiveMenu] = useState<number | null>(null)
	const menuRef = useRef<HTMLDivElement>(null)
	const buttonsRef = useRef<{[key: number]: HTMLDivElement | null}>({})

	// Создаем ссылку для кнопки
	const setButtonRef = (id: number, el: HTMLDivElement | null) => {
		buttonsRef.current[id] = el
	}

	// Обработчик клика по кнопке троеточия
	const handleMenuToggle = (e: React.MouseEvent, deskId: number) => {
		e.stopPropagation() // Предотвращаем срабатывание клика по элементу списка
		e.preventDefault()
		setActiveMenu(activeMenu === deskId ? null : deskId)
	}

	// Закрытие меню при клике вне него
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (activeMenu !== null) {
				const isClickInsideMenu = menuRef.current && menuRef.current.contains(e.target as Node)
				const isClickInsideButton = buttonsRef.current[activeMenu] && buttonsRef.current[activeMenu]?.contains(e.target as Node)
				
				if (!isClickInsideMenu && !isClickInsideButton) {
					setActiveMenu(null)
				}
			}
		}

		// Добавляем обработчик только если какое-то меню открыто
		if (activeMenu !== null) {
			document.addEventListener('mousedown', handleClickOutside)
		}
		
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [activeMenu])

	return (
		<div className='flex-grow flex flex-col overflow-hidden'>
			{/* Фиксированный заголовок с кнопкой добавления */}
			<div className='flex justify-between items-center mb-2 px-4 flex-shrink-0'>
				<h3 className='text-[14px] font-medium text-gray-600'>Проекты</h3>
				<button onClick={onAddClick} className='w-5 h-5 rounded-sm bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 flex items-center justify-center transition-colors'>
					<svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
						<path d='M12 5v14M5 12h14' />
					</svg>
				</button>
			</div>

			{/* Скроллируемый список досок */}
			<div className='overflow-auto flex-grow mb-4'>
				{loading ? (
					<div className='text-center py-2 text-gray-500 text-sm'>Загрузка проектов...</div>
				) : desks.length > 0 ? (
					<ul className='space-y-1'>
						{desks.map(desk => (
							<li key={desk.id} className="relative group">
								<button
									onClick={() => onDeskClick(desk.id)}
									className={`w-full h-[32px] text-left px-4 py-1 rounded-md flex items-center gap-2 cursor-pointer text-[13px] transition-all duration-200 hover:bg-gray-100
										${location.pathname.includes(`/desk/${desk.id}`) ? 'bg-gray-200 text-gray-900' : 'text-gray-700'}`}>
									<div className={`w-5 h-5 rounded flex items-center justify-center ${getDeskColor(desk.id)}`}>{desk.deskName.charAt(0).toUpperCase()}</div>
									<span className='truncate flex-grow'>{desk.deskName}</span>
									<div
										ref={(el) => setButtonRef(desk.id, el)}
										onClick={(e) => handleMenuToggle(e, desk.id)}
										className="h-[20px] w-[20px] opacity-0 group-hover:opacity-100 flex items-center justify-center text-gray-500 hover:text-gray-700">
										<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
											<circle cx="12" cy="6" r="1" />
											<circle cx="12" cy="12" r="1" />
											<circle cx="12" cy="18" r="1" />
										</svg>
									</div>
								</button>
								
								{/* Выпадающее меню */}
								{activeMenu === desk.id && (
									<div ref={menuRef} className="absolute right-0 mt-1 z-10 bg-white rounded-md shadow-lg border border-gray-100 w-44">
										<div className="py-1">
											<button 
												onClick={() => {
													onRename(desk.id)
													setActiveMenu(null)
												}}
												className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
												<svg className="mr-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
													<path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
													<path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
												</svg>
												Переименовать
											</button>
											<button 
												onClick={() => {
													onDelete(desk.id)
													setActiveMenu(null)
												}}
												className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center">
												<svg className="mr-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
													<path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
												</svg>
												Удалить
											</button>
										</div>
									</div>
								)}
							</li>
						))}
					</ul>
				) : (
					<div className='bg-gray-100 rounded-lg p-4 mx-2'>
						<h3 className='text-gray-900 font-medium mb-2'>Создайте свой проект</h3>
						<p className='text-gray-900 text-sm mb-4'>Создайте проект и пригласите в него команду для совместной работы</p>
						<button onClick={onAddClick} className='w-full bg-[#FF9500] text-white py-2 px-4 rounded-lg hover:opacity-90 transition-opacity cursor-pointer'>
							Добавить проект
						</button>
					</div>
				)}
			</div>
		</div>
	)
}
