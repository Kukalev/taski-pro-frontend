interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  fullWidth?: boolean;
}

export const Button = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false,
  ...props 
}: ButtonProps) => {
  return (
    <button
      {...props}
      className={`rounded-lg px-6 py-3 font-medium transition duration-200 cursor-pointer
      ${fullWidth ? 'w-full' : ''}
      ${variant === 'primary' 
        ? 'bg-blue-500 text-white hover:bg-blue-600' 
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {children}
    </button>
  );
};