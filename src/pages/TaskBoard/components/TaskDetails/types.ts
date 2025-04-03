import { StatusType } from '../../types';

export interface Task {
  taskId: number;
  taskName: string;
  taskDescription: string;
  statusType: StatusType;
  taskFinishDate: string | Date | null;
  executors: string[];
  [key: string]: any;
}

export interface TaskDetailsProps {
  task: Task;
  deskId: number;
  deskUsers: any[];
  onClose: () => void;
  onTaskUpdate: (updatedTask: any) => void;
  isTransitioning: boolean;
  onTransitionEnd: () => void;
}

export interface TaskNameProps {
  taskName: string;
  isCompleted: boolean;
  isEditingName: boolean;
  setIsEditingName: (value: boolean) => void;
  setTaskName: (value: string) => void;
  onSave: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
}

export interface TaskStatusProps {
  isCompleted: boolean;
  onStatusChange: () => void;
}

export interface TaskDateProps {
  finishDate: string | Date | null | undefined;
  showDatePicker?: boolean;
  onDateClick?: () => void;
  taskId?: number | string;
}

export interface TaskDescriptionProps {
  taskDescription: string;
  isEditingDescription: boolean;
  setIsEditingDescription: (value: boolean) => void;
  setTaskDescription: (value: string) => void;
  onSave: () => void;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
}

export interface TaskDetailsHeaderProps {
  onClose: () => void;
  taskNumber: number;
}
