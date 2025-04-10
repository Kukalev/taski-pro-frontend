import {useSidebar} from '../../../contexts/SidebarContext'
import {HeaderLogoProps} from '../types/header.types'
import {IconButton} from './IconButton'
import {Link} from 'react-router-dom'

export const HeaderLogo = ({ onToggleSidebar }: HeaderLogoProps) => {
	const { isCollapsed, isAnimating } = useSidebar()

	return (
		<div className='flex items-center'>
			<Link to="/desk" className='flex items-center mr-4'>
				<div className='w-7 h-7 bg-gradient-to-r from-blue-400 to-purple-400 rounded flex items-center justify-center mr-2'>
					<div className='grid grid-cols-2 gap-0.5'>
						<div className='w-1.5 h-1.5 bg-white rounded-sm'></div>
						<div className='w-1.5 h-1.5 bg-white rounded-sm'></div>
						<div className='w-1.5 h-1.5 bg-white rounded-sm'></div>
						<div className='w-1.5 h-1.5 bg-white rounded-sm'></div>
					</div>
				</div>
			</Link>

			<div className='flex items-center bg-gray-100 rounded-lg py-1 px-2 mr-2'>
				<div className='w-5 h-5 bg-indigo-100 text-indigo-500 rounded flex items-center justify-center mr-2'>
					<svg className='w-3 h-3' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='3'>
						<path d='M5 13l4 4L19 7' />
					</svg>
				</div>
				<span className='font-medium text-gray-800'>Задачи</span>
			</div>
			
			<IconButton
				icon={
					<svg className={`w-5 h-5 transition-transform duration-700 ease-in-out ${isCollapsed ? 'rotate-0' : 'rotate-180'}`} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
						{isCollapsed ? (
							<path d='M4 6h16M4 12h16M4 18h16' />
						) : (
							<path d='M4 6h10M4 12h10M4 18h10' />
						)}
					</svg>
				}
				onClick={onToggleSidebar}
				className={`cursor-pointer ${isCollapsed ? 'bg-blue-50 text-blue-600' : ''} ${isAnimating ? 'pointer-events-none' : ''}`}
			/>
		</div>
	)
}
