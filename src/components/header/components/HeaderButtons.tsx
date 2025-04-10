import {HeaderButtonsProps} from '../types/header.types'

export const HeaderButtons = ({ onProClick }: HeaderButtonsProps) => {
	
	return (
		<div className='flex items-center'>
			<button
				onClick={onProClick} 
				className={`mr-2 rounded-lg text-white px-4 py-1.5 text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer`}
				style={{
					backgroundImage: 'linear-gradient(to right, var(--theme-gradient-from), var(--theme-gradient-to))',
				} as React.CSSProperties}
			>
				Получить «Pro»
			</button>


		</div>
	)
}
