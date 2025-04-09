import { Task } from '../../services/task/types/task.types'

// Типы статусов
export enum StatusType {
  BACKLOG = 'BACKLOG',
  INWORK = 'INWORK',
  REVIEW = 'REVIEW',
  TESTING = 'TESTING',
  COMPLETED = 'COMPLETED'
}

// Статусы для колонок
export const STATUSES = [
  { id: 1, title: 'К выполнению',  type: StatusType.BACKLOG },
  { id: 2, title: 'В работе',  type: StatusType.INWORK },
  { id: 3, title: 'На рассмотрении',  type: StatusType.REVIEW },
  { id: 4, title: 'Тестирование',  type: StatusType.TESTING },
  { id: 5, title: 'Завершено',  type: StatusType.COMPLETED },
];

// Типы для пропсов компонентов
export interface TaskBoardProps {
  deskId: number;
}

export interface TaskColumnProps {
  status: typeof STATUSES[0];
  tasks: Task[];
  onAddTask?: (statusId: number, text: string, statusType: string) => void;
  onDragOver: (e: React.DragEvent, statusType: string, tasks: Task[]) => void;
  onDrop: (e: React.DragEvent, statusType: string) => void;
  draggedTask: Task | null;
  dropTarget: {statusType: string, index: number} | null;
  inputValue: Record<number, string>;
  onInputChange: (statusId: number, value: string) => void;
  onInputKeyDown: (e: React.KeyboardEvent, statusId: number) => void;
  isAddingInColumn: number | null;
  hoveredCheckCircle: number | null;
  hoveredCalendar: number | null;
  datePickerTaskId: number | null;
  selectedDates: Record<number, Date | null>;
  onTaskComplete: (taskId: number) => void;
  onDateClick: (taskId: number) => void;
  setHoveredCheckCircle: (taskId: number | null) => void;
  setHoveredCalendar: (taskId: number | null) => void;
  onDragStart: (e: React.DragEvent, task: Task) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDateChange: (taskId: number, date: Date | null) => void;
  onTaskClick?: (task: Task) => void;
  deskUsers: any[];
  avatarsMap: Record<string, string | null>;
  onTaskUpdate: (taskId: number, updates: Partial<Task> | { executorUsernames?: string[]; removeExecutorUsernames?: string[] }) => void;
  setAddingInColumn: (statusId: number | null) => void;
  setDropTarget: (target: { statusType: string; index: number } | null) => void;
  onDropOnColumn: (statusType: string) => void;
}

export interface TaskCardProps {
  task: Task;
  deskUsers: any[];
  deskId?: number;
  avatarsMap: Record<string, string | null>;
  onDragStart: (e: React.DragEvent, task: Task) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onComplete: (taskId: number) => void;
  onDateClick: (taskId: number) => void;
  selectedDate: Date | null;
  isDatePickerOpen: boolean;
  hoveredCheckCircle: number | null;
  hoveredCalendar: number | null;
  setHoveredCheckCircle: (taskId: number | null) => void;
  setHoveredCalendar: (taskId: number | null) => void;
  onTaskClick?: (task: Task) => void;
  onTaskUpdate?: (taskId: number, updates: Partial<Task> | { executorUsernames?: string[]; removeExecutorUsernames?: string[] }) => void;
}

export interface TaskExecutorProps {
  task: Task;
  deskUsers: any[];
  deskId: number;
  avatarsMap: Record<string, string | null>;
  onTaskUpdate: (updates: { executorUsernames?: string[]; removeExecutorUsernames?: string[] }) => void;
  canEdit?: boolean;
}

export interface TaskInputProps {
  statusId: number;
  value: string;
  onChange: (statusId: number, value: string) => void;
  onKeyDown: (e: React.KeyboardEvent, statusId: number) => void;
  autoFocus: boolean;
}

export interface DeleteZoneProps {
  visible: boolean;
  hovered: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
}

export interface DeleteModalProps {
  visible: boolean;
  taskName?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export interface TaskDatePickerProps {
  taskId: number;
  selectedDate: Date | null;
  onDateChange: (taskId: number, date: Date | null) => void;
  onClose: () => void;
}

export interface TaskDetailsProps {
  deskUsers: any[];
  avatarsMap: Record<string, string | null>;
  onClose: () => void;
  onTaskUpdate: (updatedTask: any) => void;
  isClosing?: boolean;
  onAnimationEnd?: () => void;
}
