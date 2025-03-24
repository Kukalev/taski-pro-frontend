import { HeaderButtonsProps } from '../types/header.types'

export const HeaderButtons = ({ onProClick, onInviteClick }: HeaderButtonsProps) => {
	return (
		<div className='flex items-center'>
			{/* Кнопка Pro */}
			<button onClick={onProClick} className='mr-2 bg-gradient-to-r from-orange-400 to-yellow-300 rounded-lg text-white px-4 py-1.5 text-sm font-medium hover:opacity-90 transition-opacity'>
				Получить «Pro»
			</button>

			{/* Кнопка Пригласить команду */}
			<button onClick={onInviteClick} className='mr-4 bg-orange-100 text-orange-500 rounded-lg px-4 py-1.5 text-sm font-medium hover:bg-orange-200 transition-colors'>
				<div className='flex items-center'>
					<svg className='w-4 h-4 mr-1' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
						<path d='M12 4v16m8-8H4' />
					</svg>
					Пригласить команду
				</div>
			</button>
		</div>
	)
}
