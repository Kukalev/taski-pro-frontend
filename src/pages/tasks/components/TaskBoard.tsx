import React, {useEffect, useState} from 'react'
import {createTask, getTasksByDeskId} from '../../../services/task/Task'
import {Task} from '../../../services/task/types/task.types'

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
	{ id: 1, title: 'К выполнению', color: 'bg-gray-400', type: StatusType.BACKLOG },
	{ id: 2, title: 'В работе', color: 'bg-blue-400', type: StatusType.INWORK },
	{ id: 3, title: 'На рассмотрении', color: 'bg-yellow-400', type: StatusType.REVIEW },
	{ id: 4, title: 'Тестирование', color: 'bg-purple-400', type: StatusType.TESTING },
	{ id: 5, title: 'Завершено', color: 'bg-green-400', type: StatusType.COMPLETED },
];

interface TaskBoardProps {
	deskId: number;
}

export const TaskBoard: React.FC<TaskBoardProps> = ({ deskId }) => {
	const [addingInColumn, setAddingInColumn] = useState<number | null>(null);
	const [newTaskText, setNewTaskText] = useState('');
	const [tasks, setTasks] = useState<Task[]>([]);
	const [loading, setLoading] = useState(true);

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

	// Создание новой задачи - добавляем сразу в локальный массив
	const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>, status: typeof STATUSES[0]) => {
		if (e.key === 'Enter' && newTaskText.trim()) {
			try {
				// 1. Отправляем запрос на создание задачи на сервер
				const newTask = await createTask(deskId, newTaskText.trim(), status.type);

				// 2. Добавляем полученный объект задачи в локальный массив
				setTasks(prev => {
					const updated = [...prev, newTask];
					console.log('Обновленный список задач:', updated);
					return updated;
				});

				// 3. Очищаем форму и закрываем поле ввода
				setNewTaskText('');
				setAddingInColumn(null);
			} catch (error) {
				console.error('Ошибка при создании задачи:', error);
			}
		} else if (e.key === 'Escape') {
			setNewTaskText('');
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

						return (
							<div key={status.id} className="w-72 bg-gray-50 rounded-lg shadow-sm">
								<div className={`px-3 py-2 border-b border-gray-200 ${status.color} bg-opacity-30`}>
									<div className="flex items-center">
										<span className={`w-2 h-2 rounded-full ${status.color} mr-2`}></span>
										<h3 className="font-medium text-sm">{status.title}</h3>
										<span className="text-xs text-gray-500 ml-1">({statusTasks.length})</span>
									</div>
								</div>

								<div className="p-2 min-h-[200px]">
									{statusTasks.length === 0 ? (
										<div className="text-sm text-gray-400 text-center py-4">Нет задач</div>
									) : (
										<div className="space-y-2">
											{statusTasks.map(task => (
												<div 
													key={task.taskId}
													className="bg-white p-3 rounded shadow-sm hover:shadow transition-all"
												>
													<div className="text-sm font-medium">{task.taskName}</div>
													{task.taskDescription && (
														<div className="text-xs text-gray-500 mt-1">{task.taskDescription}</div>
													)}
													<div className="text-xs text-gray-400 mt-1">
														{new Date(task.taskCreateDate).toLocaleDateString()}
													</div>
												</div>
											))}
										</div>
									)}
								</div>

								{addingInColumn === status.id ? (
									<input
										type="text"
										className="w-full p-2 border-t border-gray-200"
										placeholder="Введите название задачи..."
										value={newTaskText}
										onChange={(e) => setNewTaskText(e.target.value)}
										onKeyDown={(e) => handleKeyDown(e, status)}
										autoFocus
									/>
								) : (
									<button 
										className="w-full p-2 text-left text-gray-600 border-t border-gray-200 hover:bg-gray-100"
										onClick={() => setAddingInColumn(status.id)}
									>
										+ Добавить задачу
									</button>
								)}
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
};