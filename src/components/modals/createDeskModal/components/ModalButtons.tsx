import React from 'react'
import {ModalButtonsProps} from '../types/createDeskModal.types'

export const ModalButtons = ({ onSubmit, isValid, isLoading }: ModalButtonsProps) => {
	const activeStyle: React.CSSProperties = {
		backgroundColor: 'var(--theme-color)',
		color: 'white',
		cursor: 'pointer',
	};

	const hoverStyle: React.CSSProperties = {
		backgroundColor: 'var(--theme-color-dark)',
	};

	const disabledStyle: React.CSSProperties = {
		backgroundColor: '#f3f4f6',
		color: '#9ca3af',
		cursor: 'default',
	};

	return (
		<div className='flex justify-end px-6 pb-4'>
			<button
				onClick={onSubmit}
				disabled={!isValid || isLoading}
				className={`px-4 py-1.5 rounded-[6px] text-[14px] font-medium transition-all duration-200`}

				style={!isValid || isLoading ? disabledStyle : activeStyle}

				onMouseOver={(e) => { if (isValid && !isLoading) Object.assign(e.currentTarget.style, { ...activeStyle, ...hoverStyle }); }}
				onMouseOut={(e) => { if (isValid && !isLoading) Object.assign(e.currentTarget.style, activeStyle); }}
			>
				{isLoading ? 'Создание...' : 'Создать'}
			</button>
		</div>
	)
}
