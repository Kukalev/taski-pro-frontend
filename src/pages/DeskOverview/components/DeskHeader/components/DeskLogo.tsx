import React from 'react'
import {DeskLogoProps} from '../types'

const DeskLogo: React.FC<DeskLogoProps> = ({ deskName }) => {
  const getFirstLetter = () => {
    if (!deskName) return 'A';
    return deskName.charAt(0).toUpperCase();
  };

  return (
    <div className='w-28 h-28 bg-pink-200 rounded-2xl flex items-center justify-center
    text-pink-600 text-5xl mb-3'>
      {getFirstLetter()}
    </div>
  );
};

export default DeskLogo;