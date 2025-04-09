import React, { useRef, useEffect } from 'react'
import { TaskColumnProps, StatusType, Task } from '../types'
import TaskCard from './TaskCard'
import TaskInput from './TaskInput'
import TaskDatePicker from './TaskDatePicker'
import { canCreateTasks, getUserRoleOnDesk } from '../../../utils/permissionUtils'

// Обновляем интерфейс пропсов, если он не в ../types
interface ExtendedTaskColumnProps extends Omit<TaskColumnProps, 'onDragOver' | 'onDrop' | 'onDragEnd'> {
  deskId: number; // Убедимся, что deskId обязателен
  deskUsers: any[]; // Принимаем пользователей как обязательный проп
  onTaskUpdate: (taskId: number, updates: Partial<Task> | { executorUsernames?: string[]; removeExecutorUsernames?: string[] }) => void; // Добавляем onTaskUpdate
  setAddingInColumn: (statusId: number | null) => void; // Добавляем
  // Новые DND пропсы
  draggedTask: Task | null;
  dropTarget: { statusType: string; index: number } | null;
  setDropTarget: (target: { statusType: string; index: number } | null) => void;
  onDropOnColumn: (statusType: string) => void; // Обработчик drop из TaskBoardPage
  onDragStart: (e: React.DragEvent, task: Task) => void; // Для передачи в TaskCard
  avatarsMap: Record<string, string | null>; // <--- Принимаем проп
}

