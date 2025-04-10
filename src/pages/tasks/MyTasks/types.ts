// Импортируем основной тип Task из сервисов
import { Task as ServiceTask } from '../../../services/task/types/task.types';

// Экспортируем его для использования в компоненте MyTasks
export type Task = ServiceTask;

// Определяем типы для группировки задач
export type TaskGroupKey = 'today' | 'tomorrow' | 'yesterday' | 'upcoming' | 'nodate' | 'overdue';

export interface GroupedTasks {
  today: Task[];
  tomorrow: Task[];
  yesterday: Task[];
  upcoming: Task[]; // Задачи в будущем (не сегодня/завтра)
  nodate: Task[];   // Задачи без даты
  overdue: Task[];  // Просроченные (не вчера)
}

