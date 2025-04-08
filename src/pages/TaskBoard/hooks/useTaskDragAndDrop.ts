import { useState, useEffect, useRef, useCallback } from 'react';
import { Task } from '../../../services/task/types/task.types';

export const useTaskDragAndDrop = () => {
  const [_draggedTask, _setDraggedTask] = useState<Task | null>(null);
  const [_dropTarget, _setDropTarget] = useState<{statusType: string, index: number} | null>(null);
  const [_showDropZone, _setShowDropZone] = useState(false);
  const [_dropZoneHovered, _setDropZoneHovered] = useState(false);

  const setDraggedTaskRef = useRef(_setDraggedTask);
  const setDropTargetRef = useRef(_setDropTarget);
  const setDropZoneHoveredRef = useRef(_setDropZoneHovered);

  useEffect(() => {
    setDraggedTaskRef.current = _setDraggedTask;
    setDropTargetRef.current = _setDropTarget;
    setDropZoneHoveredRef.current = _setDropZoneHovered;
  }, [_setDraggedTask, _setDropTarget, _setDropZoneHovered]);

  const isDraggingRef = useRef(false);

  useEffect(() => {
    const handleDocumentDragStart = (event: DragEvent) => {
      const targetElement = event.target as HTMLElement;
      if (!targetElement.closest('[draggable="true"]')) return;

      console.log('[Global DragStart] Started.');
      isDraggingRef.current = true;
      _setShowDropZone(true);
      console.log('[Global DragStart] Called _setShowDropZone(true)');
    };

    const handleDocumentDragEnd = (event: DragEvent) => {
       if (!isDraggingRef.current) {
         console.log('[Global DragEnd] Ignored: No active drag by ref.');
         return;
       }
       console.log('[Global DragEnd] Fired.');
       isDraggingRef.current = false;

       setTimeout(() => {
         console.log('[Global DragEnd - setTimeout] Resetting ALL DND state...');
         setDraggedTaskRef.current(null);
         setDropTargetRef.current(null);
         _setShowDropZone(false);
         setDropZoneHoveredRef.current(false);
         console.log('[Global DragEnd - setTimeout] Called _setShowDropZone(false)');
       }, 0);
    };

    console.log('[useTaskDragAndDrop Effect] Adding global listeners (ONCE)');
    document.addEventListener('dragstart', handleDocumentDragStart);
    document.addEventListener('dragend', handleDocumentDragEnd);

    return () => {
      console.log('[useTaskDragAndDrop Effect] Removing global listeners (ONCE)');
      document.removeEventListener('dragstart', handleDocumentDragStart);
      document.removeEventListener('dragend', handleDocumentDragEnd);
      isDraggingRef.current = false;
    };
  }, []);

  const setDropTarget = useCallback((target: {statusType: string, index: number} | null) => {
    _setDropTarget(target);
  }, []);

  const setDropZoneHovered = useCallback((isHovered: boolean) => {
    _setDropZoneHovered(isHovered);
  }, []);

  const handleDragStart = useCallback((e: React.DragEvent, task: Task) => {
     console.log('[Hook handleDragStart] Setting draggedTask:', task.taskId);
     try {
         e.dataTransfer.setData('text/plain', JSON.stringify(task));
         e.dataTransfer.effectAllowed = "move";
     } catch (err) { console.error("Failed to set drag data:", err); }
     _setDraggedTask(task);
  }, []);

  return {
    draggedTask: _draggedTask,
    dropTarget: _dropTarget,
    showDropZone: _showDropZone,
    dropZoneHovered: _dropZoneHovered,
    setShowDropZone: _setShowDropZone,
    setDropTarget,
    setDropZoneHovered,
    handleDragStart,
  };
};
