import React from 'react'
import {DeskTitleEditorProps} from '../types'

const DeskTitleEditor: React.FC<DeskTitleEditorProps> = ({
	deskName,
	isEditing,
	isLoading,
	editedName,
	setEditedName,
	handleEdit,
	handleBlur,
	handleKeyDown,
	inputRef,
	hasEditPermission = true // По умолчанию права есть
}) => {
	return (
		<div className="w-[350px]">
			{isEditing ? (
				<div className="w-full">
					<input
						ref={inputRef}
						type="text"
						value={editedName}
						onChange={(e) => setEditedName(e.target.value)}
						onKeyDown={handleKeyDown}
						onBlur={handleBlur}
						className="text-2xl font-bold w-full outline-none whitespace-nowrap overflow-hidden text-ellipsis"
						placeholder="Введите название доски"
						disabled={isLoading}
						style={{
							background: 'transparent',
							padding: '0',
							margin: '0',
							border: 'none',
							boxSizing: 'border-box'
						}}
					/>
					{isLoading && (
						<div className="ml-2 animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
					)}
				</div>
			) : (
				<h1
					className={`text-2xl font-bold whitespace-nowrap overflow-hidden text-ellipsis ${hasEditPermission ? 'cursor-text' : 'cursor-default'}`}
					onClick={handleEdit}
				>
					{deskName || 'Без названия'}
				</h1>
			)}
		</div>
	);
};

export default DeskTitleEditor;