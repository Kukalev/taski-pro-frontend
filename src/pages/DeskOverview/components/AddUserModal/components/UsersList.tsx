import React from 'react'
import {UsersListProps} from '../types'
import {UserAvatar} from '../../../../../components/header/components/UserAvatar'

const UsersList: React.FC<UsersListProps> = ({filteredUsers, handleSelectUser, avatarsMap}) => {
	if (filteredUsers.length === 0) {
		return null;
	}

	const safeAvatarsMap = avatarsMap || {};

	return (
		<div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md mt-2">
			{filteredUsers.map((user) => {
				const username = user.username || user.userName || 'N/A';
				const email = user.email || '';
				const avatarUrl = safeAvatarsMap[username] || null;

				return (
					<div
						key={user.id}
						className="flex items-center justify-between p-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
						onClick={() => handleSelectUser(user)}
					>
						<div className="flex items-center overflow-hidden">
							<UserAvatar
								username={username}
								avatarUrl={avatarUrl}
								size="sm"
							/>
							<div className="ml-3 overflow-hidden">
								<span className="block font-medium text-sm truncate">{username}</span>
								{email && <span className="block text-xs text-gray-500 truncate">{email}</span>}
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
};

export default UsersList;