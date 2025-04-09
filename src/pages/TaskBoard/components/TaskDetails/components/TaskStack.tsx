import React, {useEffect, useRef, useState} from 'react'
import {TaskService} from '../../../../../services/task/Task'
import {Task} from '../../../../../services/task/types/task.types'
import {Input} from '../../../../../components/ui/Input' // Предполагаем наличие Input
import {Button} from '../../../../../components/ui/Button' // И кнопки
import {FaTimes} from 'react-icons/fa' // Иконка для очистки поиска
import {BsStack} from 'react-icons/bs'

// Список предопределенных тегов (без запятых!)
const PREDEFINED_STACK_TAGS = [...new Set([
	'PHP', 'Ruby', 'Python', 'Java', 'C#', 'Laravel', 'Django', 'Spring',
	'Ruby on Rails', 'Meteor', 'Node.js', 'Angular', 'React', 'Vue', 'Redux',
	'MongoDB', 'MySQL', 'Oracle', 'PostgreSQL', 'JavaScript', 'TypeScript',
	'HTML', 'CSS', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', // Добавим SQL, если его не было
    'SQL'
])].sort();

interface TaskStackProps {
	deskId: number;
	task: Task; // Передаем всю задачу, чтобы иметь доступ к taskId и taskStack
	onTaskUpdate: (updatedTask: Task) => void; // Callback для обновления задачи в родительском компоненте
	canEdit: boolean; // Флаг, можно ли редактировать
}

