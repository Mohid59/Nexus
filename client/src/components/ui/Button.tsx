import React from 'react';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'outline'
  | 'ghost'
  | 'link'
  | 'success'
  | 'warning'
  | 'error';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const baseStyles =
  'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';

const sizeStyles: Record<ButtonSize, string> = {
  xs: 'text-xs px-2.5 py-1 gap-1.5',
  sm: 'text-sm px-3 py-1.5 gap-1.5',
  md: 'text-sm px-4 py-2.5 gap-2',
  lg: 'text-base px-5 py-2.5 gap-2',
  xl: 'text-base px-6 py-3 gap-2.5',
};

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary-700 text-white hover:bg-primary-800 focus-visible:ring-primary-500 shadow-soft',
  secondary: 'bg-secondary-700 text-white hover:bg-secondary-800 focus-visible:ring-secondary-500 shadow-soft',
  accent: 'bg-accent-500 text-white hover:bg-accent-600 focus-visible:ring-accent-400 shadow-soft',
  outline: 'border border-line bg-surface text-ink hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:ring-primary-500',
  ghost: 'bg-transparent text-ink hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:ring-primary-500',
  link: 'bg-transparent text-primary-700 hover:text-primary-800 hover:underline underline-offset-4 p-0 focus-visible:ring-primary-500',
  success: 'bg-success-500 text-white hover:bg-success-600 focus-visible:ring-success-500 shadow-soft',
  warning: 'bg-warning-500 text-white hover:bg-warning-600 focus-visible:ring-warning-500 shadow-soft',
  error: 'bg-error-500 text-white hover:bg-error-600 focus-visible:ring-error-500 shadow-soft',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const widthClass = fullWidth ? 'w-full' : '';
  const loadingClass = isLoading ? 'cursor-wait' : '';

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthClass} ${loadingClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-0.5 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {!isLoading && leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
};
