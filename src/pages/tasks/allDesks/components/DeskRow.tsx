import { useNavigate } from 'react-router-dom'
import { DeskData } from '../types/desk.types'
import { getDeskColor } from '../../../../utils/deskColors'
import { useState, useRef, useEffect } from 'react'

interface DeskRowProps {
	desk: DeskData
	username: string
	onRename?: (id: number) => void
	onDelete?: (id: number) => void
}

export const DeskRow = ({ desk, username, onRename, onDelete }: DeskRowProps) => {
	const navigate = useNavigate()
	const [showMenu, setShowMenu] = useState(false)
	const menuRef = useRef<HTMLDivElement>(null)
	const buttonRef = useRef<HTMLButtonElement>(null)
	
	// Форматирование даты
	const formatDate = (date: Date | null) => {
		if (!date) return "-";
		return new Date(date).toLocaleDateString('ru-RU', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}
	
	// Форматируем диапазон дат
	const formatDateRange = () => {
		if (!desk.deskCreateDate) return "-";
		
		const startDate = formatDate(desk.deskCreateDate);
		const endDate = desk.deskFinishDate ? formatDate(desk.deskFinishDate) : null;
		
		if (endDate) {
			return `${startDate} - ${endDate}`;
		}
		return startDate;
	}
	
	// Определяем владельца и его инициалы
	const owner = desk.deskOwner || username;
	const getInitials = (name: string) => {
		if (!name) return 'UN';
		return name.substring(0, 2).toUpperCase();
	};
	
	// Логирование для отладки
	useEffect(() => {
		console.log(`Данные доски ${desk.id}:`, desk);
		console.log(`Владелец доски ${desk.id}:`, owner);
	}, [desk, owner]);
	
	const handleDeskClick = () => {
		navigate(`/desk/${desk.id}/board`)
	}
	
	const handleMenuClick = (e: React.MouseEvent) => {
		e.stopPropagation()
		e.preventDefault()
		setShowMenu(!showMenu)
	}
	
	// Закрытие меню при клике вне него
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			// Проверяем, что клик был не по меню и не по кнопке открытия меню
			if (
				menuRef.current && 
				!menuRef.current.contains(e.target as Node) &&
				buttonRef.current && 
				!buttonRef.current.contains(e.target as Node)
			) {
				setShowMenu(false)
			}
		}
		
		// Добавляем обработчик клика только если меню открыто
		if (showMenu) {
			document.addEventListener('mousedown', handleClickOutside)
		}
		
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [showMenu])
	
	return (
		<tr className='border-b border-gray-100 hover:bg-gray-50 cursor-pointer group' onClick={handleDeskClick}>
			<td className='py-3 px-4 relative'>
				<div className='flex items-center justify-between'>
					<div className='flex items-center'>
						<div className={`w-8 h-8 ${getDeskColor(desk.id)} rounded flex items-center justify-center mr-3`}>{desk.deskName.charAt(0).toUpperCase()}</div>
						<span className='font-medium text-gray-800'>{desk.deskName}</span>
					</div>
					
					<button 
						ref={buttonRef}
						onClick={handleMenuClick}
						className="h-8 w-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
							<circle cx="12" cy="6" r="1" />
							<circle cx="12" cy="12" r="1" />
							<circle cx="12" cy="18" r="1" />
						</svg>
					</button>
					
					{showMenu && (
						<div ref={menuRef} className="absolute right-4 top-full mt-1 z-50 bg-white rounded-md shadow-lg border border-gray-100 w-44">
							<div className="py-1">
								{onRename && (
									<button 
										onClick={(e) => {
											e.stopPropagation()
											if (onRename) onRename(desk.id)
											setShowMenu(false)
										}}
										className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
										<svg className="mr-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
											<path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
											<path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
										</svg>
										Переименовать
									</button>
								)}
								
								{onDelete && (
									<button 
										onClick={(e) => {
											e.stopPropagation()
											if (onDelete) onDelete(desk.id)
											setShowMenu(false)
										}}
										className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center">
										<svg className="mr-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
											<path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
										</svg>
										Удалить
									</button>
								)}
							</div>
						</div>
					)}
				</div>
			</td>
			<td className='py-3 px-4'>
				<div className='flex items-center'>
					<div className='w-2 h-2 bg-green-500 rounded-full mr-2'></div>
					<span className='text-gray-700'>В работе</span>
				</div>
			</td>
			<td className='py-3 px-4 text-gray-700'>{formatDateRange()}</td>
			<td className='py-3 px-4'>
				<div className='flex items-center'>
					<span className='text-xs mr-1 bg-gray-200 text-gray-600 rounded px-1'>
						{getInitials(owner)}
					</span>
					<span className='text-gray-700'>{owner}</span>
				</div>
			</td>
		</tr>
	)
}
