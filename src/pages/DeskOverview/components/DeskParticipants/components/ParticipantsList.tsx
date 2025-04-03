import React from 'react';
import { ParticipantsListProps } from '../types';
import ParticipantItem from './ParticipantItem';

const ParticipantsList: React.FC<ParticipantsListProps> = ({ participants }) => {
  return (
    <div className='space-y-3'>
      {participants.map((user) => (
        <ParticipantItem key={user.id} user={user} />
      ))}
    </div>
  );
};

export default ParticipantsList;
