import React from 'react';
import { ParticipantsListProps } from '../types';
import ParticipantItem from './ParticipantItem';

const ParticipantsList: React.FC<ParticipantsListProps> = ({ 
  participants, 
  onDeleteUser, 
  onUpdateUserRole,
  currentUserRole
}) => {
  return (
    <div className='space-y-3'>
      {participants.map((user) => (
        <ParticipantItem 
          key={user.id} 
          user={user} 
          onDeleteUser={onDeleteUser}
          onUpdateUserRole={onUpdateUserRole}
          currentUserRole={currentUserRole}
        />
      ))}
    </div>
  );
};

export default ParticipantsList;
