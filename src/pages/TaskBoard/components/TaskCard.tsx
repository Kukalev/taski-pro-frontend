import React, { useCallback } from "react";
import { FaCheck, FaRegCircle } from "react-icons/fa";
import { IoCalendarNumberOutline } from "react-icons/io5";
import { StatusType, TaskCardProps } from "../types";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import TaskExecutors from "./TaskExecutors";
import { canEditTask, canEditTaskDate } from "../../../utils/permissionUtils";
import { Task } from "../../../services/task/types/task.types";

// Форматирование даты для отображения в карточке
const formatShortDate = (date: Date | string): string => {
  try {
    // Создаем объект Date. new Date() парсит строки (включая ISO/UTC) и клонирует Date объекты.
    const parsedDate = new Date(date);

    // Проверяем валидность
    if (isNaN(parsedDate.getTime())) {
      return "";
    }

    // format из date-fns по умолчанию выводит дату в локальном часовом поясе пользователя.
    return format(parsedDate, "d MMM", { locale: ru });
  } catch (error) {
    console.error("Ошибка форматирования даты:", error);
    return "";
  }
};

// --- НАЧАЛО: Вспомогательные функции для приоритета ---
// (Можно вынести в отдельный файл utils, если используются в других местах)

// Возвращает Tailwind класс цвета фона для индикатора
const getPriorityIndicatorClass = (priorityType?: string): string => {
  switch (priorityType) {
    case "HIGH":
      return "bg-red-500"; // Красный для высокого
    case "MEDIUM":
      return "bg-yellow-500"; // Желтый/Оранжевый для среднего
    case "LOW":
      return "bg-green-600"; // Зеленый для низкого
    case "FROZEN": // Предполагаем такой ключ для "замороженный"
      return "bg-blue-500"; // Синий для замороженного
    default:
      return "hidden"; // Скрываем, если приоритет не задан или неизвестен
  }
};