// ---> ИЗМЕНЕНИЕ: Функция очистки тега <---
const cleanTag = (tag: string): string => {
    // Убираем пробелы по краям и удаляем запятые (и другие неалфанумерики в конце, кроме #+.)
    return tag.trim().replace(/[^a-zA-Z0-9#+.]$/, '');
}

// ---> ИЗМЕНЕНИЕ: Преобразование строки в чистый массив <---
const stackStringToArray = (stackString: string | null | undefined): string[] => {
	if (!stackString) return [];
    const cleanedTags = stackString.split(' ')
                                   .map(cleanTag)
                                   .filter(tag => tag !== '');
    // Возвращаем массив с уникальными значениями
	return [...new Set(cleanedTags)];
}

// ---> ИЗМЕНЕНИЕ: Преобразование массива в чистую строку <---
const stackArrayToString = (stackArray: string[]): string | null => {
    // Убираем дубликаты и очищаем на всякий случай
	const uniqueCleanedArray = [...new Set(stackArray.map(cleanTag).filter(tag => tag !== ''))];
	return uniqueCleanedArray.length > 0 ? uniqueCleanedArray.join(' ') : null;
}

export const TaskStack: React.FC<TaskStackProps> = ({ deskId, task, onTaskUpdate, canEdit }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
    // Инициализируем уникальным массивом
	const [selectedStack, setSelectedStack] = useState<string[]>(stackStringToArray(task.taskStack));
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// ---> НОВОЕ: Реф для ссылки на элемент дропдауна <---
	const dropdownRef = useRef<HTMLDivElement>(null);

	// ---> НОВОЕ: useEffect для обработки кликов вне <---
	useEffect(() => {
		// Функция, которая будет вызываться при клике
		const handleClickOutside = (event: MouseEvent) => {
			// Проверяем, открыт ли дропдаун и был ли клик вне элемента (ref.current)
			if (isOpen && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false);
				setError(null);
				setSearchTerm('');
				setSelectedStack(stackStringToArray(task.taskStack)); // Сброс к массиву из строки task.taskStack
			}
		};

		// Добавляем слушатель, когда компонент монтируется или isOpen меняется на true
		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		} else {
            // Убираем слушатель, если меню закрыто
            document.removeEventListener('mousedown', handleClickOutside);
        }


		// Функция очистки: убираем слушатель при размонтировании компонента
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isOpen, task.taskStack]); // Добавляем task.taskStack в зависимости, чтобы сброс был корректным

	// Обновляем локальное состояние, если изменилась строка task.taskStack в пропсах
	useEffect(() => {
		setSelectedStack(stackStringToArray(task.taskStack));
	}, [task.taskStack]);

	const handleToggleDropdown = () => {
        if (!canEdit) return; // Не открываем, если нельзя редактировать
		setIsOpen(!isOpen);
        if (!isOpen) {
            // При открытии сбрасываем состояние и синхронизируем локальный стек
            setError(null);
            setSearchTerm('');
            setSelectedStack(stackStringToArray(task.taskStack));
        }
	};

	const handleTagToggle = (tag: string) => {
        const cleanedTag = cleanTag(tag);
		setSelectedStack(prev => {
            const currentUniqueStack = [...new Set(prev)]; // Работаем с уникальным набором
			return currentUniqueStack.includes(cleanedTag)
                   ? currentUniqueStack.filter(t => t !== cleanedTag)
                   : [...currentUniqueStack, cleanedTag].sort()
        });
	};

	const handleCancel = () => {
		setIsOpen(false);
		setError(null);
		setSearchTerm('');
		setSelectedStack(stackStringToArray(task.taskStack));
	}

	const filteredTags = PREDEFINED_STACK_TAGS.filter(tag =>
		tag.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const handleSave = async () => {
		setIsLoading(true);
		setError(null);
		try {
            // Вызываем новый сервис обновления стека
			const stackString = stackArrayToString(selectedStack);
			await TaskService.updateTaskStack(deskId, task.taskId, { taskStack: stackString ?? '' });
			console.log('[TaskStack] Стек успешно обновлен');
            // Вызываем колбэк для обновления данных задачи в родительском компоненте
            // Имитируем обновленную задачу (в идеале, API должен ее вернуть)
            onTaskUpdate({ ...task, taskStack: stackString });
			setIsOpen(false); // Закрываем меню
		} catch (err: any) { // Явно типизируем ошибку
			console.error('[TaskStack] Ошибка при сохранении стека:', err);
            // Попытка извлечь сообщение из ошибки API
            const message = err.response?.data?.message || err.message || 'Не удалось сохранить стек.';
			setError(message);
		} finally {
			setIsLoading(false);
		}
	};

	const renderSelectedStack = () => {
		const currentStackArray = stackStringToArray(task.taskStack);
		if (currentStackArray.length === 0) {
			return (
                <div className={`italic ${canEdit ? 'text-gray-500 cursor-pointer hover:text-gray-700' : 'text-gray-500'} px-2 py-1 rounded-md`}>
                    Выбрать...
                </div>
            );
		}
		return (
			<div className={`${canEdit ? 'cursor-pointer' : 'cursor-default'} px-2 py-1 rounded-md flex flex-wrap gap-1`}>
				{/* Сортируем для стабильного отображения */}
                {currentStackArray.slice().sort().map(tag => (
					<span key={tag} className="bg-gray-200 text-gray-800 text-xs font-medium px-2 py-0.5 rounded">
						{tag}
					</span>
				))}
			</div>
		);
	};

	return (
		<div
            className="flex items-center py-2 border-b border-gray-100 relative"
            ref={dropdownRef}
        >
            <div className="w-6 flex justify-center text-gray-400">
                <BsStack size={18} />
            </div>

            <div className="flex items-center ml-4 w-full">
                <span className="text-gray-500 mr-2">Стек</span>

                <div onClick={handleToggleDropdown} className="flex-grow min-w-0">
                    {renderSelectedStack()}
                </div>
            </div>

			{isOpen && canEdit && (
				<div
                    className="absolute top-full left-0 mt-1 bg-white rounded-md shadow-lg z-10 w-full max-w-sm md:max-w-md lg:max-w-lg border border-gray-200 p-3"
                    style={{ left: 'calc(1.5rem + 1rem)' }}
                >
					<div className="relative mb-2">
						<Input
							type="text"
							placeholder="Поиск..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pr-8"
						/>
						{searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                                aria-label="Очистить поиск"
                            >
                                <FaTimes />
                            </button>
                        )}
					</div>

					<ul className="max-h-60 overflow-y-auto space-y-1 mb-3 border-t border-b py-2">
						{filteredTags.length > 0 ? (
							filteredTags.map(tag => (
								<li
									key={tag}
									onClick={() => handleTagToggle(tag)}
									className={`px-2 py-1 text-sm rounded cursor-pointer flex items-center justify-between ${
										selectedStack.includes(cleanTag(tag))
											? 'bg-blue-100 text-blue-700 font-semibold'
											: 'hover:bg-gray-100 text-gray-800'
									}`}
								>
									{tag}
                                    {selectedStack.includes(cleanTag(tag)) && (
                                        <span className="text-blue-600 font-bold text-lg leading-none">✓</span>
                                    )}
								</li>
							))
						) : (
							<li className="px-2 py-1 text-sm text-gray-500 italic">
                                {searchTerm ? 'Теги не найдены' : 'Нет доступных тегов'}
                            </li>
						)}
					</ul>

                    {error && <p className="text-xs text-red-600 mb-2">{error}</p>}

					<div className="flex justify-end space-x-2">
						<Button variant="secondary" size="sm" onClick={handleCancel}>
							Отмена
						</Button>
						<Button size="sm" onClick={handleSave} disabled={isLoading}>
							{isLoading ? 'Сохранение...' : 'Сохранить'}
						</Button>
					</div>
				</div>
			)}
		</div>
	);
};
