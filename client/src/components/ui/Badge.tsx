import React from 'react';

export type BadgeVariant = 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'gray';
export type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  rounded?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
  primary: 'bg-primary-100 text-primary-800',
  secondary: 'bg-secondary-100 text-secondary-800',
  accent: 'bg-accent-100 text-accent-800',
  success: 'bg-success-100 text-success-700',
  warning: 'bg-warning-100 text-warning-700',
  error: 'bg-error-100 text-error-700',
  gray: 'bg-gray-100 text-gray-700',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'text-2xs px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
  lg: 'text-sm px-3 py-1',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  rounded = false,
  className = '',
  ...rest
}) => {
  const roundedClass = rounded ? 'rounded-full' : 'rounded-md';
  const clickableClass = rest.onClick ? 'cursor-pointer transition hover:opacity-80' : '';

  return (
    <span
      className={`inline-flex items-center font-semibold tracking-wide ${roundedClass} ${variantClasses[variant]} ${sizeClasses[size]} ${clickableClass} ${className}`}
      {...rest}
    >
      {children}
    </span>
  );
};
