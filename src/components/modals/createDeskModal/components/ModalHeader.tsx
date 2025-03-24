import { ModalHeaderProps } from '../types/createDeskModal.types'

export const ModalHeader = ({ title, onClose }: ModalHeaderProps) => {
	return (
		<div className='flex justify-between items-center px-6 py-4 border-b border-gray-200'>
			<h2 className='text-[18px] font-medium text-gray-800'>{title}</h2>
			<button onClick={onClose} className='text-gray-400 hover:text-gray-600 transition-colors duration-200 cursor-pointer'>
				<svg className='w-3 h-3' viewBox='0 0 14 14' fill='none'>
					<path d='M13 1L1 13M1 1L13 13' stroke='currentColor' strokeWidth='2' strokeLinecap='round' />
				</svg>
			</button>
		</div>
	)
}
