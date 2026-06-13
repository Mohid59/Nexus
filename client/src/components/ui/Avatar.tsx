import React from 'react';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  src: string;
  alt: string;
  size?: AvatarSize;
  className?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
}

const sizeClasses: Record<AvatarSize, string> = {
  xs: 'h-6 w-6',
  sm: 'h-9 w-9',
  md: 'h-11 w-11',
  lg: 'h-14 w-14',
  xl: 'h-20 w-20',
};

const statusColors = {
  online: 'bg-success-500',
  offline: 'bg-gray-400',
  away: 'bg-warning-500',
  busy: 'bg-error-500',
};

const statusSizes: Record<AvatarSize, string> = {
  xs: 'h-1.5 w-1.5',
  sm: 'h-2.5 w-2.5',
  md: 'h-3 w-3',
  lg: 'h-3.5 w-3.5',
  xl: 'h-4 w-4',
};

export const Avatar: React.FC<AvatarProps> = ({ src, alt, size = 'md', className = '', status }) => (
  <div className={`relative inline-block shrink-0 ${className}`}>
    <img
      src={src}
      alt={alt}
      className={`rounded-full object-cover ring-1 ring-line bg-gray-100 ${sizeClasses[size]}`}
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.onerror = null;
        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(alt)}&background=312E81&color=fff`;
      }}
    />
    {status && (
      <span
        className={`absolute bottom-0 right-0 block rounded-full ring-2 ring-surface ${statusColors[status]} ${statusSizes[size]}`}
      />
    )}
  </div>
);
