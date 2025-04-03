import React, { useEffect } from 'react'
import {EditModeProps} from '../types'
import SaveIndicator from './SaveIndicator'

const EditMode: React.FC<EditModeProps> = ({
	editedDescription,
	handleChange,
	handleBlur,
	handleKeyDown,
	handleSave,
	isSaving,
	textareaRef
}) => {
	useEffect(() => {
		const timer = setTimeout(() => {
			handleSave();
		}, 1000);
		
		return () => clearTimeout(timer);
	}, [editedDescription, handleSave]);

	return (
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
			<SaveIndicator isSaving={isSaving} />
		</div>
	);
};

export default EditMode;