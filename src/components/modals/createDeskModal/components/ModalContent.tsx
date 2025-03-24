import { ModalContentProps } from '../types/createDeskModal.types'

export const ModalContent = ({ deskName, deskDescription, setDeskName, setDeskDescription, error }: ModalContentProps) => {
	return (
		<div className='px-6 py-3'>
			{error && <div className='mb-4 p-3 bg-red-100 text-red-700 rounded-lg'>{error}</div>}

			<div className='mb-4'>
				<label className='block text-[15px] text-gray-900 font-medium mb-2'>Название доски</label>
				<input
					type='text'
					value={deskName}
					onChange={e => setDeskName(e.target.value)}
					placeholder='Введите название'
					className='w-full px-3 py-2 bg-gray-50 rounded-[6px] text-[14px] placeholder-gray-400
                              focus:bg-gray-200 focus:outline-none focus:border-none transition-all duration-250 hover:bg-gray-200'
				/>
			</div>

			<div className='mb-4'>
				<label className='block text-[15px] text-gray-900 font-medium mb-2'>Описание</label>
				<input
					type='text'
					value={deskDescription}
					onChange={e => setDeskDescription(e.target.value)}
					placeholder='Введите описание'
					className='w-full px-3 py-2 bg-gray-50 rounded-[6px] text-[14px] placeholder-gray-400
                              focus:bg-gray-200 focus:outline-none focus:border-none transition-all duration-250 hover:bg-gray-200'
				/>
			</div>
		</div>
	)
}