const TaskColumn: React.FC<ExtendedTaskColumnProps> = ({
  status,
  tasks,
  deskId,
  deskUsers, // Принимаем как проп
  onAddTask,
  inputValue,
  onInputChange,
  onInputKeyDown,
  isAddingInColumn,
  hoveredCheckCircle,
  hoveredCalendar,
  datePickerTaskId,
  selectedDates,
  onTaskComplete,
  onDateClick,
  setHoveredCheckCircle,
  setHoveredCalendar,
  onDragStart, // Принимаем onDragStart
  onDateChange,
  onTaskClick,
  onTaskUpdate, // Принимаем как проп
  setAddingInColumn, // Принимаем как проп
  // Новые DND пропсы
  draggedTask,
  dropTarget,
  setDropTarget,
  onDropOnColumn, // Обработчик drop из TaskBoardPage
  avatarsMap, // <--- Получаем проп
}) => {
  const addInputRef = useRef<HTMLDivElement>(null); // Ref для инпута добавления

  // Используем переданных deskUsers для определения прав
  const hasCreatePermission = canCreateTasks(deskUsers);

  // Обработчик клика вне инпута для выхода из режима добавления
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Проверяем, что клик был ВНЕ компонента TaskInput
      if (isAddingInColumn === status.id && // Только если добавляем в этой колонке
        addInputRef.current &&
        !addInputRef.current.contains(e.target as Node)) {
        setAddingInColumn(null); // Выход из режима добавления
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAddingInColumn, setAddingInColumn, status.id]); // Добавили зависимости

  // --- Логика расчета индекса прямо здесь ---
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Обязательно для drop
    e.dataTransfer.dropEffect = "move"; // Показываем иконку перемещения

    if (!draggedTask) return; // Нечего перетаскивать

    const column = e.currentTarget;
    if (!(column instanceof HTMLElement)) return;

    const columnRect = column.getBoundingClientRect();
    const mouseY = e.clientY - columnRect.top;

    // Используем tasks.length (актуальный для этой колонки)
    let targetIndex = tasks.length;

    const taskCards = Array.from(column.querySelectorAll('.task-card'));

    if (taskCards.length === 0) {
      targetIndex = 0;
    } else {
      for (let i = 0; i < taskCards.length; i++) {
        const card = taskCards[i];
        if (!(card instanceof HTMLElement)) continue;
        const cardRect = card.getBoundingClientRect();
        const cardMiddleRelative = cardRect.top + cardRect.height / 2 - columnRect.top;
        if (mouseY < cardMiddleRelative) {
          targetIndex = i;
          break;
        }
      }
    }

    // Обновляем dropTarget только если он изменился
    if (!dropTarget || dropTarget.statusType !== status.type || dropTarget.index !== targetIndex) {
      // console.log(`[TaskColumn ${status.type}] Setting drop target index: ${targetIndex}`);
      setDropTarget({ statusType: status.type, index: targetIndex });
    }
  };

  // Обработчик Drop
  const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      // console.log(`[TaskColumn ${status.type}] Drop event`);
      onDropOnColumn(status.type); // Вызываем обработчик из TaskBoardPage
      setDropTarget(null); // Сбрасываем цель сразу после drop'а
  };

  return (
    <div
      className="w-[15%] min-w-[250px] flex flex-col h-[calc(100vh-80px)]" // Убедись, что высота правильная
      data-status={status.type}
      // --- Новые обработчики ---
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragLeave={() => setDropTarget(null)} // Сбрасываем цель при выходе из колонки
    >
      <div className="mb-2 rounded-lg bg-white py-2">
        <h3 className="text-sm font-medium text-gray-700 ml-3">{status.title}</h3>
      </div>

      {/* Показываем инпут, если есть права */}
      {hasCreatePermission && (
        <div ref={addInputRef} className="mb-2"> {/* Обертка с ref */}
          {/* Условный рендеринг TaskInput или кнопки "Добавить задачу" */}
          {isAddingInColumn === status.id ? (
            <TaskInput
              statusId={status.id}
              value={inputValue[status.id] || ''}
              onChange={onInputChange}
              onKeyDown={onInputKeyDown}
              autoFocus={true} // Автофокус при появлении
            />
          ) : (
            <button
              onClick={() => setAddingInColumn(status.id)}
              className="w-full h-10 px-3 rounded-lg bg-white text-[12px] text-left text-gray-400 border border-gray-200 hover:border-gray-300 focus:outline-none"
            >
              + Добавить задачу...
            </button>
          )}
        </div>
      )}

      <div
        className="space-y-2 flex-1 overflow-y-auto max-h-full pr-1 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent relative"
      >
        {/* Индикатор вставки в начало */}
        {draggedTask && dropTarget?.statusType === status.type && dropTarget?.index === 0 && (
          <div className="absolute top-[-2px] left-0 right-1 h-1 z-10 bg-orange-400 rounded" />
        )}

        {tasks.map((task, index) => (
          <div key={task.taskId} className="relative" data-task-id={task.taskId}>
            <TaskCard
              task={task}
              deskUsers={deskUsers}
              deskId={deskId}
              avatarsMap={avatarsMap} // <--- Передаем дальше
              onDragStart={onDragStart} // Передаем onDragStart
              onComplete={onTaskComplete}
              onDateClick={onDateClick}
              selectedDate={selectedDates[task.taskId!] || null}
              hoveredCheckCircle={hoveredCheckCircle}
              hoveredCalendar={hoveredCalendar}
              setHoveredCheckCircle={setHoveredCheckCircle}
              setHoveredCalendar={setHoveredCalendar}
              onTaskClick={onTaskClick}
              onTaskUpdate={onTaskUpdate}
              // isDatePickerOpen - управляется TaskBoardPage
            />

            {/* Индикатор вставки ПОСЛЕ текущей задачи */}
            {draggedTask && dropTarget?.statusType === status.type && dropTarget?.index === index + 1 && (
              <div className="absolute bottom-[-2px] left-0 right-1 h-1 z-10 bg-orange-400 rounded"/>
            )}
          </div>
        ))}
         {/* Можно добавить плейсхолдер в конец для пустых колонок, если нужно */}
         {tasks.length === 0 && dropTarget?.statusType === status.type && (
             <div className="h-10 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                 Переместите сюда
             </div>
         )}
      </div>
    </div>
  );
};

export default TaskColumn;