// Возвращает текстовое описание приоритета для title
const getPriorityTitle = (priorityType?: string): string => {
  switch (priorityType) {
    case "HIGH":
      return "Высокий приоритет";
    case "MEDIUM":
      return "Средний приоритет";
    case "LOW":
      return "Низкий приоритет";
    case "FROZEN":
      return "Заморожен";
    default:
      return "";
  }
};
// --- КОНЕЦ: Вспомогательные функции для приоритета ---

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  deskUsers,
  deskId,
  avatarsMap,
  onTaskClick,
  onDragStart,
  onComplete,
  onDateClick,
  hoveredCheckCircle,
  hoveredCalendar,
  setHoveredCheckCircle,
  setHoveredCalendar,
  onTaskUpdate,
  canEdit = true,
  isDatePickerOpen,
  onDragEnd,
}) => {
  // Определяем, завершена ли задача
  const isCompleted = task.statusType === StatusType.COMPLETED;

  // Проверяем, может ли текущий пользователь выполнять различные действия
  const canMoveOrCompleteTask = canEdit && canEditTask(deskUsers, task);
  const canChangeDate = canEdit && canEditTaskDate(deskUsers, task);

  // Обработчик клика по карточке
  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // Проверяем клик по интерактивным элементам или по самой иконке/обертке галочки/календаря
    if (
      target.closest("button") ||
      target.closest("a") ||
      target.closest("input") ||
      target.closest("textarea") ||
      target.closest("select") ||
      target.closest('[data-interactive-control="true"]') // Добавим атрибут оберткам иконок
    ) {
      return;
    }
    if (onTaskClick) {
      onTaskClick(task);
    }
  };

  // ОБНОВЛЕННЫЙ КОЛЛБЭК: получает намерение от TaskExecutors и передает его ВМЕСТЕ С taskId в TaskBoardPage
  const handleExecutorUpdate = useCallback((updates: { executorUsernames?: string[]; removeExecutorUsernames?: string[] }) => {
    if (task?.taskId && onTaskUpdate) {
      console.log(`[TaskCard] Передача запроса на обновление исполнителей для задачи ${task.taskId} родителю с изменениями:`, updates);
      // Вызываем коллбэк из TaskBoardPage, передавая ID задачи и запрошенные изменения
      onTaskUpdate(task.taskId, updates);
    } else {
      console.error("[TaskCard] ID задачи или onTaskUpdate отсутствует в handleExecutorUpdate");
    }
  }, [task, onTaskUpdate]);

  // Определяем права на редактирование для передачи в TaskExecutors
  // Можно использовать переданный canEdit или вычислить здесь, если нужно
  const canEditExecutors = canEdit; // && canManageExecutors(deskUsers, task); // Проверка прав уже есть внутри TaskExecutors

  // Определяем дату для форматирования. Приоритет у свежевыбранного объекта Date.
  const dateToFormat: Date | string | null = task.taskFinishDate;

  // Форматируем полученное значение
  const formattedFinishDate = dateToFormat
    ? formatShortDate(dateToFormat)
    : null;

  // Получаем класс и title для индикатора
  const indicatorClass = getPriorityIndicatorClass(task.priorityType);
  const priorityTitle = getPriorityTitle(task.priorityType);

  return (
    <div
      className="bg-white rounded-lg shadow p-3 mb-2 cursor-pointer hover:shadow-md task-card group relative"
      onClick={handleCardClick}
      draggable={canMoveOrCompleteTask}
      onDragStart={(e) => canMoveOrCompleteTask && onDragStart(e, task)}
      onDragEnd={onDragEnd}
    >
      {/* === НАЧАЛО: Индикатор приоритета (Обновлено) === */}
      <div
        className={`absolute top-0 right-5 h-1 w-6 rounded-b-2xl   shadow-sm ${indicatorClass}`}
        title={priorityTitle}
      />
      {/* === КОНЕЦ: Индикатор приоритета === */}

      <div className="mb-2">
        <h3
          className={`font-medium text-gray-900 truncate max-w-full block ${
            indicatorClass !== "hidden" ? "mr-4" : ""
          } ${isCompleted ? "line-through text-gray-500" : ""}`}
        >
          {task.taskName}
        </h3>
        {task.taskDescription && (
          <p
            className={`text-sm text-gray-600 mt-1 ${
              isCompleted ? "line-through text-gray-400" : ""
            }`}
          >
            {task.taskDescription}
          </p>
        )}
      </div>

      {/* Компонент для управления исполнителями и кнопками */}
      <div
        className={`mt-2 pt-2 border-t border-gray-100 ${
          isCompleted ? "opacity-70" : ""
        } flex justify-between items-center`}
      >
        {/* Левая часть - исполнители */}
        <TaskExecutors
          task={task}
          deskUsers={deskUsers}
          deskId={deskId || 0}
          avatarsMap={avatarsMap}
          onTaskUpdate={handleExecutorUpdate}
          canEdit={canEditExecutors}
        />

        {/* Правая часть - дата и чекбокс */}
        <div className="flex items-center space-x-2">
          {/* Календарь */}
          <div
            className={`${canChangeDate ? "cursor-pointer" : "cursor-default"} ${
              formattedFinishDate ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            } transition-opacity duration-200`}
            data-task-id={task.taskId}
            onMouseEnter={() => canChangeDate && setHoveredCalendar(task.taskId!)}
            onMouseLeave={() => canChangeDate && setHoveredCalendar(null)}
            onClick={(e) => {
              e.stopPropagation();
              if (canChangeDate && onDateClick) {
                onDateClick(task.taskId!, e);
              }
            }}
            data-interactive-control="true"
          >
            {formattedFinishDate ? (
              <div className="text-xs text-gray-500">{formattedFinishDate}</div>
            ) : (
              <IoCalendarNumberOutline
                className={`calendar-icon transition-colors duration-300 ${
                  !canChangeDate && "opacity-50"
                }`}
                style={{
                  color:
                    hoveredCalendar === task.taskId
                      ? "var(--theme-color)"
                      : "#9ca3af",
                  width: "16px",
                  height: "16px",
                }}
              />
            )}
          </div>

          {/* Кнопка выполнено - MEMBER может менять только если исполнитель */}
          <div
            className={
              canMoveOrCompleteTask ? "cursor-pointer" : "cursor-default"
            }
            onMouseEnter={() =>
              canMoveOrCompleteTask && setHoveredCheckCircle(task.taskId!)
            }
            onMouseLeave={() =>
              canMoveOrCompleteTask && setHoveredCheckCircle(null)
            }
            onClick={(e) => {
              e.stopPropagation();
              if (canMoveOrCompleteTask) {
                onComplete(task.taskId!);
                setHoveredCheckCircle(null);
              }
            }}
            data-interactive-control="true"
          >
            <div className="relative">
              <FaRegCircle
                className={`${
                  isCompleted ? "text-green-200" : "text-gray-300"
                } ${!canMoveOrCompleteTask && "opacity-50"}`}
                size={16}
              />

              <FaCheck
                className={`absolute top-0 left-0 transition-all duration-300
                  ${
                    isCompleted
                      ? "text-green-500 opacity-100"
                      : hoveredCheckCircle === task.taskId &&
                        canMoveOrCompleteTask
                      ? "text-gray-400 opacity-100"
                      : "text-gray-400 opacity-0"
                  }`}
                size={10}
                style={{ transform: "translate(3px, 3px)" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
