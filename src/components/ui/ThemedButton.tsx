import React from 'react'

interface ThemedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const ThemedButton: React.FC<ThemedButtonProps> = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <button 
      className={`text-white transition-all duration-300 ease-in-out cursor-pointer ${className}`}
      style={{
        backgroundColor: 'var(--theme-color, #14b8a6)',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--theme-color-dark, #0d9488)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--theme-color, #14b8a6)';
      }}
      {...props}
    >
      {children}
    </button>
  );
}; 