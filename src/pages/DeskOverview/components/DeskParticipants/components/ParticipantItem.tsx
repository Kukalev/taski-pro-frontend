import React from 'react';
import { ParticipantItemProps } from '../types';
import { getUserName, getUserInitials, getRoleDisplayName, getRoleBadgeClass } from '../utilities';

const ParticipantItem: React.FC<ParticipantItemProps> = ({ user }) => {
  return (
    <div className='flex items-center justify-between p-2 hover:bg-gray-50 rounded'>
      <div className='flex items-center'>
        <div className='w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center text-purple-600 mr-3'>
          {getUserInitials(user)}
        </div>
        <div className='font-medium'>{getUserName(user)}</div>
      </div>
      
      <div className={`px-3 py-1 rounded-full text-xs ${getRoleBadgeClass(user.rightType || '')}`}>
        {getRoleDisplayName(user.rightType || '')}
      </div>
    </div>
  );
};

export default ParticipantItem;
