import React from 'react'
import {format} from 'date-fns'
import {ru} from 'date-fns/locale'
import {DateRangeSelectorProps} from '../types'
import DatePicker from '../../../../../components/DatePicker/DatePicker'

interface ModifiedDateRangeSelectorProps extends Omit<DateRangeSelectorProps, 'onDateSave'> {
	onDateSave: (date: Date | null) => Promise<void> | void;
}

const DateRangeSelector: React.FC<ModifiedDateRangeSelectorProps> = ({
	deskId,
	deskName,
	deskDescription,
	deskCreateDate,
	deskFinishDate,
	selectedDate,
	isCalendarOpen,
	setIsCalendarOpen,
	onDateSave,
	calendarButtonRef,
	hasEditPermission = true // По умолчанию права есть
}) => {
	// Уникальный ID для календаря
	const calendarId = `desk-date-${deskId || 'main'}`;

	const formatShortDate = (date: string | Date | null | undefined) => {
		if (!date) return '';

		try {
			// Если date - строка, преобразуем в объект Date
			const dateObj = typeof date === 'string' ? new Date(date) : date;
			return format(dateObj, 'd MMM.', { locale: ru });
		} catch (error) {
			console.error('Ошибка форматирования даты:', error);
			return '';
		}
	};

	const getFormattedDateRange = () => {
		// Используем deskCreateDate как начальную дату
		const startDateStr = deskCreateDate ? formatShortDate(deskCreateDate) : '';

		// Используем deskFinishDate или selectedDate как конечную дату
		const finishDateStr = (selectedDate || deskFinishDate) ?
			formatShortDate(selectedDate || deskFinishDate) : '';

		if (startDateStr && finishDateStr) {
			return `${startDateStr} - ${finishDateStr}`;
		} else if (startDateStr) {
			return `${startDateStr} - не указано`;
		} else if (finishDateStr) {
			return `не указано - ${finishDateStr}`;
		} else {
			return 'Даты не выбраны';
		}
	};

	// Открытие/закрытие календаря - убеждаемся, что календарь не откроется для MEMBER
	const handleToggleCalendar = () => {
		// Проверяем права доступа и запрещаем MEMBER открывать календарь
		if (!hasEditPermission) {
			console.log('Нет прав на редактирование даты доски');
			return;
		}
		
		setIsCalendarOpen(!isCalendarOpen);
	};

	// Функция обновления даты
	const handleDateChange = async (_taskId: string, date: Date | null) => {
		if (!hasEditPermission) {
			setIsCalendarOpen(false);
			return;
		}

		let normalizedDate = null;
		if (date) {
			// Нормализация даты
			normalizedDate = new Date(date);
			normalizedDate.setHours(12, 0, 0, 0);
			const year = normalizedDate.getFullYear();
			const month = normalizedDate.getMonth();
			const day = normalizedDate.getDate();
			normalizedDate = new Date(year, month, day, 12, 0, 0, 0);
		}

		console.log(`[DateRangeSelector] Выбрана дата: ${normalizedDate}, вызываем onDateSave`);

		try {
			// Передаем ТОЛЬКО дату (Date | null)
			await onDateSave(normalizedDate);
			console.log('[DateRangeSelector] onDateSave успешно выполнен.');
		} catch (error) {
			console.error('[DateRangeSelector] Ошибка во время вызова onDateSave:', error);
		} finally {
			setIsCalendarOpen(false);
		}
	};

	// Обновляем getDateObject для обработки разных входных данных
	const getDateObject = (dateValue: any): Date | null => {
		if (!dateValue) return null;
		// Если это уже Date, возвращаем
		if (dateValue instanceof Date) return dateValue;
		// Если это объект { deskFinishDate: Date }, извлекаем значение
		if (typeof dateValue === 'object' && dateValue.deskFinishDate instanceof Date) {
			console.warn("[DateRangeSelector] Получен объект вместо даты в getDateObject, извлекаем значение.");
			return dateValue.deskFinishDate;
		}
		// Пытаемся распарсить строку
		if (typeof dateValue === 'string') {
			try {
				const dateObj = new Date(dateValue);
				if (!isNaN(dateObj.getTime())) return dateObj;
			} catch (e) { /* Игнорируем ошибку парсинга строки */ }
		}
		// Если ничего не подошло, логгируем и возвращаем null
		console.error('Невалидная дата в getDateObject:', dateValue);
		return null;
	};

	// Получаем дату для DatePicker (deskFinishDate может быть объектом из-за предыдущих ошибок)
	const currentDateForPicker = getDateObject(deskFinishDate);

	return (
		<>
			<button
				ref={calendarButtonRef}
				className={`flex items-center min-w-[180px] px-4 py-2 bg-gray-50 ${hasEditPermission ? 'hover:bg-gray-100 cursor-pointer' : 'cursor-default'} rounded-lg text-base transition-colors`}
				data-task-id={calendarId}
				onClick={handleToggleCalendar}
			>
				<svg
					className={`w-6 h-6 mr-3 flex-shrink-0 transition-colors`}
					style={isCalendarOpen ? { color: 'var(--theme-color)' } : {}}
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path d="M8 2V5" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
					<path d="M16 2V5" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
					<path d="M3.5 9.09H20.5" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
					<path d="M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
					<path d="M15.6947 13.7H15.7037" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
					<path d="M15.6947 16.7H15.7037" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
					<path d="M11.9955 13.7H12.0045" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
					<path d="M11.9955 16.7H12.0045" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
					<path d="M8.29431 13.7H8.30329" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
					<path d="M8.29431 16.7H8.30329" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
				</svg>
				<span className="text-sm font-medium">{getFormattedDateRange()}</span>
			</button>

			{isCalendarOpen && hasEditPermission && (
				<DatePicker
					taskId={calendarId}
					selectedDate={currentDateForPicker}
					onDateChange={handleDateChange}
					onClose={() => setIsCalendarOpen(false)}
				/>
			)}
		</>
	);
};

export default DateRangeSelector;