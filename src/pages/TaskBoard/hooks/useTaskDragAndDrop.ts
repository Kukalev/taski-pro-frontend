import { useState, useEffect } from 'react';
import { Task } from '../../../services/task/types/task.types';

export const useTaskDragAndDrop = () => {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dropTarget, setDropTarget] = useState<{statusType: string, index: number} | null>(null);
  const [showDropZone, setShowDropZone] = useState(false);
  const [dropZoneHovered, setDropZoneHovered] = useState(false);

  // Установка глобальных обработчиков событий
  useEffect(() => {
    const handleDocumentDragStart = () => {
      setShowDropZone(true);
    };
    
    const handleDocumentDragEnd = () => {
      setShowDropZone(false);
      setDropZoneHovered(false);
    };
    
    document.addEventListener('dragstart', handleDocumentDragStart);
    document.addEventListener('dragend', handleDocumentDragEnd);
    
    return () => {
      document.removeEventListener('dragstart', handleDocumentDragStart);
      document.removeEventListener('dragend', handleDocumentDragEnd);
    };
  }, []);

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(task));
    setDraggedTask(task);
    setShowDropZone(true);
    
    if (e.currentTarget instanceof HTMLElement) {
      const element = e.currentTarget;
      setTimeout(() => {
        if (element && document.body.contains(element)) {
          element.style.opacity = '0.4';
        }
      }, 0);
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedTask(null);
    setDropTarget(null);
    setShowDropZone(false);
    setDropZoneHovered(false);
    
    if (e.currentTarget instanceof HTMLElement) {
      const element = e.currentTarget;
      if (element && document.body.contains(element)) {
        element.style.opacity = '1';
      }
    }
  };

  const handleTaskDragOver = (e: React.DragEvent, statusType: string, tasks: Task[]) => {
    e.preventDefault();
    if (!draggedTask) return;
    
    const column = e.currentTarget;
    const columnRect = column.getBoundingClientRect();
    const mouseY = e.clientY - columnRect.top;
    
    if (mouseY < 50) {
      setDropTarget({ statusType, index: 0 });
      return;
    }
    
    const taskCards = Array.from(column.querySelectorAll('.task-card'));
    
    if (taskCards.length === 0) {
      setDropTarget({ statusType, index: 0 });
      return;
    }
    
    for (let i = 0; i < taskCards.length; i++) {
      const card = taskCards[i];
      const cardRect = card.getBoundingClientRect();
      const cardMiddle = cardRect.top + cardRect.height / 2 - columnRect.top;
      
      if (mouseY < cardMiddle) {
        setDropTarget({ statusType, index: i });
        return;
      }
    }
    
    setDropTarget({ statusType, index: tasks.length });
  };

  const handleDropZoneDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDropZoneHovered(true);
  };

  const handleDropZoneDragLeave = () => {
    setDropZoneHovered(false);
  };

  return {
    draggedTask,
    dropTarget,
    showDropZone,
    dropZoneHovered,
    setDraggedTask,
    setDropTarget,
    setShowDropZone,
    setDropZoneHovered,
    handleDragStart,
    handleDragEnd,
    handleTaskDragOver,
    handleDropZoneDragOver,
    handleDropZoneDragLeave
  };
};
