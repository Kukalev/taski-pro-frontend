import React, {useEffect, useRef, useState} from 'react'
import {DeskDatePickerProps} from './types'
import {addMonths, startOfMonth, subMonths} from 'date-fns'
import ReactDOM from 'react-dom'
import CalendarHeader from './components/CalendarHeader'
import WeekdaysHeader from './components/WeekdaysHeader'
import CalendarGrid from './components/CalendarGrid'
import CalendarFooter from './components/CalendarFooter'

const DeskDatePicker: React.FC<DeskDatePickerProps> = ({
	selectedDate,
	onDateChange,
	onClose,
	isVisible
}) => {
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const [currentMonth, setCurrentMonth] = useState(startOfMonth(selectedDate || today));
	const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0 });
	const [isCalendarVisible, setIsCalendarVisible] = useState(false);
	const calendarRef = useRef<HTMLDivElement>(null);

	const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

	// Находим кнопку с датой для позиционирования
	useEffect(() => {
		const findButtonAndPosition = () => {
			const dateButton = document.querySelector('[data-date-button="true"]');
			if (dateButton instanceof HTMLElement) {
				const rect = dateButton.getBoundingClientRect();
				setCalendarPosition({
					top: rect.bottom + 5,
					left: rect.left
				});

				// Показываем календарь только после установки позиции
				setTimeout(() => setIsCalendarVisible(true), 50);
				return true;
			}
			return false;
		};

		if (isVisible) {
			if (!findButtonAndPosition()) {
				const timer = setTimeout(findButtonAndPosition, 50);
				return () => clearTimeout(timer);
			}
		}
	}, [isVisible]);

	// Обработчик клика вне календаря
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			const dateButton = document.querySelector('[data-date-button="true"]');
			if (
				dateButton &&
				dateButton.contains(e.target as Node)
			) {
				return;
			}

			if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
				onClose();
			}
		};

		if (isVisible) {
			document.addEventListener('mousedown', handleClickOutside);
			return () => {
				document.removeEventListener('mousedown', handleClickOutside);
			};
		}
	}, [isVisible, onClose]);

	const prevMonth = () => {
		setCurrentMonth(subMonths(currentMonth, 1));
	};

	const nextMonth = () => {
		setCurrentMonth(addMonths(currentMonth, 1));
	};

	const handleSelectDate = (date: Date) => {
		onDateChange(date);
	};

	const handleClear = () => {
		onDateChange(null);
	};

	const handleSelectToday = () => {
		handleSelectDate(today);
	};

	if (!isVisible) return null;

	const calendarComponent = (
		<div
			ref={calendarRef}
			className={`bg-white rounded-lg shadow-xl p-4 z-[1000] transition-opacity duration-200 ${isCalendarVisible ? 'opacity-100' : 'opacity-0'}`}
			style={{
				position: 'fixed',
				top: `${calendarPosition.top}px`,
				left: `${calendarPosition.left}px`,
				width: '280px',
				border: '1px solid #e5e7eb',
				boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
			}}
			onClick={(e) => e.stopPropagation()}
		>
			<CalendarHeader
				currentMonth={currentMonth}
				prevMonth={prevMonth}
				nextMonth={nextMonth}
			/>

			<WeekdaysHeader daysOfWeek={daysOfWeek} />

			<CalendarGrid
				currentMonth={currentMonth}
				selectedDate={selectedDate}
				handleSelectDate={handleSelectDate}
			/>

			<CalendarFooter
				onClear={handleClear}
				onSelectToday={handleSelectToday}
			/>
		</div>
	);

	return ReactDOM.createPortal(calendarComponent, document.body);
};

export default DeskDatePicker;