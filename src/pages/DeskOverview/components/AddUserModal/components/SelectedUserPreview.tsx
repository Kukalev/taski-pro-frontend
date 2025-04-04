import React from 'react'
import {SelectedUserPreviewProps} from '../types'

const SelectedUserPreview: React.FC<SelectedUserPreviewProps> = ({ 
	selectedUser, 
	handleCancelUserSelection, 
	accessType, 
	setAccessType, 
	getUserInitials 
}) => {
	return (
		<div className="mb-6">
			<label className="block text-sm font-medium text-gray-700 mb-2">
				Выбранный пользователь
			</label>
			<div className="p-3 bg-orange-50 rounded-md flex items-center mb-4">
				<div className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center text-orange-600 mr-3">
					{getUserInitials(selectedUser)}
				</div>
				<div className="flex-grow">
					<div className="font-medium">{selectedUser.username || selectedUser.userName}</div>
					{selectedUser.email && <div className="text-sm text-gray-500">{selectedUser.email}</div>}
				</div>
				<button
					onClick={handleCancelUserSelection}
					className="text-gray-400 hover:text-gray-600 p-1"
				>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
						<path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
					</svg>
				</button>
			</div>

			<label className="block text-sm font-medium text-gray-700 mb-1">
				Тип доступа
			</label>
			<select
				className="w-full p-2 rounded-md bg-gray-50 focus:outline-none cursor-pointer"
				style={{
					border: '1px solid var(--theme-color)',
					'--tw-ring-color': 'var(--theme-color)',
					'--tw-ring-offset-shadow': 'var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color)',
					'--tw-ring-shadow': 'var(--tw-ring-inset) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color)',
					boxShadow: 'var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000)'
				} as React.CSSProperties}
				value={accessType}
				onChange={(e) => setAccessType(e.target.value)}
			>
				<option className='cursor-pointer' value="MEMBER">Участник</option>
				<option className='cursor-pointer' value="CONTRIBUTOR">Редактор</option>
			</select>
		</div>
	);
};

export default SelectedUserPreview;