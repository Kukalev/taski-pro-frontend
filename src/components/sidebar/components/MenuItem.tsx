import {MenuItemProps} from '../types/sidebar.types'

export const MenuItem = ({  icon, label, isActive, onClick }: MenuItemProps) => {
	return (
		<button
			className={`w-full h-[36px] text-left px-4 py-1 rounded-md flex items-center gap-3 cursor-pointer text-[14px] transition-all duration-200 
            ${isActive ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
			onClick={onClick}>
			{icon}
			<span
				className={`transition-all duration-200 leading-none
                ${isActive ? 'text-gray-900 text-[16px]' : 'text-gray-700 text-[14px]'}`}>
				{label}
			</span>
		</button>
	)
}
