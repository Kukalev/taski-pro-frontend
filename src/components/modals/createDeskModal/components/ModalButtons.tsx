import { ModalButtonsProps } from '../types/createDeskModal.types'

export const ModalButtons = ({ onSubmit, isValid, isLoading }: ModalButtonsProps) => {
	return (
		<div className='flex justify-end px-6 pb-4'>
			<button
				onClick={onSubmit}
				disabled={!isValid || isLoading}
				className={`px-4 py-1.5 rounded-[6px] text-[14px] font-medium transition-all duration-200
                    ${!isValid || isLoading ? 'bg-gray-100 text-gray-400 cursor-default' : 'bg-blue-500 text-white hover:bg-blue-600'}`}>
				{isLoading ? 'Создание...' : 'Создать'}
			</button>
		</div>
	)
}
