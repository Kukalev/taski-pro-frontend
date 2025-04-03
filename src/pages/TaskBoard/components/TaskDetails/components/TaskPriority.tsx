import React, {useEffect, useRef, useState} from 'react'
import {BsFlag} from 'react-icons/bs'
import {updateTask} from '../../../../../services/task/Task'

interface TaskPriorityProps {
  priorityType?: string;
  taskId?: number;
  deskId?: number;
  onPriorityChange?: (priority: string) => void;
  canEdit?: boolean;
}

const TaskPriority: React.FC<TaskPriorityProps> = (props) => {
  const { 
    priorityType = '', 
    taskId, 
    deskId,
    onPriorityChange,
    canEdit = true
  } = props;
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [localPriority, setLocalPriority] = useState(priorityType);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Для отладки: проверяем полученные props
    console.log("TaskPriority props:", { priorityType, taskId, deskId });
    setLocalPriority(priorityType);
  }, [priorityType, taskId, deskId]);
  
  // Закрытие выпадающего списка при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const getPriorityDisplay = () => {
    if (!localPriority) return "Выбрать...";
    
    switch (localPriority.toUpperCase()) {
      case "HIGH": return "высокий";
      case "MEDIUM": return "средний";
      case "LOW": return "низкий";
      case "FROZEN": return "замороженный";
      default: return "Без приоритета";
    }
  };
  
  const getPriorityColor = () => {
    if (!localPriority) return "text-gray-500";
    
    switch (localPriority.toUpperCase()) {
      case "HIGH": return "text-red-500";
      case "MEDIUM": return "text-yellow-500";
      case "LOW": return "text-green-500";
      case "FROZEN": return "text-blue-400";
      default: return "text-gray-500";
    }
  };
  
  const handlePriorityChange = (newPriority: string) => {
    if (!canEdit) return;
    
    // Сразу обновляем UI для лучшего UX
    setLocalPriority(newPriority);
    setIsDropdownOpen(false);
    
    // Используем callback если он предоставлен
    if (onPriorityChange) {
      onPriorityChange(newPriority);
      return;
    }
    
    // Проверяем наличие ID перед вызовом API
    if (!taskId || !deskId) {
      console.warn("Невозможно обновить приоритет: taskId или deskId не определены", { taskId, deskId });
      return;
    }
    
    // Выполняем обновление через API только если есть ID
    updateTask(deskId, taskId, {
      priorityType: newPriority
    }).catch(error => {
      console.error('Ошибка при обновлении приоритета:', error);
    });
  };
  
  return (
    <div 
      className="flex items-center py-2 border-b border-gray-100 relative"
      ref={dropdownRef}
    >
      <div className="w-6 flex justify-center text-gray-400">
        <BsFlag size={18} />
      </div>
      <div className="flex items-center ml-4 w-full">
        <span className="text-gray-500 mr-2">Приоритет</span>
        <div 
          className={`${canEdit ? 'cursor-pointer' : 'cursor-default'} px-2 py-1 rounded-md ${getPriorityColor()}`}
          onClick={() => canEdit && setIsDropdownOpen(!isDropdownOpen)}
        >
          {getPriorityDisplay()}
        </div>
      </div>
      
      {isDropdownOpen && canEdit && (
        <div className="absolute top-full left-0 mt-1 bg-white rounded-md shadow-md z-10 w-56 border border-gray-200">
          <div className="p-2">
            <div 
              className="py-2 px-3 hover:bg-gray-50 rounded cursor-pointer text-gray-600"
              onClick={() => handlePriorityChange("")}
            >
              Без приоритета
            </div>
            
            <div 
              className="py-2 px-3 hover:bg-gray-50 rounded cursor-pointer flex items-center"
              onClick={() => handlePriorityChange("HIGH")}
            >
              <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
              <span className="text-red-500">высокий</span>
            </div>
            
            <div 
              className="py-2 px-3 hover:bg-gray-50 rounded cursor-pointer flex items-center"
              onClick={() => handlePriorityChange("MEDIUM")}
            >
              <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
              <span className="text-yellow-500">средний</span>
            </div>
            
            <div 
              className="py-2 px-3 hover:bg-gray-50 rounded cursor-pointer flex items-center"
              onClick={() => handlePriorityChange("LOW")}
            >
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              <span className="text-green-500">низкий</span>
            </div>
            
            <div 
              className="py-2 px-3 hover:bg-gray-50 rounded cursor-pointer flex items-center"
              onClick={() => handlePriorityChange("FROZEN")}
            >
              <span className="w-3 h-3 bg-blue-400 rounded-full mr-2"></span>
              <span className="text-blue-400">замороженный</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskPriority;