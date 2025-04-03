import React from 'react'

interface TaskDetailsHeaderProps {
  taskNumber: number;
  onClose: () => void;
}

const TaskDetailsHeader: React.FC<TaskDetailsHeaderProps> = ({ taskNumber, onClose }) => {
  return (
    <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center z-10">
      <div className="flex items-center">
        <span className="text-gray-500 mr-1">#</span>
        <span className="text-gray-700 font-medium">{taskNumber}</span>
      </div>
      

      
      <div className="flex space-x-3">
        <button
          className="text-gray-500 hover:text-orange-500 p-1 cursor-pointer mr-2"
          onClick={onClose}
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default TaskDetailsHeader;