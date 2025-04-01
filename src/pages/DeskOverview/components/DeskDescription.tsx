import React, { useState, useRef, useEffect } from 'react';
import { DeskData } from '../../../components/sidebar/types/sidebar.types';

interface DeskDescriptionProps {
  desk: DeskData;
  onDeskUpdate: (updatedDesk: Partial<DeskData>) => void;
  isLoading?: boolean;
  updateDeskDescription: (description: string) => Promise<void>;
}

const DeskDescription: React.FC<DeskDescriptionProps> = ({ 
  desk, 
  onDeskUpdate, 
  isLoading, 
  updateDeskDescription 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState(desk.deskDescription || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);
  
  useEffect(() => {
    setEditedDescription(desk.deskDescription || '');
  }, [desk.deskDescription]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleBlur = async () => {
    if (editedDescription !== desk.deskDescription) {
      setIsSaving(true);
      await updateDeskDescription(editedDescription);
      setIsSaving(false);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsEditing(false);
      setEditedDescription(desk.deskDescription || '');
    } else if (e.key === 'Enter' && e.ctrlKey) {
      handleBlur();
    }
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-2">Описание</h3>
      
      {isEditing ? (
        <div>
          <textarea
            ref={textareaRef}
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
            placeholder="Добавьте описание доски..."
            disabled={isLoading || isSaving}
          />
          {isSaving && (
            <div className="flex items-center mt-2 text-sm text-gray-500">
              <div className="mr-2 animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
              Сохранение...
            </div>
          )}
        </div>
      ) : (
        <div 
          className="p-2 border border-transparent hover:border-gray-200 rounded-md cursor-pointer min-h-[40px]"
          onClick={handleEdit}
        >
          {desk.deskDescription ? (
            <p className="text-gray-700">{desk.deskDescription}</p>
          ) : (
            <p className="text-gray-400 italic">Добавьте описание доски...</p>
          )}
        </div>
      )}
    </div>
  );
};

export default DeskDescription;


