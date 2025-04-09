import React, {useEffect, useState, useRef, useCallback} from 'react'
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
import { TaskDetailsProps, Task as LocalTask } from './types'
import { addHours } from 'date-fns';

const TaskDetails: React.FC<TaskDetailsProps> = ({
  task: initialTask,
  deskId,
  deskUsers,
  avatarsMap,
  deskName = "Тестовая доска",
  onClose,
  onTaskUpdate: onTaskUpdateProp,
  isClosing = false,
  onAnimationEnd
}) => {
  const [currentTask, setCurrentTask] = useState<LocalTask>(initialTask);
  const [taskName, setTaskName] = useState(initialTask?.taskName || '');
  const [taskDescription, setTaskDescription] = useState(initialTask?.taskDescription || '');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const taskForPermissions = currentTask as ServiceTask;
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
    setCurrentTask(initialTask);
    setTaskName(initialTask.taskName || '');
    setTaskDescription(initialTask.taskDescription || '');
    setIsEditingName(false);
    setIsEditingDescription(false);
  }, [initialTask]);

  const handleClose = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    
    if (onClose) {
      onClose();
    }
  };

  const saveTaskChanges = useCallback(async (
      changes: Partial<ServiceTask> | { executorUsernames?: string[]; removeExecutorUsernames?: string[] }
    ) => {
    if (!currentTask?.taskId) return null;

    const previousTaskState = currentTask;

    let updatedTaskPreview: LocalTask;
    if ('executorUsernames' in changes && changes.executorUsernames) {
        const currentExecutors = currentTask.executors || [];
        const newExecutors = [...new Set([...currentExecutors, ...changes.executorUsernames])];
        updatedTaskPreview = { ...currentTask, executors: newExecutors };
    } else if ('removeExecutorUsernames' in changes && changes.removeExecutorUsernames) {
        const currentExecutors = currentTask.executors || [];
        updatedTaskPreview = { ...currentTask, executors: currentExecutors.filter(u => !changes.removeExecutorUsernames!.includes(u)) };
    } else {
        updatedTaskPreview = { ...currentTask, ...(changes as Partial<LocalTask>) };
    }

    console.log('[TaskDetails] Оптимистично обновляем локальное состояние:', updatedTaskPreview);
    setCurrentTask(updatedTaskPreview);

    console.log('[TaskDetails] Вызываем onTaskUpdateProp (TaskBoardPage) с ОПТИМИСТИЧНЫМ состоянием');
    onTaskUpdateProp(updatedTaskPreview);

    try {
      console.log('[TaskDetails] Отправляем API запрос:', changes);
      const updatedServiceTask = await TaskService.updateTask(deskId, currentTask.taskId, changes);
      const finalUpdatedTask = updatedServiceTask as LocalTask;
      console.log('[TaskDetails] API успешно ответил:', finalUpdatedTask);

      if (JSON.stringify(finalUpdatedTask) !== JSON.stringify(updatedTaskPreview)) {
          console.warn('[TaskDetails] Ответ API отличается от оптимистичного предсказания. Обновляем состояние финальными данными.');
          setCurrentTask(finalUpdatedTask);
          onTaskUpdateProp(finalUpdatedTask);
      } else {
           setCurrentTask(finalUpdatedTask);
      }

      return finalUpdatedTask;

    } catch (error: any) {
      console.error('[TaskDetails] Ошибка при обновлении задачи через API:', error);

      console.log('[TaskDetails] Откатываем изменения из-за ошибки API. Предыдущее состояние:', previousTaskState);
      setCurrentTask(previousTaskState);
      onTaskUpdateProp(previousTaskState);

      const action = 'executorUsernames' in changes ? 'добавить' : ('removeExecutorUsernames' in changes ? 'удалить' : 'обновить');
      const target = 'executorUsernames' in changes ? changes.executorUsernames.join(', ') : ('removeExecutorUsernames' in changes ? changes.removeExecutorUsernames.join(', ') : '');
      if (error.response?.status === 401) {
         alert(`Ошибка авторизации при попытке ${action} исполнителей. Пожалуйста, войдите снова.`);
      } else {
        alert(`Не удалось ${action} ${target ? `"${target}"` : ''} для задачи "${previousTaskState.taskName}". Изменения отменены.`);
      }
      return null;
    }
  }, [currentTask, deskId, onTaskUpdateProp]);

  const handleSaveName = async () => {
    if (!canChangeName) return;
    const result = await saveTaskChanges({ taskName });
    if (result) setIsEditingName(false);
  };

  const handleSaveDescription = async () => {
    if (!canChangeDescription) return;
    const result = await saveTaskChanges({ taskDescription });
    if (result) setIsEditingDescription(false);
  };

  const handleCompleteTask = async () => {
    if (!canMoveOrCompleteTask) return;
    
    const newStatus = currentTask.statusType === StatusType.COMPLETED
      ? StatusType.BACKLOG : StatusType.COMPLETED;
    await saveTaskChanges({ statusType: newStatus });
  };

  const handleDateChange = useCallback((newDate: Date | null) => {
    if (!currentTask || !canEditTaskDate(deskUsers, currentTask)) {
      // console.log("Нет прав на изменение даты или нет текущей задачи");
      return;
    }

    let dateToSend: Date | null = null;

    if (newDate instanceof Date && !isNaN(newDate.getTime())) {
      // --- НАЧАЛО: Коррекция часового пояса ---
      // Добавляем 3 часа к выбранной дате, чтобы компенсировать UTC-смещение
      // Это гарантирует, что при конвертации в UTC сохранится правильный день
      const adjustedDate = addHours(newDate, 3);
      dateToSend = adjustedDate;
      // --- КОНЕЦ: Коррекция часового пояса ---
       console.log(`[TaskDetails] Исходная дата: ${newDate.toISOString()}, Скорректированная (+3ч): ${dateToSend?.toISOString()}`);
    } else {
       console.log(`[TaskDetails] Дата сброшена`);
       dateToSend = null; // Если дата невалидна или null, отправляем null
    }


    // Вызываем saveTaskChanges с возможно скорректированной датой
    saveTaskChanges({ taskFinishDate: dateToSend });

  }, [currentTask, deskUsers, saveTaskChanges]); // Добавили saveTaskChanges в зависимости useCallback
  
  const handlePriorityChange = async (priority: string) => {
    if (!canChangePriority) return;
    
    await saveTaskChanges({ priorityType: priority });
  };

  const handleExecutorChanges = useCallback((
      updates: { executorUsernames?: string[]; removeExecutorUsernames?: string[] }
    ) => {
     console.log('[TaskDetails] Получен запрос на изменение исполнителей из TaskExecutors (Details):', updates);
     saveTaskChanges(updates);
  }, [saveTaskChanges]);

  const isCompleted = currentTask?.statusType === StatusType.COMPLETED;

  return (
    <div 
      className={`fixed top-0 right-0 h-full overflow-auto bg-white shadow-xl z-50 ${isClosing ? 'animate-slide-out-right' : 'animate-slide-in-right'}`}
      style={{ width: '600px', borderLeft: '1px solid #e5e7eb' }}
      onClick={(e) => e.stopPropagation()}
      onAnimationEnd={onAnimationEnd}
    >
      <TaskDetailsHeader 
        taskNumber={currentTask?.taskId || 0} 
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
              executors={currentTask?.executors || []}
              deskUsers={deskUsers}
              taskId={currentTask?.taskId}
              deskId={deskId}
              avatarsMap={avatarsMap}
              onTaskUpdate={handleExecutorChanges}
              canEdit={canChangeExecutors}
            />
            
            <TaskDate 
              taskCreateDate={currentTask.taskCreateDate}
              taskFinishDate={currentTask.taskFinishDate as string | null}
              taskId={currentTask.taskId}
              deskId={deskId}
              deskUsers={deskUsers}
              onDateChange={handleDateChange}
              canEdit={canEditTaskDate(deskUsers, currentTask)}
            />
            
            <TaskPriority 
              priorityType={currentTask?.priorityType || currentTask?.priority || ''}
              taskId={currentTask.taskId}
              deskId={deskId}
              onPriorityChange={handlePriorityChange}
              canEdit={canChangePriority}
            />

            <TaskStack
              deskId={deskId}
              task={currentTask}
              canEdit={canChangeStack}
            />

            <Gpt 
              deskId={deskId} 
              taskId={currentTask.taskId} 
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
            taskId={currentTask.taskId}
            canEdit={canManageFiles}
          />

        </div>
      </div>
    </div>
  );
};

export default TaskDetails;