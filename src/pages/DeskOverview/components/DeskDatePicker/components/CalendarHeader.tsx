import React from 'react'
import {format} from 'date-fns'
import {ru} from 'date-fns/locale'
import {CalendarHeaderProps} from '../types'

const CalendarHeader: React.FC<CalendarHeaderProps> = ({ currentMonth, prevMonth, nextMonth }) => {
	return (
		<div className="flex justify-between items-center mb-4">
			<button
				className="p-1 hover:bg-gray-100 rounded text-gray-500"
				onClick={prevMonth}
			>
				←
			</button>
			<div className="font-semibold">
				{format(currentMonth, 'LLLL yyyy', { locale: ru })}
			</div>
			<button
				className="p-1 hover:bg-gray-100 rounded text-gray-500"
				onClick={nextMonth}
			>
				→
			</button>
		</div>
	);
};

export default CalendarHeader;