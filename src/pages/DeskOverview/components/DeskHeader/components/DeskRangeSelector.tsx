import React from 'react'
import {format} from 'date-fns'
import {ru} from 'date-fns/locale'
import {DateRangeSelectorProps} from '../types'
import DatePicker from '../../../../../components/DatePicker/DatePicker'
import {DeskService} from '../../../../../services/desk/Desk'

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
	deskId,
	deskName,
	deskDescription,
	deskCreateDate,
	deskFinishDate,
	selectedDate,
	isCalendarOpen,
	setIsCalendarOpen,
	onDeskUpdate,
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
		// Проверяем права доступа
		if (!hasEditPermission || !deskId) {
			console.log('Нет прав на редактирование даты доски');
			setIsCalendarOpen(false);
			return;
		}

		try {
			// ВАЖНО: Исправляем проблему со смещением даты при конвертации в UTC
			let normalizedDate = null;
			if (date) {
				// Создаем новую дату, установив время на полдень, чтобы избежать проблем с часовыми поясами
				normalizedDate = new Date(date);
				normalizedDate.setHours(12, 0, 0, 0);
				
				// Также сохраняем год, месяц и день, чтобы перестраховаться
				const year = normalizedDate.getFullYear();
				const month = normalizedDate.getMonth();
				const day = normalizedDate.getDate();
				
				// Пересоздаем дату с правильными значениями
				normalizedDate = new Date(year, month, day, 12, 0, 0, 0);
				
				console.log('Выбранная дата:', date);
				console.log('Нормализованная дата:', normalizedDate);
				console.log('ISO строка:', normalizedDate.toISOString());
			}

			// Правильно соответствующий объект DeskUpdateDto
			const updateData = {
				deskName: deskName || '',
				deskDescription: deskDescription || '',
				deskFinishDate: normalizedDate // используем нормализованную дату
			};

			console.log('Отправляем данные:', JSON.stringify(updateData));

			// Обновляем доску через сервис
			const result = await DeskService.updateDesk(Number(deskId), updateData);
			console.log('Результат обновления:', result);

			// Обновляем локальное состояние с нормализованной датой
			onDeskUpdate({ deskFinishDate: normalizedDate });
			console.log('Дата обновлена успешно!');
		} catch (error: any) {
			console.error('ОШИБКА ПРИ ОБНОВЛЕНИИ ДАТЫ:', error);
			
			// Попробуем вытянуть детальное сообщение ошибки
			if (error.response) {
				console.error('Детали ошибки:', error.response.data);
				console.error('Статус:', error.response.status);
				console.error('Заголовки:', error.response.headers);
			}

			// В любом случае обновим стейт с нормализованной датой
			if (date) {
				const localDate = new Date(date);
				localDate.setHours(12, 0, 0, 0);
				onDeskUpdate({ deskFinishDate: localDate });
			} else {
				onDeskUpdate({ deskFinishDate: null });
			}
		}

		// Закрываем календарь после попытки обновления
		setIsCalendarOpen(false);
	};

	// Преобразуем selectedDate или deskFinishDate в объект Date для передачи в DatePicker
	const getDateObject = (dateValue: Date | string | null | undefined): Date | null => {
		if (!dateValue) return null;
		
		// Если уже объект Date - возвращаем как есть
		if (dateValue instanceof Date) return dateValue;
		
		try {
			// Пробуем преобразовать строку в Date
			const dateObj = new Date(dateValue);
			// Проверяем, что дата действительна
			if (isNaN(dateObj.getTime())) {
				console.error('Невалидная дата:', dateValue);
				return null;
			}
			return dateObj;
		} catch (e) {
			console.error('Ошибка преобразования даты:', e);
			return null;
		}
	};

	// Получаем дату для отображения в календаре
	const currentDate = getDateObject(selectedDate || deskFinishDate);

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

			{/* Рендерим DatePicker только если календарь открыт и у пользователя есть права */}
			{isCalendarOpen && hasEditPermission && (
				<DatePicker
					taskId={calendarId}
					selectedDate={currentDate}
					onDateChange={handleDateChange}
					onClose={() => setIsCalendarOpen(false)}
				/>
			)}
		</>
	);
};

export default DateRangeSelector;