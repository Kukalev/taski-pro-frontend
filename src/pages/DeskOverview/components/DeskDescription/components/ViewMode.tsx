import React from 'react'
import {ViewModeProps} from '../types'

const ViewMode: React.FC<ViewModeProps> = ({ currentDescription, handleEdit }) => {
	return (
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
	);
};

export default ViewMode;