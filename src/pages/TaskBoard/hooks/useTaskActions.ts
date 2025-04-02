import React, {useCallback, useEffect, useRef, useState} from 'react'
import {Task} from '../../../services/task/types/task.types'
import {
  createTask,
  deleteTask,
  getTasksByDeskId,
  updateTask
} from '../../../services/task/Task'
import {StatusType} from '../types'
import {useParams} from 'react-router-dom'

// Глобальный объект для отслеживания загрузок
const GlobalLoading = {
  isLoading: false
}

export const useTaskActions = (injectedDeskId?: number) => {
  const { deskId: urlDeskId } = useParams<{ deskId: string }>();
  const numericDeskId = urlDeskId ? parseInt(urlDeskId, 10) : null;
  const deskId = injectedDeskId || numericDeskId || 72;
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Record<number, Date | null>>({});
  const isFirstRun = useRef(true);
  
  // Загрузка задач - МАКСИМАЛЬНО УПРОЩЕННАЯ
  useEffect(() => {
    // Только при первом рендере 
    if (!isFirstRun.current) return;
    isFirstRun.current = false;
    
    // Избегаем параллельных запросов
    if (GlobalLoading.isLoading) return;
    GlobalLoading.isLoading = true;
    
    const loadTasks = async () => {
      try {
        setLoading(true);
        const fetchedTasks = await getTasksByDeskId(deskId);
        setTasks(fetchedTasks || []);
      } catch (error) {
        console.error('Ошибка загрузки задач:', error);
      } finally {
        setLoading(false);
        GlobalLoading.isLoading = false;
      }
    };
    
    loadTasks();
  }, [deskId]);

  // Инициализация дат
  useEffect(() => {
    if (tasks.length > 0) {
      const datesMap: Record<number, Date | null> = {};
      tasks.forEach(task => {
        if (task.taskId && task.taskFinishDate) {
          datesMap[task.taskId] = new Date(task.taskFinishDate);
        }
      });
      setSelectedDate(datesMap);
    }
  }, [tasks]);

  // Функции работы с задачами (минимальные)
  const getTasksByStatus = useCallback((statusType: string) => {
    return tasks.filter(task => task.statusType === statusType);
  }, [tasks]);

  const handleCreateTask = useCallback(async (statusId: number, taskText: string, statusType: string) => {
    try {
      const newTask = await createTask(deskId, taskText.trim(), statusType);
      setTasks(prev => [...prev, newTask]);
      return true;
    } catch (error) {
      return false;
    }
  }, [deskId]);

  const handleUpdateTaskStatus = useCallback(async (taskId: number, statusType: string) => {
    try {
      const updatedTask = await updateTask(deskId, taskId, { statusType });
      setTasks(prev => prev.map(t => t.taskId === taskId ? updatedTask : t));
      return true;
    } catch (error) {
      return false;
    }
  }, [deskId]);

  const handleUpdateTaskDate = useCallback(async (taskId: number, date: Date | null) => {
    try {
      const updatedTask = await updateTask(deskId, taskId, {
        taskFinishDate: date ? date.toISOString() : null
      });
      setTasks(prev => prev.map(t => t.taskId === taskId ? updatedTask : t));
      setSelectedDate(prev => ({...prev, [taskId]: date}));
      return true;
    } catch (error) {
      return false;
    }
  }, [deskId]);

  const handleCompleteTask = useCallback(async (taskId: number) => {
    try {
      const task = tasks.find(t => t.taskId === taskId);
      if (!task) return false;
      
      const newStatus = task.statusType === StatusType.COMPLETED 
        ? StatusType.BACKLOG 
        : StatusType.COMPLETED;
        
      const updatedTask = await updateTask(deskId, taskId, { statusType: newStatus });
      setTasks(prev => prev.map(t => t.taskId === taskId ? updatedTask : t));
      return true;
    } catch (error) {
      return false;
    }
  }, [deskId, tasks]);

  const handleDeleteTask = useCallback(async (taskId: number) => {
    try {
      await deleteTask(deskId, taskId);
      setTasks(prev => prev.filter(t => t.taskId !== taskId));
      return true;
    } catch (error) {
      return false;
    }
  }, [deskId]);

  const updateTaskWrapper = useCallback(async (taskDeskId: number, taskId: number, updates: any) => {
    try {
      const updatedTask = await updateTask(taskDeskId, taskId, updates);
      if (taskDeskId === deskId) {
        setTasks(prev => prev.map(t => t.taskId === taskId ? updatedTask : t));
      }
      return updatedTask;
    } catch (error) {
      throw error;
    }
  }, [deskId]);

  return {
    tasks,
    loading,
    selectedDate,
    deskId,
    getTasksByStatus,
    handleCreateTask,
    handleUpdateTaskStatus,
    handleUpdateTaskDate,
    handleCompleteTask,
    handleDeleteTask,
    setTasks,
    updateTask: updateTaskWrapper
  };
};
