export interface Task {
	taskId: number;
	userName: string;
	taskName: string;
	taskDescription: string | null;
	taskCreateDate: string;
	taskFinishDate: string | null;
	priorityType: string;
	statusType: string;
}

