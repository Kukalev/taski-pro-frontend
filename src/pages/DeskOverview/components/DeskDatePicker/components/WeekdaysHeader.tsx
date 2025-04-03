import React from 'react'
import {WeekdaysHeaderProps} from '../types'

const WeekdaysHeader: React.FC<WeekdaysHeaderProps> = ({ daysOfWeek }) => {
	return (
		<div className="grid grid-cols-7 gap-1 mb-2">
			{daysOfWeek.map(day => (
				<div
					key={day}
					className="text-center text-xs text-gray-500 font-medium py-1"
				>
					{day}
				</div>
			))}
		</div>
	);
};

export default WeekdaysHeader;