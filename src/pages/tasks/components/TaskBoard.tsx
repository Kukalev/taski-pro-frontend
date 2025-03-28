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

// Зарегистрируйте русскую локаль для календаря
registerLocale('ru', ru)

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
	const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0 });

	// Загрузка задач
	useEffect(() => {
		const loadTasks = async () => {
			if (!deskId) return;

			setLoading(true);
			try {
				const fetchedTasks = await getTasksByDeskId(deskId);
				setTasks(fetchedTasks || []);
				
				// Инициализируем даты из полученных задач
				const dateDictionary: Record<number, Date | null> = {};
				fetchedTasks.forEach(task => {
					if (task.taskId && task.taskFinishDate) {
						dateDictionary[task.taskId] = new Date(task.taskFinishDate);
					}
				});
				setSelectedDate(dateDictionary);
				
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

	// Исправленный обработчик выбора даты с camelCase именами полей
	const handleDateChange = async (taskId: number, date: Date | null) => {
		try {
			// Сохраняем дату в локальном состоянии
			setSelectedDate(prev => ({
				...prev,
				[taskId]: date
			}));
			
			// Отправляем запрос на обновление даты окончания в базе данных
			if (date) {
				// Java в Spring Boot обычно ожидает дату в формате ISO
				const isoDate = date.toISOString();
				
				// Используем taskFinishDate вместо finish_date
				await updateTask(deskId, taskId, {
					taskFinishDate: isoDate
				});
				
				// Обновляем задачу в локальном состоянии для отображения даты
				setTasks(prev => prev.map(t => 
					t.taskId === taskId ? {...t, taskFinishDate: isoDate} : t
				));
			} else {
				// Если дата null, очищаем taskFinishDate
				await updateTask(deskId, taskId, {
					taskFinishDate: null
				});
				
				// Обновляем задачу в локальном состоянии
				setTasks(prev => prev.map(t => 
					t.taskId === taskId ? {...t, taskFinishDate: null} : t
				));
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
												className={`bg-white pl-3 pb-3 min-h-[100px] cursor-pointer pt-2 rounded-lg border
												border-gray-200 hover:shadow-sm transition-shadow relative group task-card
												${datePickerTaskId === task.taskId ? 'active-calendar' : ''}`}
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
												<div className="text-sm">{task.taskName}</div>

												{/* Иконка пользователя */}
												<div className={`absolute bottom-1 left-3 mb-2 
													${datePickerTaskId === task.taskId ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} 
													transition-opacity duration-200`}>
													<PiUserCircleThin 
														className="text-gray-400 transition-colors duration-300 hover:text-orange-500 cursor-pointer" 
														style={{ width: '20px', height: '20px' }}
													/>
												</div>
												
												{/* Показываем либо дату, либо иконку календаря */}
												<div 
													className={`absolute bottom-1 right-12 mb-2
														${datePickerTaskId === task.taskId ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} 
														transition-opacity duration-200 cursor-pointer`}
													onMouseEnter={() => setHoveredCalendar(task.taskId)}
													onMouseLeave={() => setHoveredCalendar(null)}
													onClick={(e) => {
														e.stopPropagation();
														
														// Получаем координаты клика и иконки
														const iconRect = e.currentTarget.getBoundingClientRect();
														
														// Размеры календаря
														const calendarWidth = 300;
														const calendarHeight = 350;
														const windowHeight = window.innerHeight;
														
														let position;
														
														// Проверяем, близко ли к низу экрана
														if (iconRect.bottom + calendarHeight + 10 > windowHeight) {
															// Размещаем СВЕРХУ и РЯДОМ с иконкой (под углом)
															position = {
																top: iconRect.top - calendarHeight - 5, // Сверху с минимальным отступом
																left: iconRect.right - 40 // Сдвигаем календарь так, чтобы его правый нижний угол был близко к иконке
															};
														} else {
															// Размещаем СНИЗУ и РЯДОМ с иконкой (под углом)
															position = {
																top: iconRect.bottom + 5, // Снизу с минимальным отступом
																left: iconRect.right - 40 // Сдвигаем календарь так, чтобы его правый верхний угол был близко к иконке
															};
														}
														
														// Корректировка по границам экрана
														if (position.left < 10) {
															position.left = 10;
														}
														if (position.left + calendarWidth > window.innerWidth - 10) {
															position.left = window.innerWidth - calendarWidth - 10;
														}
														if (position.top < 10) {
															position.top = 10;
														}
														
														// Переключаем состояние
														if (datePickerTaskId === task.taskId) {
															setDatePickerTaskId(null);
														} else {
															setDatePickerTaskId(task.taskId);
															setCalendarPosition(position);
														}
													}}
												>
													{selectedDate[task.taskId!] ? (
														// Если дата выбрана, показываем её вместо иконки
														<div className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
															{formatShortDate(selectedDate[task.taskId!]!)}
														</div>
													) : (
														// Если дата не выбрана, показываем иконку календаря
														<IoCalendarNumberOutline 
															className={`transition-colors duration-300 ${
																datePickerTaskId === task.taskId || hoveredCalendar === task.taskId 
																	? 'text-yellow-400' 
																	: 'text-gray-400'
															}`} 
															size={16}
														/>
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
														<FaRegCircle className="text-gray-300" size={16} />
														
														<FaCheck 
															className={`absolute top-0 left-0 text-gray-400 transition-opacity duration-300
															${hoveredCheckCircle === task.taskId ? 'opacity-100' : 'opacity-0'}`}
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
					className="fixed inset-0 z-50"
					onClick={(e) => {
						// Закрываем при клике вне календаря
						if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
							setDatePickerTaskId(null);
						}
					}}
				>
					<div
						ref={calendarRef}
						style={{
							position: 'fixed',
							zIndex: 51,
							top: `${calendarPosition.top}px`,
							left: `${calendarPosition.left}px`,
							background: 'white',
							boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
							borderRadius: '8px'
						}}
						onClick={(e) => e.stopPropagation()}
					>
						<DatePicker
							selected={selectedDate[datePickerTaskId] || null}
							onChange={(date) => handleDateChange(datePickerTaskId, date)}
							locale="ru"
							inline
							dateFormat="dd.MM.yyyy"
							showMonthDropdown
							showYearDropdown
							dropdownMode="select"
							onClickOutside={() => setDatePickerTaskId(null)}
						/>
					</div>
				</div>,
				document.body
			)}
		</div>
	);
};