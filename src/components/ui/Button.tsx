interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  fullWidth?: boolean;
  className?: string; // явно добавим prop для className
}

export const Button = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false,
  className = '', // добавим значение по умолчанию
  ...props 
}: ButtonProps) => {
  return (
    <button
      {...props}
      className={`rounded-lg px-6 py-3 font-medium transition duration-200 cursor-pointer items-center
      ${fullWidth ? 'w-full' : ''}
      ${variant === 'primary' 
        ? 'bg-blue-500 text-white hover:bg-blue-600' 
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }
      ${className}`} // добавляем пользовательские классы в конец
    >
      {children}
    </button>
  );
};