import {useState} from 'react'

interface Task {
	id: string
	title: string
	project?: string
	board?: string
	status?: string
	assignee?: string
	completed: boolean
	dueDate: Date
	comments?: number
	daysLeft?: number
}

export const AllTasks = () => {
	// Текущая неделя и её расчет
	const today = new Date()
	const startOfWeek = new Date(today)
	startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)) // Начинаем с понедельника

	const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek)
	const [draggedTask, setDraggedTask] = useState<Task | null>(null)
	const [tasks, setTasks] = useState<Task[]>([
		// Пятница
		{id: '#25', title: 'ФыВ', completed: false, assignee: 'АА', dueDate: new Date(2023, 2, 21)},
		{id: '#22', title: 'ФыФФыВ', completed: false, assignee: 'АА', dueDate: new Date(2023, 2, 21)},
		{id: '#21', title: 'ФыФФыВ', completed: false, assignee: 'АА', dueDate: new Date(2023, 2, 21)},
		{
			id: '#3',
			title: 'Пригласи команду',
			completed: false,
			assignee: 'АА',
			dueDate: new Date(2023, 2, 21),
			project: 'Проект',
			comments: 1,
			daysLeft: 1
		},
		{
			id: '#1',
			title: 'Это главная задача. Если выполнишь, поздравим с тем, то успешно начнешь работу в WEEEK',
			completed: true,
			assignee: 'АА',
			dueDate: new Date(2023, 2, 21),
			project: 'Проект',
			board: 'Доска в проекте',
			daysLeft: 1
		},

		// Суббота
		{
			id: '#24',
			title: 'ФыФФ',
			completed: false,
			assignee: 'АА',
			dueDate: new Date(2023, 2, 22),
			project: 'Проект',
			board: 'Доска в проекте',
			status: 'В работе'
		},

		// Воскресенье
		{id: '#30', title: 'ФыВ', completed: false, assignee: 'АА', dueDate: new Date(2023, 2, 23)},

		// Понедельник
		{id: '#23', title: 'ФыВФ', completed: false, assignee: 'АА', dueDate: new Date(2023, 2, 24)},

		// Вторник
		{id: '#28', title: 'ФыВ', completed: false, assignee: 'АА', dueDate: new Date(2023, 2, 25)},
		{id: '#29', title: 'ФыВ', completed: false, assignee: 'АА', dueDate: new Date(2023, 2, 25)},

		// Среда
		{id: '#26', title: 'ФыВ', completed: false, assignee: 'АА', dueDate: new Date(2023, 2, 26)},
		{id: '#27', title: 'ФыВ', completed: false, assignee: 'АА', dueDate: new Date(2023, 2, 26)}
	])

	// Формирование дней недели
	const getDaysOfWeek = () => {
		const days = []
		for (let i = 0; i < 6; i++) {
			const day = new Date(currentWeekStart)
			day.setDate(currentWeekStart.getDate() + i)
			days.push(day)
		}
		return days
	}

	const weekDays = getDaysOfWeek()

	// Форматирование даты
	const formatDate = (date: Date): string => {
		const options: Intl.DateTimeFormatOptions = {day: 'numeric', month: 'long'}
		return date.toLocaleDateString('ru-RU', options)
	}

	// Получение дня недели
	const getDayOfWeek = (date: Date): string => {
		const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота']
		return days[date.getDay()]
	}

	// Установка предыдущей/следующей недели
	const goToPrevWeek = () => {
		const newStart = new Date(currentWeekStart)
		newStart.setDate(currentWeekStart.getDate() - 7)
		setCurrentWeekStart(newStart)
	}

	const goToNextWeek = () => {
		const newStart = new Date(currentWeekStart)
		newStart.setDate(currentWeekStart.getDate() + 7)
		setCurrentWeekStart(newStart)
	}

	// Получение месяца и года для заголовка
	const getMonthYear = (): string => {
		const options: Intl.DateTimeFormatOptions = {day: 'numeric', month: 'short', year: 'numeric'}
		return currentWeekStart.toLocaleDateString('ru-RU', options)
	}

	// Фильтрация задач по дню
	const getTasksForDate = (date: Date) => {
		return tasks.filter(
			task =>
				task.dueDate.getDate() === date.getDate() &&
				task.dueDate.getMonth() === date.getMonth() &&
				task.dueDate.getFullYear() === date.getFullYear()
		)
	}

	// Обработчики для Drag & Drop
	const handleDragStart = (task: Task) => {
		setDraggedTask(task)
	}

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault()
	}

	const handleDrop = (e: React.DragEvent<HTMLDivElement>, date: Date) => {
		e.preventDefault()
		if (!draggedTask) return

		// Обновляем дату задачи
		const updatedTasks = tasks.map(task => {
			if (task.id === draggedTask.id) {
				return {...task, dueDate: new Date(date)}
			}
			return task
		})

		setTasks(updatedTasks)
		setDraggedTask(null)
	}

	// Переключение статуса выполнения задачи
	const toggleTaskCompletion = (taskId: string) => {
		setTasks(prev => prev.map(task => (task.id === taskId ? {...task, completed: !task.completed} : task)))
	}

	// Добавление новой задачи
	const addNewTask = (date: Date) => {
		const newId = `#${Math.floor(Math.random() * 100)}`
		const newTask: Task = {
			id: newId,
			title: 'Новая задача',
			completed: false,
			assignee: 'АА',
			dueDate: new Date(date)
		}

		setTasks(prev => [...prev, newTask])
	}

	return (
		<div className='flex-1 overflow-auto h-screen'>
			<div className='p-4'>
				{/* Верхняя панель навигации */}
				<div className='flex items-center justify-between mb-4 bg-gray-50 p-3 rounded-lg'>
					<div className='flex items-center space-x-4'>
						<button className='flex items-center text-gray-600 text-sm font-medium hover:text-gray-800'>
							<svg className='w-4 h-4 mr-1' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
								<path d='M15 18l-6-6 6-6' />
							</svg>
							Неделя
						</button>

						<div className='h-6 w-px bg-gray-300'></div>

						<button className='text-blue-500 hover:text-blue-600 flex items-center text-sm'>
							<svg className='w-4 h-4 mr-1' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
								<path d='M12 5v14M5 12h14' />
							</svg>
							Добавить фильтр
						</button>
					</div>

					<div className='flex items-center'>
						<button className='text-gray-500 hover:bg-gray-100 p-1 rounded mx-1' onClick={goToPrevWeek}>
							<svg className='w-5 h-5' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
								<path d='M15 18l-6-6 6-6' />
							</svg>
						</button>

						<div className='font-medium mx-2'>{getMonthYear()}</div>

						<button className='text-gray-500 hover:bg-gray-100 p-1 rounded mx-1' onClick={goToNextWeek}>
							<svg className='w-5 h-5' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
								<path d='M9 18l6-6-6-6' />
							</svg>
						</button>

						<button className='ml-2 text-gray-500 hover:bg-gray-100 p-1 rounded'>
							<svg className='w-5 h-5' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
								<rect x='3' y='3' width='18' height='18' rx='2' />
								<path d='M9 3v18M15 3v18M3 9h18M3 15h18' />
							</svg>
						</button>

						<button className='ml-2 text-gray-500 hover:bg-gray-100 p-1 rounded'>
							<svg className='w-5 h-5' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
								<path d='M4 4h16v16H4zM4 12h16' />
							</svg>
						</button>

						<button className='bg-white border border-gray-200 text-gray-700 rounded-lg px-3 py-1.5 ml-4 hover:bg-gray-50 flex items-center'>
							<svg className='w-4 h-4 mr-1' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
								<path d='M12 5v14M5 12h14' />
							</svg>
							По умолчанию
						</button>

						<button className='bg-orange-500 text-white rounded-lg px-4 py-1.5 ml-4 hover:bg-orange-600'>
							Поделиться
						</button>
					</div>
				</div>

				{/* Календарный вид */}
				<div className='grid grid-cols-6 gap-3'>
					{weekDays.map((day, index) => (
						<div
							key={index}
							className='bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200'
							onDragOver={handleDragOver}
							onDrop={e => handleDrop(e, day)}>
							{/* Заголовок дня */}
							<div className='p-3 border-b border-gray-200 bg-gray-50'>
								<div className='font-medium text-gray-800'>
									{getDayOfWeek(day)}, {formatDate(day)}
								</div>
							</div>

							{/* Добавление задачи */}
							<div className='p-2 border-b border-gray-100 hover:bg-gray-50'>
								<button
									className='w-full flex items-center justify-center text-gray-400 hover:text-blue-500 py-1'
									onClick={() => addNewTask(day)}>
									<span className='text-sm'>Добавить задачу</span>
								</button>
							</div>

							{/* Задачи дня */}
							<div className='max-h-[500px] overflow-y-auto'>
								{getTasksForDate(day).map(task => (
									<div
										key={task.id}
										className='border-b border-gray-100 hover:bg-gray-50 p-3'
										draggable
										onDragStart={() => handleDragStart(task)}>
										<div className='flex items-start'>
											<div className='mr-2 mt-1'>
												<div
													className={`w-5 h-5 rounded-full border ${
														task.completed ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
													} flex items-center justify-center cursor-pointer hover:bg-gray-200`}
													onClick={() => toggleTaskCompletion(task.id)}>
													{task.completed && (
														<svg
															className='w-3 h-3 text-white'
															viewBox='0 0 24 24'
															fill='none'
															stroke='currentColor'
															strokeWidth='3'>
															<path d='M5 13l4 4L19 7' />
														</svg>
													)}
												</div>
											</div>

											<div className='flex-1'>
												<div className='flex items-center mb-1'>
													<span className='text-gray-500 text-xs mr-2'>{task.id}</span>
													{task.project && (
														<div className='flex items-center text-xs text-green-600 bg-green-50 rounded px-1.5 py-0.5'>
															<span>{task.project}</span>
															{task.board && <span className='mx-1'>›</span>}
															{task.board && <span>{task.board}</span>}
															{task.status && <span className='mx-1'>›</span>}
															{task.status && <span>{task.status}</span>}
														</div>
													)}
													{task.daysLeft && (
														<span className='ml-auto text-xs text-orange-500 bg-orange-50 rounded px-1.5 py-0.5'>
															{task.daysLeft} день
														</span>
													)}
												</div>

												<div
													className={`text-gray-800 font-medium mb-1 ${
														task.completed ? 'line-through text-gray-400' : ''
													}`}>
													{task.title}
												</div>

												<div className='flex items-center'>
													{task.assignee && <div className='text-gray-500 text-xs'>{task.assignee}</div>}

													{task.comments && (
														<div className='ml-auto flex items-center text-gray-400'>
															<svg
																className='w-4 h-4 mr-1'
																viewBox='0 0 24 24'
																fill='none'
																stroke='currentColor'
																strokeWidth='2'>
																<path d='M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z' />
															</svg>
														</div>
													)}
												</div>
											</div>
										</div>
									</div>
								))}

								{getTasksForDate(day).length === 0 && (
									<div className='p-4 text-center text-gray-400 text-sm'>Нет задач</div>
								)}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}
