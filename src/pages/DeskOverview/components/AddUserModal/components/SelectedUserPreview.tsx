import React from 'react'
import { SelectedUserPreviewProps } from '../types'
import { RightType } from '../../../../../services/users/api/UpdateUserFromDesk'
import { UserAvatar } from '../../../../../components/header/components/UserAvatar'

const SelectedUserPreview: React.FC<SelectedUserPreviewProps> = ({
	selectedUser,
	handleCancelUserSelection,
	accessType,
	setAccessType,
	avatarUrl
}) => {
	const username = selectedUser.username || selectedUser.userName || 'N/A'
	const email = selectedUser.email || ''

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-md">
				<div className="flex items-center">
					<UserAvatar
						username={username}
						avatarUrl={avatarUrl}
						size="sm"
					/>
					<div className="ml-3">
						<div className="font-medium text-gray-800">{username}</div>
						{email && <div className="text-xs text-gray-500">{email}</div>}
					</div>
				</div>
				<button
					onClick={handleCancelUserSelection}
					className="text-gray-400 hover:text-red-500 p-1 rounded-full text-xs"
					title="Отменить выбор"
				>
					✕
				</button>
			</div>
			<div>
				<label htmlFor="accessType" className="block text-sm font-medium text-gray-700 mb-1">Права доступа:</label>
				<select
					id="accessType"
					value={accessType}
					onChange={(e) => setAccessType(e.target.value)}
					className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
				>
					<option value={RightType.MEMBER}>Чтение</option>
					<option value={RightType.CONTRIBUTOR}>Редактирование</option>
				</select>
			</div>
		</div>
	)
}

export default SelectedUserPreview