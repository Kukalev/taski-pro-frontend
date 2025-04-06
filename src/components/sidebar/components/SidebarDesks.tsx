import React, {useEffect, useRef, useState} from 'react'
import {useLocation} from 'react-router-dom'
import {getDeskColor} from '../../../utils/deskColors'
import {SidebarDesksProps} from '../types/sidebar.types'
import {canEditDesk} from '../../../utils/permissionUtils'
import {UserService} from '../../../services/users/Users'

// Кэш для хранения ролей пользователей по доскам
const userRolesCache = new Map<number, boolean>();

export const SidebarDesks = ({ desks, loading, onDeskClick, onAddClick, onRename, onDelete, searchQuery, originalDesksCount }: SidebarDesksProps) => {
	const location = useLocation()
	const [activeMenu, setActiveMenu] = useState<number | null>(null)
	const menuRef = useRef<HTMLDivElement>(null)
	const buttonsRef = useRef<{[key: number]: HTMLDivElement | null}>({})
	const [deskPermissions, setDeskPermissions] = useState<{[key: number]: boolean}>({})
	const checkingPermissionsRef = useRef<{[key: number]: boolean}>({})
	const [isAddButtonHovered, setIsAddButtonHovered] = useState(false);

	// Создаем ссылку для кнопки
	const setButtonRef = (id: number, el: HTMLDivElement | null) => {
		buttonsRef.current[id] = el
	}

	// Обработчик клика по кнопке троеточия
	const handleMenuToggle = (e: React.MouseEvent, deskId: number) => {
		e.stopPropagation() // Предотвращаем срабатывание клика по элементу списка
		e.preventDefault()
		
		// Проверяем, есть ли у пользователя права редактировать доску
		if (!deskPermissions[deskId]) {
			console.log('У вас нет прав для управления этой доской')
			return
		}
		
		setActiveMenu(activeMenu === deskId ? null : deskId)
	}

	// Функция для проверки прав пользователя на доске
	useEffect(() => {
		desks.forEach(desk => {
			// Если права уже проверяются или уже известны, пропускаем
			if (checkingPermissionsRef.current[desk.id] || deskPermissions[desk.id] !== undefined) {
				return
			}
			
			// Если права уже в кэше, используем их
			if (userRolesCache.has(desk.id)) {
				setDeskPermissions(prev => ({
					...prev,
					[desk.id]: userRolesCache.get(desk.id) || false
				}))
				return
			}
			
			// Отмечаем, что начали проверку прав
			checkingPermissionsRef.current[desk.id] = true
			
			// Асинхронно проверяем права пользователя
			const checkPermissions = async () => {
				try {
					const users = await UserService.getUsersOnDesk(desk.id)
					const hasPermission = canEditDesk(users)
					
					// Сохраняем результат в кэш и состояние
					userRolesCache.set(desk.id, hasPermission)
					setDeskPermissions(prev => ({
						...prev,
						[desk.id]: hasPermission
					}))
				} catch (error) {
					console.error('Ошибка при проверке прав пользователя:', error)
					// В случае ошибки считаем, что прав нет
					setDeskPermissions(prev => ({
						...prev,
						[desk.id]: false
					}))
				} finally {
					checkingPermissionsRef.current[desk.id] = false
				}
			}
			
			checkPermissions()
		})
	}, [desks])

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

	// Стили для динамической кнопки
	const addButtonStyle: React.CSSProperties = {
		backgroundColor: 'var(--theme-color)',
		color: 'white',
		cursor: 'pointer',
		transition: 'background-color 0.2s ease-in-out',
	};

	const hoverAddButtonStyle: React.CSSProperties = {
		backgroundColor: 'var(--theme-color-dark)',
	};

	// Финальный стиль кнопки зависит от состояния isAddButtonHovered
	const currentAddButtonStyle = isAddButtonHovered
		? { ...addButtonStyle, ...hoverAddButtonStyle }
		: addButtonStyle;

	// --- Логика рендеринга контента ---
	const renderContent = () => {
		if (loading) {
			return <div className='text-center py-2 text-gray-500 text-sm'>Загрузка проектов...</div>;
		}

		// Если поиск не пустой и НЕТ результатов
		if (searchQuery && desks.length === 0) {
			return <div className='text-center py-4 text-gray-500 text-sm px-2'>Проекты с таким названием не найдены.</div>;
		}

		// Если поиск пустой и НЕТ досок вообще
		if (!searchQuery && originalDesksCount === 0) {
			return (
				<div className='bg-gray-100 rounded-lg p-4 mx-2'>
					<h3 className='text-gray-900 font-medium mb-2'>Создайте свой проект</h3>
					<p className='text-gray-900 text-sm mb-4'>Создайте проект и пригласите в него команду для совместной работы</p>
					<button
						onClick={onAddClick}
						className='w-full text-white py-2 px-4 rounded-lg cursor-pointer transition-colors duration-200 ease-in-out'
						style={currentAddButtonStyle}
						onMouseEnter={() => setIsAddButtonHovered(true)}
						onMouseLeave={() => setIsAddButtonHovered(false)}
					>
						Добавить проект
					</button>
				</div>
			);
		}

		// Если есть результаты (либо поиск не пустой и есть совпадения, либо поиск пустой и есть доски)
		if (desks.length > 0) {
			return (
				<ul className='space-y-1'>
					{desks.map(desk => (
						<li key={desk.id} className="relative group">
							<button
								onClick={() => onDeskClick(desk.id)}
								className={`w-full h-[32px] text-left px-4 py-1 rounded-md flex items-center gap-1.5 cursor-pointer text-[13px] transition-all duration-200 hover:bg-gray-100 ${location.pathname.includes(`/desk/${desk.id}`) ? 'bg-gray-200 text-gray-900' : 'text-gray-700'}`}
								title={desk.deskName}
							>
								<div className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-medium ${getDeskColor(desk.id)} flex-shrink-0`}>{desk.deskName.charAt(0).toUpperCase()}</div>
								<span className='truncate flex-grow'>{desk.deskName}</span>
								{deskPermissions[desk.id] && (
									<div
										ref={(el) => setButtonRef(desk.id, el)}
										onClick={(e) => handleMenuToggle(e, desk.id)}
										className="h-[20px] w-[20px] opacity-0 group-hover:opacity-100 flex items-center justify-center text-gray-500 hover:text-gray-700"
										data-interactive-control="true"
									>
										<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
											<circle cx="12" cy="6" r="1" />
											<circle cx="12" cy="12" r="1" />
											<circle cx="12" cy="18" r="1" />
										</svg>
									</div>
								)}
							</button>
							{activeMenu === desk.id && deskPermissions[desk.id] && (
								<div ref={menuRef} className="absolute right-0 mt-1 z-10 bg-white rounded-md shadow-lg border border-gray-100 w-44">
									<div className="py-1">
										<button 
											onClick={() => {
												onRename(desk.id)
												setActiveMenu(null)
											}}
											className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
											data-interactive-control="true"
										>
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
											className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
											data-interactive-control="true"
										>
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
			);
		}

		// На случай, если ни одно условие не сработало (не должно происходить)
		return null;
	};
	// -----------------------------------

	return (
		<div className='flex-grow flex flex-col overflow-hidden'>
			{/* Фиксированный заголовок с кнопкой добавления */}
			<div className='flex justify-between items-center mb-2 px-4 flex-shrink-0'>
				<h3 className='text-[14px] font-medium text-gray-600'>Проекты</h3>
				<button onClick={onAddClick} className='w-5 h-5 rounded-sm bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 flex items-center justify-center transition-colors' data-interactive-control="true">
					<svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
						<path d='M12 5v14M5 12h14' />
					</svg>
				</button>
			</div>

			{/* Скроллируемая область с контентом */}
			<div className='overflow-auto flex-grow mb-4'>
				{renderContent()}
			</div>
		</div>
	)
}
