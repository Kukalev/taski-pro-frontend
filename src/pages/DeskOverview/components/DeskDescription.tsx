import React, { useState, useEffect, useRef } from 'react';
import { DeskService } from '../../../services/desk/Desk';

interface DeskDescriptionProps {
  desk: {
    id: number;
    deskName: string;
    description?: string;
    deskDescription?: string;
    deskFinishDate?: Date | null;
  };
  onDescriptionUpdate?: (newDescription: string) => void;
  isLoading?: boolean;
}

const DeskDescription: React.FC<DeskDescriptionProps> = ({
  desk,
  onDescriptionUpdate,
  isLoading = false,
}) => {
  // Используем либо deskDescription, либо description, что найдется
  const currentDescription = desk.deskDescription || desk.description || '';
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState(currentDescription);
  const [isSaving, setIsSaving] = useState(false);
  const [containerHeight, setContainerHeight] = useState<number | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Запоминаем исходную высоту контейнера при первом рендере
  useEffect(() => {
    if (containerRef.current && !containerHeight) {
      setContainerHeight(containerRef.current.offsetHeight);
    }
  }, [containerHeight]);

  // Обновляем состояние при изменении пропсов
  useEffect(() => {
    setEditedDescription(currentDescription);
  }, [currentDescription]);

  // Фокус на текстовом поле при входе в режим редактирования
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      const length = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(length, length);
    }
  }, [isEditing]);

  const handleEdit = () => {
    if (isLoading || isSaving) return;
    setIsEditing(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedDescription(e.target.value);
  };

  const handleSave = async () => {
    if (!desk.id) return;
    
    if (editedDescription === currentDescription) {
      setIsEditing(false);
      return;
    }
    
    setIsSaving(true);
    try {
      console.log('Сохраняем описание:', editedDescription);
      
      // Обновляем только описание, сохраняя остальные поля
      const updateData = {
        deskName: desk.deskName || '',
        deskDescription: editedDescription,
        deskFinishDate: desk.deskFinishDate || null
      };
      
      await DeskService.updateDesk(Number(desk.id), updateData);
      
      // Уведомляем родительский компонент об обновлении, если нужно
      if (onDescriptionUpdate) {
        onDescriptionUpdate(editedDescription);
      }
      
      console.log('Описание успешно обновлено');
    } catch (error) {
      console.error('Ошибка при обновлении описания:', error);
      // Возвращаем предыдущее описание в случае ошибки
      setEditedDescription(currentDescription);
    } finally {
      setIsSaving(false);
      setIsEditing(false);
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setEditedDescription(currentDescription);
      setIsEditing(false);
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSave();
    }
  };

  return (
    <div className="max-w-4xl mx-auto mb-6">
      <h2 className="text-lg font-medium mb-2">Описание</h2>
      
      {/* Контейнер с фиксированной высотой */}
      <div 
        ref={containerRef}
        style={{ 
          minHeight: containerHeight ? `${containerHeight}px` : '100px',
          height: 'auto'
        }}
      >
        {isEditing ? (
          <div className="relative h-full">
            <textarea
              ref={textareaRef}
              value={editedDescription}
              onChange={handleChange}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="w-full h-full p-0 bg-transparent outline-none resize-none"
              placeholder="Добавьте описание доски..."
              disabled={isSaving}
              style={{
                fontFamily: 'inherit',
                fontSize: 'inherit',
                lineHeight: 'inherit',
                overflowY: 'hidden' // Скрываем скроллбар
              }}
            />
            {isSaving && (
              <div className="absolute top-2 right-2 text-blue-500">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
          </div>
        ) : (
          <div
            onClick={handleEdit}
            className="h-full cursor-text"
          >
            {currentDescription ? (
              <p className="whitespace-pre-wrap">{currentDescription}</p>
            ) : (
              <p className="text-gray-400">Добавьте описание доски...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeskDescription;


