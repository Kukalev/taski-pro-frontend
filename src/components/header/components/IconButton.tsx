import { IconButtonProps } from '../types/header.types'

export const IconButton = ({ icon, onClick, className = '' }: IconButtonProps) => {
	return (
		<button
			type='button'
			className={`w-8 h-8 rounded-md flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors focus:outline-none ${className}`}
			onClick={onClick}
		>
			{icon}
		</button>
	)
}
