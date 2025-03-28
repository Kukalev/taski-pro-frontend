import React, {useEffect, useState, useRef} from 'react'
import {createTask, getTasksByDeskId, updateTask} from '../../../services/task/Task'
import {Task} from '../../../services/task/types/task.types'
import {PiUserCircleThin} from 'react-icons/pi'
import {FaRegCircle, FaCheck} from 'react-icons/fa'
import { IoCalendarNumberOutline } from "react-icons/io5"
import dayjs from 'dayjs'
import 'dayjs/locale/ru' // Подключаем русскую локаль для dayjs
import format from 'date-fns/format'
import ru from 'date-fns/locale/ru'
import ReactDOM from 'react-dom'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { registerLocale } from 'react-datepicker'

// Устанавливаем русскую локаль по умолчанию для dayjs
dayjs.locale('ru')

// Типы статусов
enum StatusType {
	BACKLOG = 'BACKLOG',
	INWORK = 'INWORK',
	REVIEW = 'REVIEW',
	TESTING = 'TESTING',
	COMPLETED = 'COMPLETED'
}

// Статусы для колонок
const STATUSES = [
	{ id: 1, title: 'К выполнению',  type: StatusType.BACKLOG },
	{ id: 2, title: 'В работе',  type: StatusType.INWORK },
	{ id: 3, title: 'На рассмотрении',  type: StatusType.REVIEW },
	{ id: 4, title: 'Тестирование',  type: StatusType.TESTING },
	{ id: 5, title: 'Завершено',  type: StatusType.COMPLETED },
];

interface TaskBoardProps {
	deskId: number;
}

