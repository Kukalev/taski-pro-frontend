import React, {useEffect, useState} from 'react'
import {getAllMyTasks} from '../../../services/desk/api/GetAllMyTasks'
import {GroupedTasks, Task, TaskGroupKey} from './types'
import {differenceInCalendarDays, parseISO, startOfDay} from 'date-fns'
import {formatShortDate} from '../../../utils/dateUtils'
import {
	getPriorityClass,
	getPriorityDisplay
} from '../../../utils/priorityUtils'
import {getStatusDisplay} from '../../../utils/statusUtils'
import {
	ColumnDef,
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	useReactTable
} from '@tanstack/react-table'
import {FaChevronDown, FaChevronRight, FaPlus} from 'react-icons/fa'

// --- Вспомогательная функция для группировки задач ---
const groupTasksByDate = (tasks: Task[]): GroupedTasks => {
	const today = startOfDay(new Date());
	const grouped: GroupedTasks = {
		today: [],
		tomorrow: [],
		yesterday: [],
		upcoming: [],
		nodate: [],
		overdue: [],
	};

	tasks.forEach(task => {
		if (!task.taskFinishDate) {
			grouped.nodate.push(task);
		} else {
			try {
				const finishDate = startOfDay(parseISO(task.taskFinishDate));
				const diffDays = differenceInCalendarDays(finishDate, today);

				if (diffDays === 0) {
					grouped.today.push(task);
				} else if (diffDays === 1) {
					grouped.tomorrow.push(task);
				} else if (diffDays === -1) {
					grouped.yesterday.push(task);
				} else if (diffDays < -1) {
					grouped.overdue.push(task);
				} else {
					grouped.upcoming.push(task);
				}
			} catch (e) {
				console.error("Ошибка парсинга даты для задачи:", task.taskId, task.taskFinishDate, e);
				grouped.nodate.push(task);
			}
		}
	});

	return grouped;
};

// Определяем тип для данных строки
type TaskRow = Task;

// --- Определение колонок ---
const columnHelper = createColumnHelper<TaskRow>();

const columns = [
	columnHelper.accessor('taskName', {
		header: () => <span>Наименование</span>,
		cell: info => (
			<div className='flex items-center'>
				<span className='text-gray-800 truncate pl-2' title={info.getValue()}>
					{info.getValue()}
				</span>
			</div>
		),
		size: 280,
		minSize: 150,
	}),
	columnHelper.accessor('taskId', {
		header: () => <span>Номер</span>,
		cell: info => <span className='text-gray-500'>#{info.getValue()}</span>,
		size: 80,
		minSize: 60,
	}),
	columnHelper.accessor('executors', {
		header: () => <span>Исполнители</span>,
		cell: info => {
			const executors = info.getValue();
			const displayValue = Array.isArray(executors) && executors.length > 0 ? executors.join(', ') : '-';
			return <span className='text-gray-500 truncate' title={displayValue}>{displayValue}</span>;
		},
		size: 150,
		minSize: 100,
	}),
	// --- ИСПРАВЛЕНИЕ ОШИБОК ЛИНТЕРА ---
	// Предполагаем, что поле для проекта есть в типе Task и называется deskName (уточни, если это не так)
	// Если такого поля нет, нужно его добавить в тип Task или убрать эти колонки
	columnHelper.accessor(row => row.deskName, { // Используем accessorFn, если поле существует
		id: 'projectName', // Уникальный ID для колонки проекта
		header: () => <span>Проект</span>,
		cell: info => <span className='text-gray-500 truncate'>{info.getValue() || '-'}</span>,
		size: 150,
		minSize: 100,
	}),
	columnHelper.accessor(row => row.deskName, { // Используем accessorFn для доски тоже (если поле то же)
		id: 'deskName', // Уникальный ID для колонки доски
		header: () => <span>Доска</span>,
		cell: info => <span className='text-gray-500 truncate'>{info.getValue() || '-'}</span>,
		size: 150,
		minSize: 100,
	}),
	// --- КОНЕЦ ИСПРАВЛЕНИЙ ---
	columnHelper.accessor('statusType', {
		header: () => <span>Колонка</span>,
		cell: info => <span className='text-gray-500 truncate'>{getStatusDisplay(info.getValue())}</span>,
		size: 120,
		minSize: 90,
	}),
	columnHelper.accessor('taskFinishDate', {
		header: () => <span>Дата</span>,
		cell: info => {
			const date = info.getValue();
			return <span className='text-gray-500 truncate'>{date ? formatShortDate(date) : '-'}</span>;
		},
		size: 100,
		minSize: 80,
	}),
	columnHelper.accessor('priorityType', {
		header: () => <span>Приоритет</span>,
		cell: info => (
			<span className={`truncate ${getPriorityClass(info.getValue())}`}>
				{getPriorityDisplay(info.getValue())}
			</span>
		),
		size: 100,
		minSize: 80,
	}),
	columnHelper.accessor('taskStack', {
		header: () => <span>Теги</span>,
		cell: info => (
			<div className='text-gray-500 truncate space-x-1'>
				{(info.getValue() || '').split(' ').filter(Boolean).map(tag => (
					<span key={tag} className='bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded whitespace-nowrap'>
						{tag}
					</span>
				))}
			</div>
		),
		size: 180,
		minSize: 140,
	}),
];

