import {MenuItemProps} from '../types/sidebar.types'

export const MenuItem = ({path, icon, label, isActive, onClick, isCollapsed}: MenuItemProps) => {
	const activeClass = isActive
		? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
		: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'

	return (
		<button
			type='button'
			onClick={onClick}
			className={`w-full flex items-center px-1 py-2 rounded-md text-[13px] font-medium transition-all duration-500 ease-in-out cursor-pointer ${activeClass}`}
			data-testid={`sidebar-menu-item-${path.replace(/\//g, '-')}`}
			title={isCollapsed ? label : ''}
		>
			<span className='flex-shrink-0 w-5 h-5 flex items-center justify-center'>
				{icon}
			</span>
			<span className='ml-4 whitespace-nowrap overflow-hidden transition-all duration-500 ease-in-out'
				style={{
					maxWidth: isCollapsed ? '0' : '200px',
					opacity: isCollapsed ? '0' : '1'
				}}
			>
				{label}
			</span>
		</button>
	)
}