export const TaskBoard: React.FC<TaskBoardProps> = ({ deskId }) => {
	const [addingInColumn, setAddingInColumn] = useState<number | null>(null);
	const [newTaskTexts, setNewTaskTexts] = useState<Record<number, string>>({});
	const [tasks, setTasks] = useState<Task[]>([]);
	const [loading, setLoading] = useState(true);
	const [hoveredCheckCircle, setHoveredCheckCircle] = useState<number | null>(null);
	const [hoveredCalendar, setHoveredCalendar] = useState<number | null>(null);
	const [draggedTask, setDraggedTask] = useState<Task | null>(null);
	const [dropTarget, setDropTarget] = useState<{statusType: string, index: number} | null>(null);
	const [datePickerTaskId, setDatePickerTaskId] = useState<number | null>(null);
	const [selectedDate, setSelectedDate] = useState<Record<number, Date | null>>({});
	const calendarRef = useRef<HTMLDivElement>(null);

	// Загрузка задач
	useEffect(() => {
		const loadTasks = async () => {
			if (!deskId) return;

			setLoading(true);
			try {
				const fetchedTasks = await getTasksByDeskId(deskId);
				setTasks(fetchedTasks || []);
			} catch (error) {
				console.error('Ошибка при загрузке задач:', error);
			} finally {
				setLoading(false);
			}
		};

		loadTasks();
	}, [deskId]);

	// Обработчик клика вне календаря
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
				setDatePickerTaskId(null);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	// Создаем портал для календаря, чтобы он рендерился вне родительских контейнеров
	useEffect(() => {
		if (datePickerTaskId !== null) {
			// Предотвращаем прокрутку при открытом календаре
			document.body.style.overflow = 'hidden';
			return () => {
				document.body.style.overflow = '';
			};
		}
	}, [datePickerTaskId]);

	// Функции для работы с задачами
	const handleInputChange = (columnId: number, text: string) => {
		setNewTaskTexts(prev => ({
			...prev,
			[columnId]: text
		}));
	};

	const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>, status: typeof STATUSES[0]) => {
		const taskText = newTaskTexts[status.id] || '';
		
		if (e.key === 'Enter' && taskText.trim()) {
			try {
				const newTask = await createTask(deskId, taskText.trim(), status.type);
				setTasks(prev => [...prev, newTask]);
				setNewTaskTexts(prev => ({
					...prev,
					[status.id]: ''
				}));
				setAddingInColumn(null);
			} catch (error) {
				console.error('Ошибка при создании задачи:', error);
			}
		} else if (e.key === 'Escape') {
			setNewTaskTexts(prev => ({
				...prev,
				[status.id]: ''
			}));
			setAddingInColumn(null);
		}
	};

	// Функции для drag and drop
	const handleDragStart = (e: React.DragEvent, task: Task) => {
		e.dataTransfer.setData('text/plain', JSON.stringify(task));
		setDraggedTask(task);
		
		// Для визуального эффекта при перетаскивании
		if (e.currentTarget instanceof HTMLElement) {
			setTimeout(() => {
				e.currentTarget.style.opacity = '0.4';
			}, 0);
		}
	};

	const handleDragEnd = (e: React.DragEvent) => {
		setDraggedTask(null);
		setDropTarget(null);
		
		// Возвращаем нормальный вид элементу
		if (e.currentTarget instanceof HTMLElement) {
			e.currentTarget.style.opacity = '1';
		}
	};

	const handleDragOver = (e: React.DragEvent, statusType: string, index: number) => {
		e.preventDefault();
		if (!draggedTask) return;
		
		// Обновляем целевую позицию
		setDropTarget({ statusType, index });
	};

	const handleDrop = async (e: React.DragEvent, targetStatusType: string, targetIndex: number) => {
		e.preventDefault();
		if (!draggedTask) return;
		
		try {
			// Получаем задачи в целевом статусе
			const statusTasks = tasks.filter(t => t.statusType === targetStatusType);
			
			// Если перетаскиваем в тот же статус, просто меняем порядок
			if (draggedTask.statusType === targetStatusType) {
				// Находим текущий индекс задачи в этом статусе
				const currentIndex = statusTasks.findIndex(t => t.taskId === draggedTask.taskId);
				if (currentIndex === targetIndex) return; // Если позиция не изменилась, не делаем ничего
				
				// Обновляем заказ только если он изменился
				// Здесь мы бы отправили запрос на обновление порядка
				// Но так как у нас нет поля для порядка, мы просто обновим UI
			} 
			// Если перетаскиваем в другой статус, меняем статус
			else {
				// Обновляем задачу на сервере
				const updatedTask = await updateTask(deskId, draggedTask.taskId!, { 
					statusType: targetStatusType 
				});
				
				// Обновляем задачу в локальном состоянии
				setTasks(prev => prev.map(t => 
					t.taskId === draggedTask.taskId ? updatedTask : t
				));
			}
		} catch (error) {
			console.error('Ошибка при перемещении задачи:', error);
		}
	};
	
	// Обработчик завершения задачи (клик на кружок с галочкой)
	const handleCompleteTask = async (taskId: number) => {
		try {
			const taskToUpdate = tasks.find(t => t.taskId === taskId);
			if (!taskToUpdate) return;
			
			// Если задача не в статусе COMPLETED, меняем на COMPLETED
			if (taskToUpdate.statusType !== StatusType.COMPLETED) {
				const updatedTask = await updateTask(deskId, taskId, { 
					statusType: StatusType.COMPLETED 
				});
				
				setTasks(prev => prev.map(t => 
					t.taskId === taskId ? updatedTask : t
				));
			}
		} catch (error) {
			console.error('Ошибка при завершении задачи:', error);
		}
	};
	
	// Получение задач по статусу
	const getTasksByStatus = (statusType: string) => {
		return tasks.filter(task => task.statusType === statusType);
	};

	// Новая функция для определения позиции вставки относительно центра задачи
	const handleTaskDragOver = (e: React.DragEvent, statusType: string, tasks: Task[]) => {
		e.preventDefault();
		if (!draggedTask) return;
		
		const column = e.currentTarget;
		const columnRect = column.getBoundingClientRect();
		const mouseY = e.clientY - columnRect.top;
		
		// Если мышь находится в верхней части колонки (первые 50px), 
		// вставляем в начало
		if (mouseY < 50) {
			setDropTarget({ statusType, index: 0 });
			return;
		}
		
		// Находим все карточки задач в этой колонке
		const taskCards = Array.from(column.querySelectorAll('.task-card'));
		
		// Если карточек нет, вставляем в начало
		if (taskCards.length === 0) {
			setDropTarget({ statusType, index: 0 });
			return;
		}
		
		// Проходим по всем карточкам и определяем, после какой карточки вставить
		for (let i = 0; i < taskCards.length; i++) {
			const card = taskCards[i];
			const cardRect = card.getBoundingClientRect();
			const cardMiddle = cardRect.top + cardRect.height / 2 - columnRect.top;
			
			// Если центр перетаскиваемой задачи (курсор) выше середины текущей карточки,
			// вставляем перед ней
			if (mouseY < cardMiddle) {
				setDropTarget({ statusType, index: i });
				return;
			}
		}
		
		// Если дошли до конца списка, вставляем в конец
		setDropTarget({ statusType, index: tasks.length });
	};

	// Обработчик выбора даты через Ant Design DatePicker
	const handleDateChange = async (taskId: number, date: dayjs.Dayjs | null) => {
		try {
			const jsDate = date ? date.toDate() : null;
			
			// Сохраняем дату в состоянии
			setSelectedDate(prev => ({
				...prev,
				[taskId]: jsDate
			}));
			
			// Отправляем запрос на обновление даты окончания
			if (jsDate) {
				await updateTask(deskId, taskId, {
					finish_date: jsDate.toISOString()
				});
			} else {
				// Если дата null, устанавливаем пустую дату
				await updateTask(deskId, taskId, {
					finish_date: null
				});
			}
			
			// Закрываем календарь
			setDatePickerTaskId(null);
		} catch (error) {
			console.error('Ошибка при обновлении даты окончания:', error);
		}
	};

	// Форматирование даты для отображения в карточке (только день и месяц)
	const formatShortDate = (date: Date) => {
		return format(date, 'd MMM.', { locale: ru });
	};

	const renderCalendar = (taskId: number) => {
		const currentDate = selectedDate[taskId] || new Date();
		const month = currentDate.getMonth();
		const year = currentDate.getFullYear();
		
		// Определяем первый день месяца и количество дней
		const firstDayOfMonth = new Date(year, month, 1);
		const lastDayOfMonth = new Date(year, month + 1, 0);
		const daysInMonth = lastDayOfMonth.getDate();
		
		// Определяем день недели первого дня месяца (0-воскресенье, 1-понедельник и т.д.)
		let firstDayWeekday = firstDayOfMonth.getDay(); // 0 - воскресенье
		if (firstDayWeekday === 0) firstDayWeekday = 7; // Переводим в формат 1-7 (пн-вс)
		
		// Дни для предыдущего месяца
		const daysFromPrevMonth = firstDayWeekday - 1;
		const prevMonth = month === 0 ? 11 : month - 1;
		const prevMonthYear = month === 0 ? year - 1 : year;
		const daysInPrevMonth = new Date(prevMonthYear, prevMonth + 1, 0).getDate();
		
		// Создаем массив для календарной сетки
		const calendarDays = [];
		
		// Добавляем дни из предыдущего месяца
		for (let i = daysInPrevMonth - daysFromPrevMonth + 1; i <= daysInPrevMonth; i++) {
			calendarDays.push({
				day: i,
				month: prevMonth,
				year: prevMonthYear,
				isCurrentMonth: false
			});
		}
		
		// Добавляем дни текущего месяца
		for (let i = 1; i <= daysInMonth; i++) {
			calendarDays.push({
				day: i,
				month: month,
				year: year,
				isCurrentMonth: true
			});
		}
		
		// Добавляем дни следующего месяца до заполнения сетки (максимум 6 строк по 7 дней)
		const nextMonth = month === 11 ? 0 : month + 1;
		const nextMonthYear = month === 11 ? year + 1 : year;
		const totalCells = 42; // 6 строк по 7 дней
		
		for (let i = 1; calendarDays.length < totalCells; i++) {
			calendarDays.push({
				day: i,
				month: nextMonth,
				year: nextMonthYear,
				isCurrentMonth: false
			});
		}
		
		const today = new Date();
		
		return (
			<div 
				ref={calendarRef}
				className="absolute bottom-10 right-0 bg-white rounded-lg shadow-lg p-4 z-20 w-64"
			>
				<div className="flex justify-between items-center mb-4">
					<span className="text-sm font-medium">
						{format(new Date(year, month), 'LLLL yyyy', { locale: ru })}
					</span>
					<div className="flex space-x-2">
						<button 
							className="text-gray-500 hover:text-gray-700 px-2"
							onClick={() => {
								const newDate = new Date(year, month - 1, 1);
								setSelectedDate(prev => ({
									...prev,
									[taskId]: newDate
								}));
							}}
						>
							&lt;
						</button>
						<button 
							className="text-gray-500 hover:text-gray-700 px-2"
							onClick={() => {
								const newDate = new Date(year, month + 1, 1);
								setSelectedDate(prev => ({
									...prev,
									[taskId]: newDate
								}));
							}}
						>
							&gt;
						</button>
					</div>
				</div>
				
				<div className="grid grid-cols-7 gap-1 mb-2">
					{['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'].map(day => (
						<div key={day} className="text-center text-xs text-gray-500">
							{day}
						</div>
					))}
				</div>
				
				<div className="grid grid-cols-7 gap-1">
					{calendarDays.map((dateInfo, index) => {
						const date = new Date(dateInfo.year, dateInfo.month, dateInfo.day);
						
						const isSelected = selectedDate[taskId] && 
							selectedDate[taskId]!.getDate() === dateInfo.day &&
							selectedDate[taskId]!.getMonth() === dateInfo.month &&
							selectedDate[taskId]!.getFullYear() === dateInfo.year;
						
						const isToday = 
							today.getDate() === dateInfo.day &&
							today.getMonth() === dateInfo.month &&
							today.getFullYear() === dateInfo.year;
						
						return (
							<button
								key={index}
								className={`
									text-center py-1 text-sm rounded 
									${dateInfo.isCurrentMonth ? 'text-gray-700' : 'text-gray-400'} 
									${isSelected ? 'bg-orange-400 text-white' : ''} 
									${isToday && !isSelected ? 'bg-gray-200' : ''}
									hover:bg-gray-200 ${isSelected ? 'hover:bg-orange-500' : ''}
								`}
								onClick={() => handleDateChange(taskId, dateInfo.day)}
							>
								{dateInfo.day}
							</button>
						);
					})}
				</div>
				
				<div className="mt-4 flex justify-between items-center">
					<button 
						className="text-xs text-gray-500 hover:text-gray-700"
						onClick={() => {
							setSelectedDate(prev => ({
								...prev,
								[taskId]: null
							}));
							handleDateChange(taskId, null); // Отправляем null
						}}
					>
						Очистить всё
					</button>
				</div>
			</div>
		);
	};

	return (
		<div className="flex-1 p-4 overflow-x-auto h-full">
			{loading ? (
				<div className="flex justify-center items-center h-64">
					<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
				</div>
			) : (
				<div className="flex space-x-4 h-full">
					{STATUSES.map(status => {
						const statusTasks = getTasksByStatus(status.type);
						const currentText = newTaskTexts[status.id] || '';

						return (
							<div 
								key={status.id} 
								className="w-[15%] min-w-[250px] flex flex-col h-[calc(100vh-80px)]"
							>
								<div className="mb-2 rounded-lg bg-white py-2">
									<h3 className="text-sm font-medium text-gray-700 ml-3">{status.title}</h3>
								</div>

								<div className="relative mb-2">
									<input
										type="text"
										className="w-full p-3 rounded-lg bg-white text-[12px]
										text-gray-150 transition-all duration-200 ease-in-out
										hover:text-gray-300 focus:text-gray-700 focus:bg-gray-100
										focus:outline-none border border-transparent focus:border-gray-100"
										placeholder="Добавить задачу..."
										value={currentText}
										onChange={(e) => handleInputChange(status.id, e.target.value)}
										onKeyDown={(e) => handleKeyDown(e, status)}
										autoFocus={addingInColumn === status.id}
									/>
								</div>

								<div 
									className="space-y-2 flex-1 overflow-y-auto max-h-full pr-1 
									scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent relative"
									onDragOver={(e) => handleTaskDragOver(e, status.type, statusTasks)}
									onDrop={(e) => {
										e.preventDefault();
										if (!draggedTask || !dropTarget) return;
										
										if (dropTarget.statusType === status.type) {
											handleDrop(e, status.type, dropTarget.index);
										}
									}}
								>
									{/* Индикатор вставки в начало (абсолютное позиционирование) */}
									{draggedTask && (
										<div 
											className={`absolute top-0 left-0 right-1 h-1 z-10 ${
												dropTarget?.statusType === status.type && dropTarget?.index === 0 
													? 'bg-orange-400'
													: 'bg-transparent'
											}`}
										/>
									)}
									
									{statusTasks.map((task, index) => (
										<div key={task.taskId} className="relative">
											<div
												className="bg-white pl-3 pb-3 min-h-[100px] cursor-pointer pt-2 rounded-lg border
												border-gray-200 hover:shadow-sm transition-shadow relative group task-card"
												draggable
												onDragStart={(e) => {
													e.dataTransfer.setData('text/plain', JSON.stringify(task));
													setDraggedTask(task);
												}}
												onDragEnd={() => {
													setDraggedTask(null);
													setDropTarget(null);
												}}
											>
												{task.taskId && (
													<div className="text-[10px] text-gray-400 mt-0 inline-flex">
														<span className="bg-gray-200 inline-flex justify-center items-center
														min-w-[20px] h-5 px-1 rounded">
															#{task.taskId}
														</span>
													</div>
												)}
												<div className={`text-sm ${task.statusType === StatusType.COMPLETED ? 'line-through text-gray-400' : ''}`}>
													{task.taskName}
												</div>

												{/* Блок с датой окончания - виден всегда, если дата выбрана */}
												<div className="flex justify-end mt-2">
													{selectedDate[task.taskId!] && (
														<div className="text-xs text-gray-500">
															{formatShortDate(selectedDate[task.taskId!]!)}
														</div>
													)}
												</div>

												{/* Иконка пользователя */}
												<div className="absolute bottom-1 left-3 mb-2 opacity-0 group-hover:opacity-100 
												transition-opacity duration-200">
													<PiUserCircleThin 
														className="text-gray-400 transition-colors duration-300 hover:text-orange-500 cursor-pointer" 
														style={{ width: '20px', height: '20px' }}
													/>
												</div>
												
												{/* Иконка календаря */}
												<div 
													className="absolute bottom-1 right-8 mb-2 opacity-0 group-hover:opacity-100 
													transition-opacity duration-200 cursor-pointer"
													onMouseEnter={() => setHoveredCalendar(task.taskId)}
													onMouseLeave={() => setHoveredCalendar(null)}
													onClick={() => setDatePickerTaskId(datePickerTaskId === task.taskId ? null : task.taskId)}
												>
													<IoCalendarNumberOutline 
														className={`transition-colors duration-300 ${
															hoveredCalendar === task.taskId 
																? 'text-yellow-400' 
																: 'text-gray-400'
														}`} 
														size={16}
													/>
													
													{/* Ant Design DatePicker */}
													{datePickerTaskId === task.taskId && (
														<div 
															style={{ position: 'absolute', right: 0, bottom: '25px', zIndex: 1000 }}
															onClick={(e) => e.stopPropagation()}
														>
															<DatePicker
																open={true}
																className="ant-picker-dropdown"
																style={{ boxShadow: '0 3px 6px rgba(0,0,0,0.16)' }}
																defaultValue={selectedDate[task.taskId!] ? dayjs(selectedDate[task.taskId!]) : null}
																onChange={(date) => handleDateChange(task.taskId!, date)}
																onOpenChange={(open) => {
																	if (!open) setDatePickerTaskId(null);
																}}
															/>
														</div>
													)}
												</div>
												
												{/* Круг с галочкой */}
												<div 
													className="absolute bottom-1 right-3 mb-2 cursor-pointer"
													onMouseEnter={() => setHoveredCheckCircle(task.taskId!)}
													onMouseLeave={() => setHoveredCheckCircle(null)}
													onClick={() => handleCompleteTask(task.taskId!)}
												>
													<div className="relative">
														<FaRegCircle 
															className={task.statusType === StatusType.COMPLETED ? "text-green-200" : "text-gray-300"} 
															size={16} 
														/>
														
														<FaCheck 
															className={`absolute top-0 left-0 transition-all duration-300
																${task.statusType === StatusType.COMPLETED 
																	? 'text-green-500 opacity-100' // Всегда видно для завершенных задач
																	: hoveredCheckCircle === task.taskId 
																		? 'text-gray-400 opacity-100' // Видно при наведении для незавершенных
																		: 'text-gray-400 opacity-0'   // Скрыто для незавершенных
																}`}
															size={10} 
															style={{ transform: 'translate(3px, 3px)' }}
														/>
													</div>
												</div>
											</div>
											
											{/* Индикатор вставки после текущей задачи (абсолютное позиционирование) */}
											{draggedTask && (
												<div 
													className={`absolute bottom-[-4px] left-0 right-1 h-1 z-10 ${
														dropTarget?.statusType === status.type && dropTarget?.index === index + 1
															? 'bg-orange-400'
															: 'bg-transparent'
													}`}
												/>
											)}
										</div>
									))}
								</div>
							</div>
						);
					})}
				</div>
			)}

			{/* Рендерим календарь через портал в body */}
			{datePickerTaskId !== null && ReactDOM.createPortal(
				<div 
					className="fixed inset-0 z-50 bg-transparent"
					onClick={(e) => {
						// Закрываем при клике вне календаря
						if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
							setDatePickerTaskId(null);
						}
					}}
				>
					<div
						ref={calendarRef}
						className="absolute bg-white rounded-lg shadow-lg p-4"
						style={{
							width: '300px',
							position: 'fixed',
							zIndex: 51,
							// Позиционируем относительно кнопки календаря
							// Эти координаты нужно будет рассчитать динамически
							bottom: '150px',
							right: '100px',
						}}
					>
						{/* ... содержимое календаря ... */}
					</div>
				</div>,
				document.body
			)}
		</div>
	);
};