import React from 'react';

interface TaskDescriptionProps {
  taskDescription: string;
  isEditingDescription: boolean;
  setIsEditingDescription: (isEditing: boolean) => void;
  setTaskDescription: (description: string) => void;
  onSave: () => void;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
}

const TaskDescription: React.FC<TaskDescriptionProps> = ({
  taskDescription,
  isEditingDescription,
  setIsEditingDescription,
  setTaskDescription,
  onSave,
  textareaRef
}) => {
  return (
    <div className="mt-4">
      <h3 className="text-lg font-medium text-gray-700 mb-2">Описание</h3>
      
      {isEditingDescription ? (
        <textarea
          ref={textareaRef}
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value)}
          onBlur={onSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
              onSave();
            } else if (e.key === 'Escape') {
              setIsEditingDescription(false);
            }
          }}
          className="w-full min-h-[150px] p-2 text-gray-700 focus:outline-none resize-none"
          placeholder="Добавьте подробное описание задачи..."
          autoFocus
        />
      ) : (
        <div 
          className="text-gray-700 whitespace-pre-wrap p-2 cursor-pointer"
          onClick={() => setIsEditingDescription(true)}
        >
          {taskDescription ? 
            taskDescription : 
            <span className="text-gray-400">Добавьте подробное описание задачи...</span>
          }
        </div>
      )}
    </div>
  );
};

export default TaskDescription;