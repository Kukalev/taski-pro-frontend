import React from 'react';

const LoadingState: React.FC = () => {
  return (
    <div className='text-center py-4'>
      <div className='animate-spin h-6 w-6 border-2 border-blue-500 rounded-full border-t-transparent mx-auto'></div>
      <div className='mt-2 text-sm text-gray-500'>Загрузка участников...</div>
    </div>
  );
};

export default LoadingState;
