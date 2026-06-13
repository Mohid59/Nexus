import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, startAdornment, endAdornment, fullWidth = false, className = '', id, ...props }, ref) => {
    const widthClass = fullWidth ? 'w-full' : '';
    const borderClass = error
      ? 'border-error-500 focus:border-error-500 focus:ring-error-500/35'
      : 'border-line focus:border-primary-500 focus:ring-primary-500/35';

    const inputBase =
      'block w-full rounded-lg border bg-surface text-ink placeholder:text-muted text-sm py-2.5 px-3.5 shadow-soft transition-colors focus:outline-none focus:ring-4';
    const padStart = startAdornment ? 'pl-10' : '';
    const padEnd = endAdornment ? 'pr-10' : '';

    return (
      <div className={`${widthClass} ${className}`}>
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-ink mb-1.5">
            {label}
          </label>
        )}

        <div className="relative">
          {startAdornment && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
              {startAdornment}
            </div>
          )}

          <input ref={ref} id={id} className={`${inputBase} ${borderClass} ${padStart} ${padEnd}`} {...props} />

          {endAdornment && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted">{endAdornment}</div>
          )}
        </div>

        {(error || helperText) && (
          <p className={`mt-1.5 text-sm ${error ? 'text-error-600' : 'text-muted'}`}>{error || helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
