import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, hoverable = false }) => {
  const interactive = hoverable || onClick;
  const interactiveClass = interactive
    ? 'transition-all duration-300 hover:shadow-lift hover:-translate-y-0.5 cursor-pointer'
    : '';

  return (
    <div
      className={`bg-surface rounded-2xl border border-line shadow-card overflow-hidden ${interactiveClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

interface CardSectionProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardSectionProps> = ({ children, className = '' }) => (
  <div className={`px-6 py-5 border-b border-line ${className}`}>{children}</div>
);

export const CardBody: React.FC<CardSectionProps> = ({ children, className = '' }) => (
  <div className={`px-6 py-5 ${className}`}>{children}</div>
);

export const CardFooter: React.FC<CardSectionProps> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-t border-line bg-paper/60 ${className}`}>{children}</div>
);
