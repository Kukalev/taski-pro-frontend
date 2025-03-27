import React, {useEffect, useState} from 'react'
import {createTask, getTasksByDeskId} from '../../../services/task/Task'
import {Task} from '../../../services/task/types/task.types'
import {PiUserCircleThin} from 'react-icons/pi'
import {FaRegCircle, FaCheck} from 'react-icons/fa'

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

	// Загрузка задач только при первом рендере и изменении deskId
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

	// Обновленная функция для обработки ввода в конкретной колонке
	const handleInputChange = (columnId: number, text: string) => {
		setNewTaskTexts(prev => ({
			...prev,
			[columnId]: text
		}));
	};

	// Обновленная функция для обработки нажатия клавиш
	const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>, status: typeof STATUSES[0]) => {
		const taskText = newTaskTexts[status.id] || '';
		
		if (e.key === 'Enter' && taskText.trim()) {
			try {
				// 1. Отправляем запрос на создание задачи на сервер
				const newTask = await createTask(deskId, taskText.trim(), status.type);

				// 2. Добавляем полученный объект задачи в локальный массив
				setTasks(prev => {
					const updated = [...prev, newTask];
					console.log('Обновленный список задач:', updated);
					return updated;
				});

				// 3. Очищаем форму и закрываем поле ввода
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

	// Функция для получения задач по статусу
	const getTasksByStatus = (statusType: string) => {
		return tasks.filter(task => task.statusType === statusType);
	};

	return (
		<div className="flex-1 p-4 overflow-x-auto">
			{loading ? (
				<div className="flex justify-center items-center h-64">
					<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
				</div>
			) : (
				<div className="flex space-x-4">
					{STATUSES.map(status => {
						const statusTasks = getTasksByStatus(status.type);
						const currentText = newTaskTexts[status.id] || '';

						return (
							<div key={status.id} className="w-[15%] min-w-[250px] flex flex-col h-full">
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

								{/* Контейнер для задач с тонким скроллбаром */}
								<div 
									className="space-y-2 flex-1 overflow-y-auto max-h-[calc(100vh-200px)] pr-1
									scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent hover:scrollbar-thumb-gray-300"
								>
									{statusTasks.map(task => (
										<div
											key={task.taskId}
											className="bg-white pl-3 pb-3 min-h-[100px] cursor-pointer pt-2 rounded-lg border
											border-gray-200 hover:shadow-sm transition-shadow relative group"
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

											{/* Иконка пользователя, появляющаяся при наведении на задачу и меняющая цвет при наведении на иконку */}
											<div className="absolute bottom-1 left-3 mb-2 opacity-0 group-hover:opacity-100 
												transition-opacity duration-200">
												<PiUserCircleThin
													className="text-gray-400 transition-colors duration-300 hover:text-orange-500 cursor-pointer"
													style={{ width: '20px', height: '20px' }}
												/>
											</div>
											
											{/* Круг с галочкой */}
											<div 
												className="absolute bottom-1 right-3 mb-2 cursor-pointer"
												onMouseEnter={() => setHoveredCheckCircle(task.taskId)}
												onMouseLeave={() => setHoveredCheckCircle(null)}
											>
												<div className="relative">
													<FaRegCircle className="text-gray-300" size={16} />
													
													{/* Галочка с плавным появлением */}
													<FaCheck 
														className={`absolute top-0 left-0 text-gray-400 transition-opacity duration-300
														${hoveredCheckCircle === task.taskId ? 'opacity-100' : 'opacity-0'}`}
														size={10} 
														style={{ 
															transform: 'translate(3px, 3px)' // Центрируем галочку внутри круга
														}}
													/>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
};