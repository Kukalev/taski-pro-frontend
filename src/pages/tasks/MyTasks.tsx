import {useState} from 'react'

// Типы
interface Task {
	id: string
	title: string
	number: string
	executor: string
	project: string
	board: string
	column: string
	date: string
	priority: string
	tags: string[]
	completed: boolean
}

type TaskGroup = 'today' | 'tomorrow' | 'yesterday' | 'other'

export const MyTasks = () => {
	// Состояние вкладок
	const [activeTab, setActiveTab] = useState<'assigned' | 'delegated' | 'private'>('assigned')

	// Состояние групп задач
	const [expandedGroups, setExpandedGroups] = useState<Record<TaskGroup, boolean>>({
		today: true,
		tomorrow: true,
		yesterday: true,
		other: true
	})

	// Пример данных
	const [tasks] = useState<Record<TaskGroup, Task[]>>({
		today: [],
		tomorrow: [],
		yesterday: [],
		other: [
			{
				id: '1',
				title: 'sasd',
				number: '#10',
				executor: 'ASdasd a.',
				project: 'Проект',
				board: 'Доска в проекте',
				column: 'В работе',
				date: '',
				priority: '',
				tags: [],
				completed: false
			}
		]
	})

	// Функция для переключения состояния группы
	const toggleGroup = (group: TaskGroup) => {
		setExpandedGroups(prev => ({...prev, [group]: !prev[group]}))
	}

	// Рендеринг группы задач
	const renderTaskGroup = (title: string, group: TaskGroup) => {
		const isExpanded = expandedGroups[group]
		const groupTasks = tasks[group]

		return (
			<div className='mb-6'>
				<div className='flex items-center cursor-pointer py-1 hover:bg-gray-50' onClick={() => toggleGroup(group)}>
					<span className='text-gray-400 mr-1'>{isExpanded ? '▼' : '►'}</span>
					<span className='text-gray-700 font-medium'>{title}</span>
				</div>

				{isExpanded && (
					<>
						<div className='flex items-center text-gray-400 hover:text-gray-700 ml-6 mt-2 cursor-pointer'>
							<span className='mr-1'>+</span>
							<span className='text-sm'>Новая задача</span>
						</div>

						{groupTasks.length > 0 ? (
							groupTasks.map(task => (
								<div key={task.id} className='grid grid-cols-9 hover:bg-gray-50 py-2 border-b border-gray-100'>
									<div className='flex items-center'>
										<input type='checkbox' checked={task.completed} onChange={() => {}} className='mr-3 ml-6' />
										<span className='text-gray-800'>{task.title}</span>
									</div>
									<div className='text-gray-500 text-sm'>{task.number}</div>
									<div className='text-gray-500 text-sm'>{task.executor}</div>
									<div className='text-gray-500 text-sm'>{task.project}</div>
									<div className='text-gray-500 text-sm'>{task.board}</div>
									<div className='text-gray-500 text-sm'>{task.column}</div>
									<div className='text-gray-500 text-sm'>{task.date}</div>
									<div className='text-gray-500 text-sm'>{task.priority}</div>
									<div className='text-gray-500 text-sm'>
										{task.tags.map(tag => (
											<span key={tag} className='bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded mr-1'>
												{tag}
											</span>
										))}
									</div>
								</div>
							))
						) : (
							<div className='text-gray-400 text-sm py-3 ml-6'>Нет задач</div>
						)}
					</>
				)}
			</div>
		)
	}

	return (
		<div className='flex-1 overflow-auto'>
			<div className='p-8'>
				<div className='max-w-full mx-auto'>
					<div className='flex justify-between items-center mb-6'>
						<h1 className='text-2xl font-semibold text-gray-900'>Мои задачи</h1>

						<div className='flex space-x-4'>
							<button
								className={`px-4 py-2 rounded-lg ${
									activeTab === 'assigned' ? 'bg-orange-100 text-orange-500' : 'text-gray-600 hover:bg-gray-100'
								}`}
								onClick={() => setActiveTab('assigned')}>
								Назначенные мне
							</button>
							<button
								className={`px-4 py-2 rounded-lg ${
									activeTab === 'delegated' ? 'bg-orange-100 text-orange-500' : 'text-gray-600 hover:bg-gray-100'
								}`}
								onClick={() => setActiveTab('delegated')}>
								Порученные мной
							</button>
							<button
								className={`px-4 py-2 rounded-lg ${
									activeTab === 'private' ? 'bg-orange-100 text-orange-500' : 'text-gray-600 hover:bg-gray-100'
								}`}
								onClick={() => setActiveTab('private')}>
								Мои приватные задачи
							</button>
						</div>
					</div>

					{/* Заголовки таблицы */}
					<div className='grid grid-cols-9 py-3 border-b border-gray-200 mb-2'>
						<div className='font-medium text-gray-700'>Наименование</div>
						<div className='font-medium text-gray-700'>Номер</div>
						<div className='font-medium text-gray-700'>Исполнитель</div>
						<div className='font-medium text-gray-700'>Проект</div>
						<div className='font-medium text-gray-700'>Доска</div>
						<div className='font-medium text-gray-700'>Колонка</div>
						<div className='font-medium text-gray-700'>Дата</div>
						<div className='font-medium text-gray-700'>Приоритет</div>
						<div className='font-medium text-gray-700'>Теги</div>
					</div>

					{/* Группы задач */}
					<div>
						{renderTaskGroup('Сегодня', 'today')}
						{renderTaskGroup('Завтра', 'tomorrow')}
						{renderTaskGroup('Вчера', 'yesterday')}
						{renderTaskGroup('Другие задачи', 'other')}
					</div>
				</div>
			</div>
		</div>
	)
}
