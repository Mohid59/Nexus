import React, { useEffect, useRef, useState } from 'react';

export interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({ trigger, children, align = 'right', className = '' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button type="button" onClick={() => setOpen((o) => !o)} className="focus-visible:outline-none">
        {trigger}
      </button>
      {open && (
        <div
          className={`absolute z-40 mt-2 min-w-[12rem] rounded-xl border border-line bg-surface shadow-lift py-1.5 animate-scale-in origin-top ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export const DropdownItem: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { icon?: React.ReactNode }
> = ({ icon, children, className = '', ...props }) => (
  <button
    className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm text-ink hover:bg-gray-100 transition-colors text-left ${className}`}
    {...props}
  >
    {icon && <span className="text-muted">{icon}</span>}
    {children}
  </button>
);

export const DropdownDivider: React.FC = () => <div className="my-1.5 h-px bg-line" />;
