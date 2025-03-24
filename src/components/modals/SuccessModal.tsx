import { FC, useEffect } from 'react'

interface SuccessModalProps {
	isOpen: boolean
	onClose: () => void
	message: string
	autoCloseTime?: number
}

export const SuccessModal: FC<SuccessModalProps> = ({ isOpen, onClose, message, autoCloseTime = 3000 }) => {
	useEffect(() => {
		if (isOpen) {
			const timer = setTimeout(() => {
				onClose()
			}, autoCloseTime)

			return () => clearTimeout(timer)
		}
	}, [isOpen, onClose, autoCloseTime])

	if (!isOpen) return null

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
			<div className='bg-white rounded-lg shadow-xl p-6 max-w-md w-full relative'>
				<button onClick={onClose} className='absolute top-2 right-2 text-gray-500 hover:text-gray-700'>
					&times;
				</button>

				<div className='flex items-center mb-4'>
					<div className='bg-green-100 p-2 rounded-full mr-4'>
						<svg className='w-6 h-6 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
							<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
						</svg>
					</div>
					<h3 className='text-lg font-medium text-gray-900'>Успешно!</h3>
				</div>

				<p className='text-gray-600 mb-5'>{message}</p>

				<button onClick={onClose} className='w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors'>
					Ок
				</button>
			</div>
		</div>
	)
}
