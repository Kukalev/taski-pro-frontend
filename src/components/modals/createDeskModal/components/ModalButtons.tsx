import React from 'react';
import { ModalButtonsProps } from '../types/createDeskModal.types'

export const ModalButtons = ({ onSubmit, isValid, isLoading }: ModalButtonsProps) => {
	// Определяем стили для кнопки с использованием CSS переменных
	const activeStyle: React.CSSProperties = {
		backgroundColor: 'var(--theme-color)',
		color: 'white', // Убедимся, что текст белый
		cursor: 'pointer', // <--- Добавляем курсор
	};

	const hoverStyle: React.CSSProperties = {
		backgroundColor: 'var(--theme-color-dark)',
	};

	const disabledStyle: React.CSSProperties = {
		backgroundColor: '#f3f4f6', // Серый фон для неактивной кнопки (из Tailwind bg-gray-100)
		color: '#9ca3af', // Серый текст для неактивной кнопки (из Tailwind text-gray-400)
		cursor: 'default', // <--- Курсор по умолчанию для неактивной кнопки
	};

	return (
		<div className='flex justify-end px-6 pb-4'>
			<button
				onClick={onSubmit}
				disabled={!isValid || isLoading}
				className={`px-4 py-1.5 rounded-[6px] text-[14px] font-medium transition-all duration-200`}
				// Применяем стили динамически
				style={!isValid || isLoading ? disabledStyle : activeStyle}
				// Динамически добавляем/убираем стиль при наведении, только если кнопка активна
				onMouseOver={(e) => { if (isValid && !isLoading) Object.assign(e.currentTarget.style, { ...activeStyle, ...hoverStyle }); }} // Применяем hover поверх active
				onMouseOut={(e) => { if (isValid && !isLoading) Object.assign(e.currentTarget.style, activeStyle); }} // Возвращаем active стиль
			>
				{isLoading ? 'Создание...' : 'Создать'}
			</button>
		</div>
	)
}
