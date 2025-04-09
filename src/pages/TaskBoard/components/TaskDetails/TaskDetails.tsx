import React, {useEffect, useState, useRef} from 'react'
import { TaskService } from '../../../../services/task/Task';
import { Task as ServiceTask } from '../../../../services/task/types/task.types';
import { StatusType } from '../../types'
import DatePicker from '../../../../components/DatePicker/DatePicker'
import TaskDetailsHeader from './components/TaskDetailsHeader'
import TaskStatus from './components/TaskStatus'
import TaskName from './components/TaskName'
import TaskExecutors from './components/TaskExecutors'
import TaskDate from './components/TaskDate'
import TaskPriority from './components/TaskPriority'
import { TaskStack } from './components/TaskStack'
import TaskDescription from './components/TaskDescription'
import Gpt from './components/Gpt'
import { TaskFiles } from './components/Files'
import '../../styles/animations.ts'
import {AuthService} from '../../../../services/auth/Auth'
import {
  canEditTask, 
  canEditTaskName, 
  canEditTaskDescription, 
  canEditTaskDate, 
  canEditTaskPriority, 
  canManageExecutors,
} from '../../../../utils/permissionUtils'
import { TaskDetailsProps, Task } from './types'

const TaskDetails: React.FC<TaskDetailsProps> = ({
  task,
  deskId,
  deskUsers,
  avatarsMap,
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

  const taskForPermissions = task as ServiceTask;
  const canMoveOrCompleteTask = canEditTask(deskUsers, taskForPermissions);
  const canChangeName = canEditTaskName(deskUsers, taskForPermissions);
  const canChangeDescription = canEditTaskDescription(deskUsers, taskForPermissions);
  const canChangeDate = canEditTaskDate(deskUsers, taskForPermissions);
  const canChangePriority = canEditTaskPriority(deskUsers, taskForPermissions);
  const canChangeExecutors = canManageExecutors(deskUsers, taskForPermissions);
  const canChangeStack = canEditTask(deskUsers, taskForPermissions);
  const canRequestAiHelp = true;
  const canManageFiles = canEditTask(deskUsers, taskForPermissions);

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

  const saveTaskChanges = async (changes: Partial<ServiceTask>) => {
    if (!task?.taskId) return;

    try {
      const updatedServiceTask = await TaskService.updateTask(deskId, task.taskId, changes);
      const updatedLocalTask = updatedServiceTask as Task;
      onTaskUpdate(updatedLocalTask);
      return updatedLocalTask;
    } catch (error) {
      console.error('Ошибка при обновлении задачи:', error);
      return null;
    }
  };

  const handleSaveName = async () => {
    if (!canChangeName) return;
    await saveTaskChanges({ taskName });
    setIsEditingName(false);
  };

  const handleSaveDescription = async () => {
    if (!canChangeDescription) return;
    await saveTaskChanges({ taskDescription });
    setIsEditingDescription(false);
  };

  const handleCompleteTask = async () => {
    if (!canMoveOrCompleteTask) return;
    
    const newStatus = task.statusType === StatusType.COMPLETED
      ? StatusType.BACKLOG : StatusType.COMPLETED;
    await saveTaskChanges({ statusType: newStatus });
  };

  const handleDateChange = async (id: string, date: Date | null) => {
    if (!canChangeDate) return;
    
    const dateString = date ? date.toISOString() : null;
    await saveTaskChanges({ taskFinishDate: dateString });
    setShowDatePicker(false);
  };
  
  const handlePriorityChange = async (priority: string) => {
    if (!canChangePriority) return;
    
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
            canEdit={canMoveOrCompleteTask}
          />
          
          <TaskName 
            taskName={taskName}
            isCompleted={isCompleted}
            isEditingName={isEditingName}
            setIsEditingName={setIsEditingName}
            setTaskName={setTaskName}
            onSave={handleSaveName}
            inputRef={inputRef}
            canEdit={canChangeName}
          />

          <div className="border-t border-b border-gray-200 py-5 space-y-4">
            <TaskExecutors 
              executors={task?.executors || []}
              deskUsers={deskUsers}
              taskId={task?.taskId}
              deskId={deskId}
              avatarsMap={avatarsMap}
              onTaskUpdate={onTaskUpdate}
              canEdit={canChangeExecutors}
            />
            
            <TaskDate 
              taskCreateDate={task.taskCreateDate}
              taskFinishDate={task.taskFinishDate as string | null}
              taskId={task.taskId}
              deskId={deskId}
              deskUsers={deskUsers}
              onTaskUpdate={onTaskUpdate}
              canEdit={canChangeDate}
            />
            
            <TaskPriority 
              priorityType={task?.priorityType || task?.priority || ''}
              taskId={task.taskId}
              deskId={deskId}
              onPriorityChange={handlePriorityChange}
              canEdit={canChangePriority}
            />

            <TaskStack
              deskId={deskId}
              task={task}
              onTaskUpdate={onTaskUpdate}
              canEdit={canChangeStack}
            />

            <Gpt 
              deskId={deskId} 
              taskId={task.taskId} 
              canRequestAiHelp={canRequestAiHelp} 
            />

          </div>

          <TaskDescription 
            taskDescription={taskDescription}
            isEditingDescription={isEditingDescription}
            setIsEditingDescription={setIsEditingDescription}
            setTaskDescription={setTaskDescription}
            onSave={handleSaveDescription}
            textareaRef={textareaRef}
            canEdit={canChangeDescription}
          />

          <TaskFiles 
            deskId={deskId}
            taskId={task.taskId}
            canEdit={canManageFiles}
          />

        </div>
      </div>
    </div>
  );
};

export default TaskDetails;