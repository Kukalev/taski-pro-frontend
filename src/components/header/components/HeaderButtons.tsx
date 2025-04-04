import {HeaderButtonsProps} from '../types/header.types'
// getGradient больше не нужен

export const HeaderButtons = ({ onProClick, onInviteClick }: HeaderButtonsProps) => {
	
	return (
		<div className='flex items-center'>
			{/* Кнопка Pro - применяем градиент напрямую через CSS переменные */}
			<button 
				onClick={onProClick} 
				// Убираем Tailwind градиент классы (bg-gradient-to-r и ${gradient})
				className={`mr-2 rounded-lg text-white px-4 py-1.5 text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer`}
				style={{
					// Устанавливаем фон как линейный градиент с нашими переменными
					// Браузер сам подставит актуальные значения --theme-gradient-from и --theme-gradient-to
					backgroundImage: 'linear-gradient(to right, var(--theme-gradient-from), var(--theme-gradient-to))',
				} as React.CSSProperties} // Указываем тип для TypeScript
			>
				Получить «Pro»
			</button>

			{/* Здесь может быть кнопка Invite, если она нужна */}
			{/* <button onClick={onInviteClick} ...>Invite</button> */}
		</div>
	)
}
