import React from 'react'
import {AuthService} from '../../../../../services/auth/Auth';

interface TaskNameProps {
  taskName: string;
  isCompleted: boolean;
  isEditingName: boolean;
  setIsEditingName: (value: boolean) => void;
  setTaskName: (value: string) => void;
  onSave: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
  canEdit?: boolean;
}

const TaskName: React.FC<TaskNameProps> = ({
  taskName,
  isCompleted,
  isEditingName,
  setIsEditingName,
  setTaskName,
  onSave,
  inputRef,
  canEdit = true
}) => {
  return (
    <div className="mb-4">
      {isEditingName ? (
        <input
          ref={inputRef}
          type="text"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          onBlur={onSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSave();
            if (e.key === 'Escape') {
              setTaskName(taskName);
              setIsEditingName(false);
            }
          }}
          className="w-full p-2 text-2xl font-medium border-none outline-none"
          placeholder="Введите название задачи..."
          autoFocus
        />
      ) : (
        <h1 
          className={`text-2xl font-medium p-2 ${
            isCompleted ? 'text-gray-500' : 'text-gray-800'
          }`}
          onClick={() => canEdit && setIsEditingName(true)}
          style={{ cursor: canEdit ? 'pointer' : 'default' }}
        >
          {taskName}
        </h1>
      )}
    </div>
  );
};

export default TaskName;