// --- Основной компонент ---
export const MyTasks = () => {
	// УДАЛЕНО: Состояние вкладок
	const [isLoading, setIsLoading] = useState(true);
	const [groupedTasks, setGroupedTasks] = useState<GroupedTasks | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [expandedGroups, setExpandedGroups] = useState<Record<TaskGroupKey, boolean>>({
		today: true,
		tomorrow: true,
		yesterday: true,
		upcoming: true,
		nodate: true,
		overdue: true,
	});
	const [columnResizeMode, setColumnResizeMode] = useState<'onChange' | 'onEnd'>('onChange');
	const [columnVisibility, setColumnVisibility] = useState({});
	const [columnSizing, setColumnSizing] = useState({});

	// УПРОЩЕННЫЙ useEffect для загрузки задач
	useEffect(() => {
		const fetchTasks = async () => {
			setIsLoading(true);
			setError(null);
			try {
				console.log("[MyTasks] Загрузка задач 'Назначенные мне'..."); // Добавлен лог
				const fetchedTasks = await getAllMyTasks();
				console.log("[MyTasks] Задачи загружены:", fetchedTasks.length); // Добавлен лог
				setGroupedTasks(groupTasksByDate(fetchedTasks));
			} catch (err) {
				setError('Не удалось загрузить задачи.');
				console.error("[MyTasks] Ошибка загрузки задач:", err); // Добавлен лог ошибки
			} finally {
				setIsLoading(false);
			}
		};

		fetchTasks();
	}, []); // Пустой массив зависимостей - загрузка только при монтировании

	const toggleGroup = (group: TaskGroupKey) => {
		setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
	};

	const headerTable = useReactTable({
		data: [],
		columns: columns as ColumnDef<TaskRow, any>[],
		columnResizeMode,
		state: {
			columnVisibility,
			columnSizing,
		},
		onColumnVisibilityChange: setColumnVisibility,
		onColumnSizingChange: setColumnSizing,
		enableColumnResizing: true,
		getCoreRowModel: getCoreRowModel(),
	});

	const RenderTaskTable = ({ tasks }: { tasks: TaskRow[] }) => {
		const table = useReactTable({
			data: tasks,
			columns: columns as ColumnDef<TaskRow, any>[],
			columnResizeMode,
			getCoreRowModel: getCoreRowModel(),
			state: {
				columnVisibility,
			},
		});

		if (tasks.length === 0) {
			return <div className='text-gray-400 text-sm py-3 ml-6'>Нет задач</div>;
		}

		return (
			<>
				{table.getRowModel().rows.map(row => (
					<tr key={row.id} className="hover:bg-gray-50 border-b border-gray-100">
						{row.getVisibleCells().map(cell => (
							<td
								key={cell.id}
								className="py-2 px-2 align-middle"
								style={{ width: headerTable.getHeaderGroups()[0]?.headers[cell.column.getIndex()]?.getSize() ?? 'auto' }}
							>
								{flexRender(cell.column.columnDef.cell, cell.getContext())}
							</td>
						))}
					</tr>
				))}
			</>
		);
	};

	const renderTaskGroup = (title: string, groupKey: TaskGroupKey) => {
		if (!groupedTasks) return null;
		const isExpanded = expandedGroups[groupKey];
		const groupTasks = groupedTasks[groupKey] || [];

		return (
			<React.Fragment key={groupKey}>
				<tr className='sticky top-10 bg-gray-100 z-10 group-header-row'>
					<td colSpan={columns.length} className="py-1 px-2 border-b border-gray-200">
						<div
							className='flex items-center cursor-pointer'
							onClick={() => toggleGroup(groupKey)}
						>
							{isExpanded ? <FaChevronDown className='h-4 w-4 mr-2 text-gray-600' /> : <FaChevronRight className='h-4 w-4 mr-2 text-gray-600' />}
							<span className='font-medium text-gray-700'>{title}</span>
							<span className='ml-2 text-xs text-gray-400'>({groupTasks.length})</span>
							{isExpanded && (
								<button className="ml-auto p-1 rounded hover:bg-gray-200">
									<FaPlus className="h-4 w-4 text-gray-500" />
								</button>
							)}
						</div>
					</td>
				</tr>
				{isExpanded && <RenderTaskTable tasks={groupTasks} />}
			</React.Fragment>
		);
	};

	return (
		<div className='flex-1 overflow-y-auto' style={{ maxHeight: 'calc(100vh - 64px)' }}>
			<div className='p-6'>
				<div className='max-w-full mx-auto'>
					<div className='flex justify-between items-center mb-4'>
						<h1 className='text-xl font-semibold'>Мои задачи</h1>
						{/* УДАЛЕН блок с кнопками вкладок */}
					</div>

					<div className="overflow-x-auto">
						<table className="w-full border-separate border-spacing-0" style={{ minWidth: headerTable.getTotalSize() }}>
							<thead className='bg-gray-50 sticky top-0 z-20'>
							{headerTable.getHeaderGroups().map(headerGroup => (
								<tr key={headerGroup.id}>
									{headerGroup.headers.map(header => (
										<th
											key={header.id}
											colSpan={header.colSpan}
											className="py-2 px-2 text-left font-medium text-gray-600 relative border-b border-gray-200 cursor-default"
											style={{ width: header.getSize() }}
										>
											<div className='flex items-center justify-between'>
												{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
												{header.column.getCanResize() && (
													<div
														onMouseDown={header.getResizeHandler()}
														onTouchStart={header.getResizeHandler()}
														className={`resizer ${header.column.getIsResizing() ? 'isResizing' : ''}`}
													/>
												)}
											</div>
										</th>
									))}
								</tr>
							))}
							</thead>
							<tbody>
							{isLoading ? (
								<tr><td colSpan={columns.length}><div className="flex justify-center items-center h-32"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div></div></td></tr>
							) : error ? (
								<tr><td colSpan={columns.length} className="text-center text-red-600 py-4">{error}</td></tr>
							) : !groupedTasks || Object.values(groupedTasks).every(g => g.length === 0) ? (
								<tr><td colSpan={columns.length} className="text-center text-gray-500 py-6">Нет задач для отображения.</td></tr>
							) : (
								<>
									{renderTaskGroup('Просрочено', 'overdue')}
									{renderTaskGroup('Сегодня', 'today')}
									{renderTaskGroup('Завтра', 'tomorrow')}
									{renderTaskGroup('Предстоящие', 'upcoming')}
									{renderTaskGroup('Без даты', 'nodate')}
									{renderTaskGroup('Вчера', 'yesterday')}
								</>
							)}
							</tbody>
						</table>
					</div>
				</div>
			</div>
			<style>{`
				.resizer { position: absolute; top: 0; right: 0; width: 5px; height: 100%; background: transparent; cursor: col-resize; user-select: none; touch-action: none; opacity: 0; border-right: 2px solid transparent; }
				th:hover .resizer { opacity: 1; border-right: 2px solid #cbd5e1; }
				.resizer.isResizing { background: #60a5fa; border-right: 2px solid #3b82f6; opacity: 1; }
				.group-header-row td { background-color: #f9fafb; }
				.group-header-row { position: sticky; top: 40px; z-index: 15; }
			`}</style>
		</div>
	);
};