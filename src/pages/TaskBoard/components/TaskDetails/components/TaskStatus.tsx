import React from 'react'

interface TaskStatusProps {
  isCompleted: boolean;
  onStatusChange: () => void;
  canEdit?: boolean;
}

const TaskStatus: React.FC<TaskStatusProps> = ({ isCompleted, onStatusChange, canEdit = true }) => {
  return (
    <button 
      className={`${isCompleted 
        ? 'bg-green-50 text-green-500' 
        : 'bg-orange-50 text-orange-500'
      } rounded-lg flex items-center px-3 py-2 ${canEdit ? 'cursor-pointer' : 'cursor-default'} w-fit`}
      onClick={() => canEdit && onStatusChange()}
      disabled={!canEdit}
    >
      <div className={`w-4 h-4 rounded-full bg-white border-2 ${isCompleted ? 'border-green-500 text-green-500' : 'border-orange-500 text-orange-500'} mr-2 flex items-center justify-center`}>
        {isCompleted && (
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      <span className="no-underline">{isCompleted ? 'Выполнено' : 'Выполнить'}</span>
    </button>
  );
};

export default TaskStatus;