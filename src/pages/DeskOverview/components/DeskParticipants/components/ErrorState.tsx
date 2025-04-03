import React from 'react';

interface ErrorStateProps {
  error: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error }) => {
  return (
    <div className='text-center py-4 text-red-500'>{error}</div>
  );
};

export default ErrorState;
