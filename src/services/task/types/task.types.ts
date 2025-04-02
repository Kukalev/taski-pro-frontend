export interface Task {
	taskId: number;
	userName: string;
	taskName: string;
	taskDescription: string | null;
	taskCreateDate: string;
	taskFinishDate: string | null;
	priorityType: string;
	statusType: string;
	executors: string[];
}

export interface TaskUpdate {
	taskName?: string;
	taskDescription?: string | null;
	taskFinishDate?: string | null;
	priorityType?: string;
	statusType?: string;
	executorUsernames?: string[];
	removeExecutorUsernames?: string[];
}

