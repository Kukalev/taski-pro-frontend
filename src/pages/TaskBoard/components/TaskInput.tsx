import React from 'react';
import { TaskInputProps } from '../types';

const TaskInput: React.FC<TaskInputProps> = ({
  statusId,
  value,
  onChange,
  onKeyDown,
  autoFocus
}) => {
  return (
    <div className="relative">
      <input
        type="text"
        className="w-full h-10 px-3 rounded-lg bg-white text-[12px]
        text-gray-500 border border-gray-200 focus:border-gray-300
        hover:border-gray-300 focus:outline-none"
        placeholder="Добавить задачу..."
        value={value}
        onChange={(e) => onChange(statusId, e.target.value)}
        onKeyDown={(e) => onKeyDown(e, statusId)}
        autoFocus={autoFocus}
      />
    </div>
  );
};

export default TaskInput;
