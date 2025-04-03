import React from 'react'
import {CalendarFooterProps} from '../types'

const CalendarFooter: React.FC<CalendarFooterProps> = ({ onClear, onSelectToday }) => {
	return (
		<div className="mt-4 border-t pt-3 flex justify-between">
			<button
				className="text-xs text-gray-500 hover:text-gray-700"
				onClick={onClear}
			>
				Очистить
			</button>
			<button
				className="text-xs text-blue-500 font-medium hover:text-blue-600"
				onClick={onSelectToday}
			>
				Сегодня
			</button>
		</div>
	);
};

export default CalendarFooter;