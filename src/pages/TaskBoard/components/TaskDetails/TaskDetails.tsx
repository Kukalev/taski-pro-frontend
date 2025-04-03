import React, {useEffect, useState, useRef} from 'react'
import {updateTask} from '../../../../services/task/Task'
import {StatusType} from '../../types'
import DatePicker from '../../../../components/DatePicker/DatePicker'
import TaskDetailsHeader from './components/TaskDetailsHeader'
import TaskStatus from './components/TaskStatus'
import TaskName from './components/TaskName'
import TaskExecutors from './components/TaskExecutors'
import TaskDate from './components/TaskDate'
import TaskPriority from './components/TaskPriority'
import TaskDescription from './components/TaskDescription'
import '../../styles/animations.ts'

interface TaskDetailsProps {
  task: {
    taskId: number;
    taskName: string;
    taskDescription: string;
    statusType: StatusType;
    taskFinishDate?: string | Date | null;
    executors?: string[];
    priority?: string;
    priorityType?: string;
    [key: string]: any;
  };
  deskId: number;
  deskUsers: any[];
  deskName?: string;
  onClose: () => void;
  onTaskUpdate: (updatedTask: any) => void;
  isClosing?: boolean;
  onAnimationEnd?: () => void;
}

const TaskDetails: React.FC<TaskDetailsProps> = ({
  task,
  deskId,
  deskUsers,
  deskName = "Тестовая доска",
  onClose,
  onTaskUpdate,
  isClosing = false,
  onAnimationEnd
}) => {
  const [taskName, setTaskName] = useState(task?.taskName || '');
  const [taskDescription, setTaskDescription] = useState(task?.taskDescription || '');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (task) {
      setTaskName(task.taskName || '');
      setTaskDescription(task.taskDescription || '');
    }
  }, [task]);

  const handleClose = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    
    if (onClose) {
      onClose();
    }
  };

  const saveTaskChanges = async (changes: any) => {
    if (!task?.taskId) return;

    try {
      console.log('Сохранение изменений:', changes);
      const updatedTask = await updateTask(deskId, task.taskId, changes);
      onTaskUpdate(updatedTask);
      return updatedTask;
    } catch (error) {
      console.error('Ошибка при обновлении задачи:', error);
      return null;
    }
  };

  const handleSaveName = async () => {
    await saveTaskChanges({ taskName });
    setIsEditingName(false);
  };

  const handleSaveDescription = async () => {
    await saveTaskChanges({ taskDescription });
    setIsEditingDescription(false);
  };

  const handleCompleteTask = async () => {
    const newStatus = task.statusType === StatusType.COMPLETED
      ? StatusType.BACKLOG : StatusType.COMPLETED;
    await saveTaskChanges({ statusType: newStatus });
  };

  const handleDateChange = async (id: string, date: Date | null) => {
    await saveTaskChanges({ taskFinishDate: date });
    setShowDatePicker(false);
  };
  
  const handlePriorityChange = async (priority: string) => {
    await saveTaskChanges({ priorityType: priority });
  };

  const isCompleted = task?.statusType === StatusType.COMPLETED;

  return (
    <div 
      className={`fixed top-0 right-0 h-full overflow-auto bg-white shadow-xl z-50 ${isClosing ? 'animate-slide-out-right' : 'animate-slide-in-right'}`}
      style={{ width: '600px', borderLeft: '1px solid #e5e7eb' }}
      onClick={(e) => e.stopPropagation()}
      onAnimationEnd={onAnimationEnd}
    >
      <TaskDetailsHeader 
        taskNumber={task?.taskId || 0} 
        onClose={handleClose}
      />

      <div className="p-4">
        <div className="flex flex-col space-y-4">
          <TaskStatus 
            isCompleted={isCompleted} 
            onStatusChange={handleCompleteTask} 
          />
          
          <TaskName 
            taskName={taskName}
            isCompleted={isCompleted}
            isEditingName={isEditingName}
            setIsEditingName={setIsEditingName}
            setTaskName={setTaskName}
            onSave={handleSaveName}
            inputRef={inputRef}
          />

          <div className="pt-2">
            <TaskExecutors 
              executors={task?.executors || []}
              deskUsers={deskUsers}
              taskId={task?.taskId}
              deskId={deskId}
              onTaskUpdate={onTaskUpdate}
            />
            
            <TaskDate 
              taskCreateDate={task.taskCreateDate}
              taskFinishDate={task.taskFinishDate as string | null}
              taskId={task.taskId}
              deskId={deskId}
              onTaskUpdate={onTaskUpdate}
            />
            {showDatePicker && task?.taskId && (
              <DatePicker
                taskId={task.taskId.toString()}
                selectedDate={task.taskFinishDate ? new Date(task.taskFinishDate) : null}
                onDateChange={handleDateChange}
                onClose={() => setShowDatePicker(false)}
              />
            )}
            
            <TaskPriority 
              priorityType={task?.priorityType || task?.priority || ''}
              taskId={task.taskId}
              deskId={deskId}
              onPriorityChange={handlePriorityChange}
            />
          </div>

          <TaskDescription 
            taskDescription={taskDescription}
            isEditingDescription={isEditingDescription}
            setIsEditingDescription={setIsEditingDescription}
            setTaskDescription={setTaskDescription}
            onSave={handleSaveDescription}
            textareaRef={textareaRef}
          />
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;