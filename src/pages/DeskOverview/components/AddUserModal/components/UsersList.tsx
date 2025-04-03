import React from 'react'
import {UsersListProps, UserResponseDto} from '../types'

const UsersList: React.FC<UsersListProps> = ({ filteredUsers, handleSelectUser, getUserInitials }) => {
	return (
		<>
			{filteredUsers.length > 0 && (
				<div className="mt-1 border border-gray-200 rounded-md max-h-60 overflow-y-auto shadow-lg bg-white z-10">
					{filteredUsers.map((user) => (
						<div
							key={user.id || user.username}
							className="p-2 hover:bg-orange-50 cursor-pointer flex items-center border-b border-gray-100 last:border-0"
							onClick={() => handleSelectUser(user)}
						>
							<div className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center text-orange-600 mr-2">
								{getUserInitials(user)}
							</div>
							<div className="flex-grow">
								<div className="font-medium">{user.username || user.userName}</div>
								{user.email && <div className="text-xs text-gray-500">{user.email}</div>}
							</div>
						</div>
					))}
				</div>
			)}
		</>
	);
};

export default UsersList;