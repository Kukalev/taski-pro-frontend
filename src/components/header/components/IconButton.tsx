import { IconButtonProps } from '../types/header.types'

export const IconButton = ({ icon, onClick }: IconButtonProps) => {
	return (
		<button onClick={onClick} className='w-9 h-9 rounded-full text-gray-500 hover:bg-gray-100 flex items-center justify-center'>
			{icon}
		</button>
	)
}
