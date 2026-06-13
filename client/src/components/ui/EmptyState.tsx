import React from 'react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action, className = '' }) => (
  <div className={`flex flex-col items-center justify-center text-center py-14 px-6 ${className}`}>
    {icon && (
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-500/10 text-primary-700">
        {icon}
      </div>
    )}
    <h3 className="text-lg font-display font-semibold text-ink">{title}</h3>
    {description && <p className="mt-1.5 text-sm text-muted max-w-sm">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);
