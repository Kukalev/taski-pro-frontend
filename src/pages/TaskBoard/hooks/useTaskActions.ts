import { useState, useEffect } from 'react';
import { Task } from '../../../services/task/types/task.types';
import { createTask, getTasksByDeskId, updateTask, deleteTask } from '../../../services/task/Task';
import { StatusType } from '../types';

export const useTaskActions = (deskId: number) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Record<number, Date | null>>({});

  // Загрузка задач
  useEffect(() => {
    const loadTasks = async () => {
      if (!deskId) return;

      setLoading(true);
      try {
        const fetchedTasks = await getTasksByDeskId(deskId);
        setTasks(fetchedTasks || []);
      } catch (error) {
        console.error('Ошибка при загрузке задач:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [deskId]);

  // Инициализация дат из загруженных задач
  useEffect(() => {
    if (!loading && tasks.length > 0) {
      const datesMap: Record<number, Date | null> = {};
      
      tasks.forEach(task => {
        if (task.taskId && task.taskFinishDate) {
          datesMap[task.taskId] = new Date(task.taskFinishDate);
          console.log(`Задача ${task.taskId} имеет дату: ${task.taskFinishDate}`);
        }
      });
      
      setSelectedDate(datesMap);
    }
  }, [loading, tasks]);

  // Создание новой задачи
  const handleCreateTask = async (statusId: number, taskText: string, statusType: string) => {
    try {
      const newTask = await createTask(deskId, taskText.trim(), statusType);
      setTasks(prev => [...prev, newTask]);
      return true;
    } catch (error) {
      console.error('Ошибка при создании задачи:', error);
      return false;
    }
  };

  // Обновление статуса задачи
  const handleUpdateTaskStatus = async (taskId: number, statusType: string) => {
    try {
      // Если перемещаем в статус COMPLETED
      if (statusType === StatusType.COMPLETED) {
        // Устанавливаем текущую дату завершения
        const today = new Date();
        
        const updatedTask = await updateTask(deskId, taskId, { 
          statusType,
          taskFinishDate: today.toISOString()
        });
        
        setTasks(prev => prev.map(t => 
          t.taskId === taskId ? updatedTask : t
        ));
        
        // Обновляем локальное состояние даты
        setSelectedDate(prev => ({
          ...prev,
          [taskId]: today
        }));
        
        console.log(`Задача ${taskId} перемещена в статус ${statusType} с датой: ${today.toISOString()}`);
      } else {
        // Для других статусов - стандартная логика без изменения даты
        const updatedTask = await updateTask(deskId, taskId, { statusType });
        
        setTasks(prev => prev.map(t => 
          t.taskId === taskId ? updatedTask : t
        ));
      }
      
      return true;
    } catch (error) {
      console.error('Ошибка при обновлении статуса задачи:', error);
      return false;
    }
  };

  // Обновление даты окончания
  const handleUpdateTaskDate = async (taskId: number, date: Date | null) => {
    try {
      // Обновляем локальное состояние
      setSelectedDate(prev => ({
        ...prev,
        [taskId]: date
      }));
      
      // Отправляем запрос на обновление даты окончания
      if (date) {
        await updateTask(deskId, taskId, {
          taskFinishDate: date.toISOString() // Убедитесь, что имя поля совпадает с API
        });
        console.log(`Дата ${date.toISOString()} сохранена для задачи ${taskId}`);
      } else {
        await updateTask(deskId, taskId, {
          taskFinishDate: null // Очищаем дату
        });
        console.log(`Дата очищена для задачи ${taskId}`);
      }
      
      return true;
    } catch (error) {
      console.error('Ошибка при обновлении даты:', error);
      return false;
    }
  };

  // Завершение задачи
  const handleCompleteTask = async (taskId: number) => {
    try {
      const taskToUpdate = tasks.find(t => t.taskId === taskId);
      if (!taskToUpdate) return false;
      
      // Если задача не в статусе COMPLETED, меняем на COMPLETED
      if (taskToUpdate.statusType !== StatusType.COMPLETED) {
        // Сначала устанавливаем текущую дату завершения, если её нет
        const today = new Date();
        
        // Обновляем задачу с новым статусом и датой завершения
        const updatedTask = await updateTask(deskId, taskId, { 
          statusType: StatusType.COMPLETED,
          taskFinishDate: today.toISOString() // Добавляем текущую дату завершения
        });
        
        // Обновляем локальное состояние
        setTasks(prev => prev.map(t => 
          t.taskId === taskId ? updatedTask : t
        ));
        
        // Обновляем локальное состояние даты
        setSelectedDate(prev => ({
          ...prev,
          [taskId]: today
        }));
        
        console.log(`Задача ${taskId} завершена с датой: ${today.toISOString()}`);
      }
      return true;
    } catch (error) {
      console.error('Ошибка при завершении задачи:', error);
      return false;
    }
  };

  // Удаление задачи
  const handleDeleteTask = async (taskId: number) => {
    try {
      await deleteTask(deskId, taskId);
      setTasks(prev => prev.filter(t => t.taskId !== taskId));
      return true;
    } catch (error) {
      console.error('Ошибка при удалении задачи:', error);
      return false;
    }
  };

  // Получение задач по статусу
  const getTasksByStatus = (statusType: string) => {
    return tasks.filter(task => task.statusType === statusType);
  };

  return {
    tasks,
    loading,
    selectedDate,
    getTasksByStatus,
    handleCreateTask,
    handleUpdateTaskStatus,
    handleUpdateTaskDate,
    handleCompleteTask,
    handleDeleteTask
  };
};
