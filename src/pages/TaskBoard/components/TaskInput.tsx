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
    <div className="relative mb-2">
      <input
        type="text"
        className="w-full p-3 rounded-lg bg-white text-[12px]
        text-gray-150 transition-all duration-200 ease-in-out
        hover:text-gray-300 focus:text-gray-700 focus:bg-gray-100
        focus:outline-none border border-transparent focus:border-gray-100"
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
