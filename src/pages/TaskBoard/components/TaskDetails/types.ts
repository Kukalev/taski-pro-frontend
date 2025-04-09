import { StatusType } from '../../types';
import { UserOnDesk } from '../../../../services/desk/types/desk.types';
import { BatchAvatarResponse } from '../../../../services/Avatar/type';

export interface Task {
  taskId: number;
  taskName: string;
  taskDescription: string | null;
  statusType: StatusType;
  taskCreateDate: string;
  taskFinishDate: string | Date | null;
  priorityType: string;
  executors: string[];
  taskStack?: string[] | null;
  [key: string]: any;
}

export interface TaskDetailsProps {
  task: Task;
  deskId: number;
  deskUsers: UserOnDesk[];
  avatarsMap: BatchAvatarResponse;
  deskName?: string;
  onClose: () => void;
  onTaskUpdate: (updatedTask: Task) => void;
  isClosing?: boolean;
  onAnimationEnd?: () => void;
}

export interface TaskNameProps {
  taskName: string;
  isCompleted: boolean;
  isEditingName: boolean;
  setIsEditingName: (value: boolean) => void;
  setTaskName: (value: string) => void;
  onSave: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
  canEdit: boolean;
}

export interface TaskStatusProps {
  isCompleted: boolean;
  onStatusChange: () => void;
  canEdit: boolean;
}

export interface TaskDateProps {
  taskCreateDate: string;
  taskFinishDate: string | Date | null | undefined;
  taskId: number;
  deskId: number;
  deskUsers: UserOnDesk[];
  onTaskUpdate: (updatedTask: Task) => void;
  canEdit: boolean;
}

export interface TaskDescriptionProps {
  taskDescription: string | null;
  isEditingDescription: boolean;
  setIsEditingDescription: (value: boolean) => void;
  setTaskDescription: (value: string) => void;
  onSave: () => void;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  canEdit: boolean;
}

export interface TaskDetailsHeaderProps {
  onClose: () => void;
  taskNumber: number;
}

export interface TaskPriorityProps {
  priorityType: string;
  taskId: number;
  deskId: number;
  onPriorityChange: (priority: string) => void;
  canEdit: boolean;
}

export interface TaskExecutorsProps {
  executors: string[];
  deskUsers: UserOnDesk[];
  taskId: number;
  deskId: number;
  avatarsMap: BatchAvatarResponse;
  onTaskUpdate: (updatedTask: Task) => void;
  canEdit: boolean;
}

export interface TaskStackProps {
  deskId: number;
  task: Task;
  onTaskUpdate: (updatedTask: Task) => void;
  canEdit: boolean;
}
