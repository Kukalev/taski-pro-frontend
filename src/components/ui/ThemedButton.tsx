import React from 'react'

interface ThemedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const ThemedButton: React.FC<ThemedButtonProps> = ({ 
  children, 
  className = '', 
  disabled,
  ...props 
}) => {
  const buttonStyle: React.CSSProperties = {
    backgroundColor: disabled ? '#e5e7eb' : 'var(--theme-color, #14b8a6)',
    color: disabled ? '#9ca3af' : 'white',
    cursor: disabled ? 'default' : 'pointer',
  };

  const handleMouseOver = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      e.currentTarget.style.backgroundColor = 'var(--theme-color-dark, #0d9488)';
    }
  };

  const handleMouseOut = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      e.currentTarget.style.backgroundColor = 'var(--theme-color, #14b8a6)';
    }
  };

  return (
    <button 
      className={`transition-all duration-300 ease-in-out ${className}`}
      style={buttonStyle}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}; 