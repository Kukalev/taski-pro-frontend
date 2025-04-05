import { useState, useEffect } from 'react';
import { Task } from '../../../services/task/types/task.types';

export const useTaskDragAndDrop = () => {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dropTarget, setDropTarget] = useState<{statusType: string, index: number} | null>(null);
  const [showDropZone, setShowDropZone] = useState(false);
  const [dropZoneHovered, setDropZoneHovered] = useState(false);

  // Оставляем useEffect для глобальных обработчиков dragstart/dragend,
  // чтобы управлять видимостью DeleteZone
  useEffect(() => {
    const handleDocumentDragStart = () => {
      // Небольшая задержка, чтобы DND успел инициализироваться
      setTimeout(() => setShowDropZone(true), 50);
    };

    const handleDocumentDragEnd = () => {
      // Сбрасываем все при окончании любого DND
      setDraggedTask(null);
      setDropTarget(null);
      setShowDropZone(false);
      setDropZoneHovered(false);
      // console.log('[Global DragEnd] Resetting all DND state');
    };

    document.addEventListener('dragstart', handleDocumentDragStart);
    document.addEventListener('dragend', handleDocumentDragEnd);

    return () => {
      document.removeEventListener('dragstart', handleDocumentDragStart);
      document.removeEventListener('dragend', handleDocumentDragEnd);
    };
  }, []); // Пустой массив зависимостей - выполняется один раз

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    // console.log('[DragStart] Task:', task.taskId);
    // Устанавливаем данные для DND
    try {
        e.dataTransfer.setData('text/plain', JSON.stringify(task));
        e.dataTransfer.effectAllowed = "move"; // Указываем тип операции
    } catch (err) {
        console.error("Failed to set drag data:", err);
    }
    setDraggedTask(task);
    // setShowDropZone(true); // Управляется глобальным listener'ом
  };

  // handleDragEnd больше не нужен здесь, управляется глобально
  // const handleDragEnd = (e: React.DragEvent) => { ... };

  // Убираем handleTaskDragOver, handleDropZoneDragOver, handleDropZoneDragLeave
  // Их логика переедет в компоненты TaskColumn и DeleteZone

  return {
    draggedTask, // Нужен для проверки в TaskColumn/DeleteZone
    dropTarget,  // Нужен для отрисовки индикатора в TaskColumn
    showDropZone, // Нужен для DeleteZone
    dropZoneHovered, // Нужен для DeleteZone
    // сеттеры больше не нужны компонентам напрямую
    // setDraggedTask,
    setDropTarget, // Нужен TaskColumn
    // setShowDropZone,
    setDropZoneHovered, // Нужен DeleteZone
    handleDragStart, // Нужен TaskCard
    // handleDragEnd - убран, глобальный обработчик
  };
};
