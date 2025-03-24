import { SidebarMenuProps } from '../types/sidebar.types'
import { MenuItem } from './MenuItem'

export const SidebarMenu = ({ location, onItemClick }: SidebarMenuProps) => {
	const isAllDesksActive = () => {
		return location.pathname === '/desk' || location.pathname === '/desk/'
	}

	return (
		<nav className='mb-4'>
			<ul className='space-y-1'>
				<li>
					<MenuItem
						path='/desk/myTasks'
						isActive={location.pathname === '/desk/myTasks'}
						onClick={() => onItemClick('/desk/myTasks')}
						icon={
							<svg width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
								<path d='M12 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V12M9 15L20 4' />
							</svg>
						}
						label='Мои задачи'
					/>
				</li>
				<li>
					<MenuItem
						path='/desk/allTasks'
						isActive={location.pathname === '/desk/allTasks'}
						onClick={() => onItemClick('/desk/allTasks')}
						icon={
							<svg width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
								<path d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' />
							</svg>
						}
						label='Все задачи'
					/>
				</li>
				<li>
					<MenuItem
						path='/desk'
						isActive={isAllDesksActive()}
						onClick={() => onItemClick('/desk')}
						icon={
							<svg width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
								<path d='M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' />
							</svg>
						}
						label='Все доски'
					/>
				</li>
			</ul>
		</nav>
	)
}
